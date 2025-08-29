export type CursorConfig = {
  limit: number; // The batch size for each query
  field: string; // The unique, ordered field to paginate on (e.g., 'id', 'createdAt')
};

export type PrismaBackupArgs = {
  folderName: string;
  database: 'postgres';
  isTesting?: boolean;
  cursor?: {
    [tableName: string]: CursorConfig;
  };
};

export type QueryTableNameWithRowCount = { table_name: string; row_count: number };
