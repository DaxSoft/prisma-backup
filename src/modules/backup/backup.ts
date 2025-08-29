import type { PrismaClient } from '@prisma/client';

export class PrismaBackup {
  constructor(private readonly prismaClient: PrismaClient) {}

  protected async getAllTableNamesWithCount(): Promise<Array<{ table_name: string; row_count: number }>> {
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
