export interface PrismaBackupArgs {
  folderName: string;
  database: 'postgres';
}

export type QueryTableNameWithRowCount = { table_name: string; row_count: number };
