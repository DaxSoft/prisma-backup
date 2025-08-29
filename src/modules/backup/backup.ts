import { takeLeft } from './../../../node_modules/effect/src/String';
import type { PrismaClient } from '@prisma/client';
import { HandleError } from '../../decorators/handle-error.decorator';
import {
  PrismaBackupError,
  PrismaBackupGetAllTableNameError,
  PrismaBackupQueryDataError,
  PrismaBackupSaveTableJsonError,
  PrismaBackupTransformDataError,
} from './backup-error';
import type { OffsetConfig, PrismaBackupArgs, QueryTableNameWithRowCount } from '../../types';
import { PathRoute } from '@vorlefan/path';
import { Route } from '../path-route';
import { sanitizeFilename } from '../../utils/utils';
import { encrypt } from '../crypto';

export class PrismaBackup {
  private route: PathRoute = Route;

  constructor(private readonly prismaClient: PrismaClient, private readonly args: PrismaBackupArgs) {
    this.route.inject(this.args.folderName, this.args?.isTesting ? 'main' : 'root').alias('@', this.args.folderName);
    if (this.args?.encrypt === true) {
      if (!this?.args?.password || this?.args?.password.length < 5) {
        throw new Error(
          'If the encrypt is set true, then it is required a password. The password must be at least 5 length'
        );
      }
    }
  }

  @HandleError((cause) => new PrismaBackupError(cause))
  public async run() {
    const tables = await this.getAllTableNamesWithCount();

    for (const table of tables) {
      const offsetConfig = this.args.offset?.[table.table_name];
      if (offsetConfig) {
        await this.saveTableOffset(table, offsetConfig);
      } else {
        await this.saveTable(table);
      }
    }
  }

  @HandleError((cause) => new PrismaBackupSaveTableJsonError(cause))
  protected async saveTableOffset(table: QueryTableNameWithRowCount, offsetConfig: OffsetConfig) {
    console.log(`Using offset for table "${table.table_name}" with limit ${offsetConfig.limit}"`);

    const allRows: any[] = [];
    let offset: number = 0;

    while (true) {
      const query = `
        SELECT * FROM "${table.table_name}"
        OFFSET ${offset}
        LIMIT ${offsetConfig.limit};
      `;
      const batch: any[] = await this.queryData(query);

      // If the database returns nothing, we are definitely done.
      if (batch.length === 0) {
        break;
      }

      allRows.push(...batch);

      offset += offsetConfig.limit + 1;
    }

    const filename = sanitizeFilename(`${table.table_name}.json`);
    const filepath = this.route.plug('@', filename)!;

    const data = this.transformQueryData(allRows, table);
    const content = await this.transformContent(JSON.stringify(data));

    const status = await this.route.stream().write(filepath, content);

    if (!status) {
      throw new Error(`ERROR: Backup for table, ${table.table_name} that has ${table.row_count} rows.\n\t${filepath}`);
    }

    return true;
  }

  @HandleError((cause) => new PrismaBackupSaveTableJsonError(cause))
  protected async saveTable(table: QueryTableNameWithRowCount) {
    const rows = await this.queryData(`SELECT * FROM "${table.table_name}";`);
    const filename = sanitizeFilename(`${table.table_name}.json`);
    const filepath = this.route.plug('@', filename)!;

    const data = this.transformQueryData(rows, table);
    const content = await this.transformContent(JSON.stringify(data));

    const status = await this.route.stream().write(filepath, content);

    if (!status) {
      throw new Error(`ERROR: Backup for table, ${table.table_name} that has ${table.row_count} rows.\n\t${filepath}`);
    }

    return true;
  }

  @HandleError((cause) => new PrismaBackupGetAllTableNameError(cause))
  protected async getAllTableNamesWithCount(): Promise<Array<QueryTableNameWithRowCount>> {
    const tables: Array<{ table_name: string; row_count: BigInt }> = await this.prismaClient.$queryRaw`
        SELECT
            relname AS table_name,
            n_live_tup AS row_count
        FROM
            pg_stat_user_tables
        ORDER BY
            table_name;
    `;
    return tables.map((data) => ({
      ...data,
      row_count: Number(data.row_count),
    }));
  }

  @HandleError((cause) => new PrismaBackupQueryDataError(cause))
  protected async queryData(query: string): Promise<Array<any>> {
    return this.prismaClient.$queryRawUnsafe(query);
  }

  @HandleError((cause) => new PrismaBackupTransformDataError(cause))
  protected transformQueryData(query: any[], { table_name, row_count }: QueryTableNameWithRowCount): Array<any> {
    const rows = query.map((row: any) => ({ ...row, __table_name: table_name, __row_count: row_count }));

    return rows;
  }

  @HandleError((cause) => new PrismaBackupTransformDataError(cause))
  protected async transformContent(content: string): Promise<string> {
    if (this.args?.encrypt && this.args?.password) {
      const data = await encrypt({ password: this.args.password, text: content });
      return JSON.stringify(data);
    }
    return content;
  }
}
