import { PathRoute } from '@vorlefan/path';
import { GetBackupOnCurrentModelProps } from '../../../types/backup';
import { stat } from 'fs/promises';
import { IFileManager_ListFolders } from '@vorlefan/path/dist/types';
import { inEachModel } from './files';

type IFileManager_ListFoldersSpecial = IFileManager_ListFolders & {
    date: number;
};

async function getFolderName(route: PathRoute): Promise<string> {
    const paramBackupFolderName = route.getItem('backupFolderName');

    let folderName: string | undefined =
        !!paramBackupFolderName && paramBackupFolderName.length > 0
            ? paramBackupFolderName
            : undefined;

    if (!folderName) {
        const folders: IFileManager_ListFoldersSpecial[] = [];

        await Promise.allSettled(
            route
                .io()
                .folders('@')
                .map(async (folder) => {
                    const fs = await stat(folder.path);

                    const date = fs.birthtimeMs;

                    folders.push({
                        name: folder.name,
                        path: folder.path,
                        date,
                    });
                })
        );

        const sortedFolders = folders.sort((a, b) => b.date - a.date);
        const recent = sortedFolders[0];

        if (!recent) {
            throw new Error('Folder not found');
        }

        folderName = recent.name;
    }

    return folderName;
}

export async function runModels(
    route: PathRoute,
    onCurrentModel: GetBackupOnCurrentModelProps,
    progress: any
) {
    try {
        const folderName = await getFolderName(route);
        route.set('#', route.plug('@', folderName));

        const files = route.io().files({ routeName: '#', extension: 'json' });
        if (!files.length) return;

        route.setItem('files', files);

        progress.start(files.length, 0);

        await inEachModel(route, onCurrentModel, progress, files);
    } catch (error) {
        console.error(error);
    }
}
