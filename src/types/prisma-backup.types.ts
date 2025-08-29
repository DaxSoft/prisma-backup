export type OffsetConfig = {
  limit: number; // The batch size for each query
};

export type PrismaBackupArgs = {
  folderName: string;
  database: 'postgres';
  isTesting?: boolean;
  offset?: {
    [tableName: string]: OffsetConfig;
  };
  encrypt?: boolean;
  password?: string;
  compress?: boolean;
};

export type QueryTableNameWithRowCount = { table_name: string; row_count: number };
