import { BackupModelsValue } from './../../../types/backup';
import { GetBackupHelper } from './helper';
import { PathRoute } from '@vorlefan/path';
import { IFileManager_Files } from '@vorlefan/path/dist/types';
import { GetBackupOnCurrentModelProps } from '../../../types/backup';
import { decrypt } from '../../crypto';

export async function handleFile(
    route: PathRoute,
    onCurrentModel: GetBackupOnCurrentModelProps,
    currentFile: IFileManager_Files
) {
    try {
        const password = route.getItem('password');

        let { data } = await route
            .stream()
            .readJson({ filepath: currentFile.filepath, options: 'utf-8' });

        if (!data) {
            return;
        }

        const isEncrypted =
            data.hasOwnProperty('iv') && data.hasOwnProperty('encrypted');

        if (isEncrypted) {
            if (!password || password.length < 5) {
                throw new Error(
                    'This data is encrypted, then you need the password in order to decrypt it'
                );
            }

            const decryptedData = await decrypt({
                password,
                iv: data.iv,
                encryptedText: data.encrypted,
            });

            if (!decryptedData) {
                return;
            }

            data = JSON.parse(decryptedData);
        }

        if (!!data) {
            const helper = new GetBackupHelper(
                route,
                onCurrentModel,
                currentFile,
                data as BackupModelsValue
            );

            await helper.bootstrap();
        }
    } catch (error) {
        console.error(error);
    }
}

export async function inEachModel(
    route: PathRoute,
    onCurrentModel: GetBackupOnCurrentModelProps,
    progress: any,
    files: IFileManager_Files[]
) {
    if (files.length === 0) return;
    const currentFile = files.shift();
    if (currentFile) {
        await handleFile(route, onCurrentModel, currentFile);
    }
    progress.increment();
    return await inEachModel(route, onCurrentModel, progress, files);
}
