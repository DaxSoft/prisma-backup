import type { PrismaClient } from '@prisma/client';
import { HandleError } from '../../decorators/handle-error.decorator';
import { PrismaBackupError, PrismaBackupGetAllTableNameError, PrismaBackupSaveTableJsonError } from './backup-error';
import type { OffsetConfig, PrismaBackupArgs, QueryTableNameWithRowCount } from '../../types';
import { PathRoute } from '@vorlefan/path';
import { Route } from '../path-route';
import { sanitizeFilename } from '../../utils/utils';

export class PrismaBackup {
  private route: PathRoute = Route;

  constructor(private readonly prismaClient: PrismaClient, private readonly args: PrismaBackupArgs) {
    this.route.inject(this.args.folderName, this.args?.isTesting ? 'main' : 'root').alias('@', this.args.folderName);
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

      const batch: any[] = await this.prismaClient.$queryRawUnsafe(query);

      // If the database returns nothing, we are definitely done.
      if (batch.length === 0) {
        break;
      }

      allRows.push(...batch);

      offset += offsetConfig.limit + 1;
    }

    const filename = sanitizeFilename(`${table.table_name}.json`);
    const filepath = this.route.plug('@', filename)!;

    const data = allRows.map((row: any) => ({ ...row, __table_name: table.table_name, __row_count: table.row_count }));
    const status = await this.route.stream().write(filepath, JSON.stringify(data));

    if (!status) {
      throw new Error(`ERROR: Backup for table, ${table.table_name} that has ${table.row_count} rows.\n\t${filepath}`);
    }

    return true;
  }

  @HandleError((cause) => new PrismaBackupSaveTableJsonError(cause))
  protected async saveTable(table: QueryTableNameWithRowCount) {
    const rows = await this.prismaClient.$queryRawUnsafe(`SELECT * FROM "${table.table_name}";`);
    const filename = sanitizeFilename(`${table.table_name}.json`);
    const filepath = this.route.plug('@', filename)!;

    const data = rows.map((row: any) => ({ ...row, __table_name: table.table_name, __row_count: table.row_count }));
    const status = await this.route.stream().write(filepath, JSON.stringify(data));

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

  /**
   * Safely formats a value for use in a raw SQL query.
   * @param value The value to format (string, number, Date).
   */
  private formatCursorValue(value: any): string {
    if (typeof value === 'string') {
      // Basic escaping for single quotes and wrap in quotes
      const escapedValue = value.replace(/'/g, "''");
      return `'${escapedValue}'`;
    }
    if (value instanceof Date) {
      // Format date to ISO string and wrap in quotes
      return `'${value.toISOString()}'`;
    }
    // For numbers and other types, just convert to string
    return String(value);
  }
}
