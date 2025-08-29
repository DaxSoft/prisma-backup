import type { PrismaClient } from '@prisma/client';
import { HandleError } from '../../decorators/handle-error.decorator';
import { PrismaBackupError, PrismaBackupGetAllTableNameError, PrismaBackupSaveTableJsonError } from './backup-error';
import type { PrismaBackupArgs, QueryTableNameWithRowCount } from '../../types/prisma-backup.types';
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
      await this.saveTable(table);
    }
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
}
