import { PrismaClient } from '@prisma/client';
import { PrismaDMMFDataModelBase, PrismaRestoreArgs } from '../../types/prisma-restore.types';
import { HandleError } from '../../decorators/handle-error.decorator';
import { PrismaInsertionOrderError, PrismaRestoreError } from './restore-error';

export class PrismaRestore {
  private ignored_tables: Set<string> = new Set(['_prisma_migrations']);

  constructor(private readonly prismaClient: PrismaClient, private readonly args: PrismaRestoreArgs) {
    this.args?.ignoredTables?.map((table) => this.ignored_tables.add(table));
  }

  @HandleError((cause) => new PrismaRestoreError(cause))
  public async run() {
    const models = await this.getInsertionOrder();

    console.log(models);
  }

  @HandleError((cause) => new PrismaInsertionOrderError(cause))
  protected async getInsertionOrder(): Promise<string[]> {
    const models = this.args.baseModels;
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

    if (sortedOrder.size !== models.length - this.ignored_tables.size) {
      throw new Error(
        'Erro de dependência cíclica detectado no schema do Prisma. Não foi possível determinar a ordem de inserção.'
      );
    }

    return Array.from(sortedOrder.values());
  }
}
