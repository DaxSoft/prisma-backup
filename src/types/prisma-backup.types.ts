export interface PrismaBackupArgs {
  folderName: string;
  database: 'postgres';
  isTesting?: boolean;
}

export type QueryTableNameWithRowCount = { table_name: string; row_count: number };
