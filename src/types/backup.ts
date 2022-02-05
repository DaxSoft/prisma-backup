import { PathRoute } from '@vorlefan/path';

export type BackupModelsValue = Array<Record<any, any>>;
export type BackupModels = Record<string, BackupModelsValue>;

export type BackupProps = {
    encrypt?: boolean;
    password?: string;
    folder?: string;
    models: BackupModels;
    onRoute?: (route: PathRoute) => any;
    backupFolderName?: string;
};

export type BackupRecursiveProps = {
    encrypt?: boolean;
    password?: string;
    folder?: string;
    models: BackupModels;
    route: PathRoute;
    keys: string[];
    progress: any;
};

export type BackupModelProps = {
    encrypt?: boolean;
    password?: string;
    folder?: string;
    currentModel: BackupModelsValue;
    key: string;
    route: PathRoute;
};

export type BackupModelFileEncrypted = {
    iv: string;
    encrypted: string;
};
