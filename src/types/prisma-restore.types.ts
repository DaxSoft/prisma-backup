export type PrismaDMMFDataModelBaseFields = { type: string; relationFromFields?: readonly string[] };

export type PrismaDMMFDataModelBase = {
  name: string;
  fields: PrismaDMMFDataModelBaseFields[];
};

export type PrismaRestoreArgs = {
  folderName: string;
  database: 'postgres';
  isTesting?: boolean;
  encrypt?: boolean;
  password?: string;
  ignoredTables?: string[];
  baseModels: Array<Record<string, any>>;
};
