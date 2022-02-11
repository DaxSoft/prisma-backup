import { IFileManager_Files } from '@vorlefan/path/dist/types';
import { PathRoute } from '@vorlefan/path';
import { GetBackupHelper } from '../modules/get-backup/models/helper';

export type BackupModelsValue = Array<Record<any, any>>;
export type BackupModels = Record<string, BackupModelsValue>;

export type BackupProps = {
    encrypt?: boolean;
    password?: string;
    folder?: string;
    models: BackupModels;
    onRoute?: (route: PathRoute) => any;
    backupFolderName?: string;
    compress?: boolean;
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

export type GetBackupOnCurrentModelPropsContext = {
    instance: GetBackupHelper;
    currentModel: Record<any, any>;
    currentFile: IFileManager_Files;
};

export type GetBackupOnCurrentModelProps = (
    props: GetBackupOnCurrentModelPropsContext
) => Promise<void>;

export type GetBackupProps = {
    password?: string;
    folder?: string;
    backupFolderName?: string;
    onRoute?: (route: PathRoute) => any;
    onCurrentModel: GetBackupOnCurrentModelProps;
};
