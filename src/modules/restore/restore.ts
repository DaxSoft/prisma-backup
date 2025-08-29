import { PrismaClient } from '@prisma/client';
import {
  PrismaDMMFDataModelBase,
  PrismaDMMFDataModelBaseFields,
  PrismaRestoreArgs,
} from '../../types/prisma-restore.types';
import { HandleError } from '../../decorators/handle-error.decorator';
import { PrismaInsertionOrderError, PrismaInsertModelError, PrismaRestoreError } from './restore-error';
import { omit, pick, sleep, toCamelCase } from '../../utils/utils';
import { Route } from '../path-route';
import { PathRoute } from '@vorlefan/path';

export class PrismaRestore {
  private route: PathRoute = Route;
  private ignored_tables: Set<string> = new Set(['_prisma_migrations']);

  constructor(private readonly prismaClient: PrismaClient, private readonly args: PrismaRestoreArgs) {
    this.route.inject(this.args.folderName, this.args?.isTesting ? 'main' : 'root').alias('@', this.args.folderName);
    this.args?.ignoredTables?.map((table) => this.ignored_tables.add(table));
    this.args.transaction = {
      maxWait: this.args?.transaction?.maxWait ?? 15000,
      timeout: this.args?.transaction?.maxWait ?? 30000,
    };
  }

  @HandleError((cause) => new PrismaRestoreError(cause))
  public async run() {
    const models = await this.getInsertionOrder();

    console.log(models);

    for (const model of models) {
      console.log(model);
      await this.insertModel(model);
      await sleep(this.args?.waitBetweenModels || 1e3);
    }
  }

  @HandleError((cause) => new PrismaInsertModelError(cause))
  protected async insertModel(model: string) {
    const filename = `${model}.json`;
    console.log(filename, this.route.plug('@', filename));

    const content = await this.route.stream().read(this.route.plug('@', filename)!);
    if (!content) {
      throw new Error(`Not found restored json of ${model} model.`);
    }
    const data = JSON.parse(content);
    const rows = data.map((row: Record<any, any>) => omit(row, ['__table_name', '__row_count']));

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`- Table '${model}' is empty. Skipping.`);
      return;
    }

    console.log(rows[0]);

    await this.prismaClient.$transaction(async (tx: any) => {
      const delegate = tx[toCamelCase(model)];
      if (!delegate) {
        throw new Error(`Model '${model}' not found on Prisma Client.`);
      }

      await delegate.createMany({ data: rows });
    }, this.args.transaction);
  }

  @HandleError((cause) => new PrismaInsertionOrderError(cause))
  protected async getInsertionOrder(): Promise<string[]> {
    const models = this.args.baseModels.map((model) => {
      const { fields } = pick(model, ['fields']);
      return {
        name: model.name,
        fields: fields.map((field: any) => {
          const args = pick(field, ['type', 'relationFromFields']);

          return {
            type: args.type,
            relationFromFields: args?.relationFromFields || [],
          } as PrismaDMMFDataModelBaseFields;
        }),
      } as PrismaDMMFDataModelBase;
    });

    const sortedOrder: Set<string> = new Set();
    const modelMap: Map<string, PrismaDMMFDataModelBase> = new Map(models.map((model) => [model.name, model]));
    const dependencies = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const model of models) {
      dependencies.set(model.name, []);
      inDegree.set(model.name, 0);
    }

    for (const model of models) {
      for (const field of model.fields) {
        if (field.relationFromFields && field.relationFromFields.length > 0) {
          const dependencyModelName = field.type;
          if (modelMap.has(dependencyModelName)) {
            dependencies.get(dependencyModelName)!.push(model.name);
            inDegree.set(model.name, (inDegree.get(model.name) || 0) + 1);
          }
        }
      }
    }

    const queue: string[] = [];
    for (const [modelName, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(modelName);
      }
    }

    while (queue.length > 0) {
      const modelName = queue.shift()!;
      if (!this.ignored_tables.has(modelName)) {
        sortedOrder.add(modelName);
      }

      const dependents = dependencies.get(modelName) || [];
      for (const dependent of dependents) {
        inDegree.set(dependent, (inDegree.get(dependent) || 0) - 1);
        if (inDegree.get(dependent) === 0) {
          queue.push(dependent);
        }
      }
    }

    if (sortedOrder.size !== models.length) {
      throw new Error('Circular dependecy error.');
    }

    return Array.from(sortedOrder.values());
  }
}
