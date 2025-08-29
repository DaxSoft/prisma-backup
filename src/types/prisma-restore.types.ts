export type PrismaDMMFDataModelBase = {
  name: string;
  fields: { type: string; relationFromFields?: readonly string[] }[];
};

export type PrismaRestoreArgs = {
  folderName: string;
  database: 'postgres';
  isTesting?: boolean;
  encrypt?: boolean;
  password?: string;
  ignoredTables?: string[];
  baseModels: Array<PrismaDMMFDataModelBase>;
};
