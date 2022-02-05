import { BackupRecursiveProps } from '../../../types/backup';
import { BackupModel } from './model';

export async function recursiveModels({
    models,
    password,
    encrypt,
    folder,
    route,
    keys,
    progress,
}: BackupRecursiveProps) {
    if (keys.length === 0) return;

    const currentKey = keys.shift();

    if (currentKey && models[currentKey]) {
        const currentModel = models[currentKey];
        const machine = new BackupModel({
            currentModel,
            password,
            encrypt,
            folder,
            key: currentKey,
            route,
        });

        await machine.bootstrap();
    }

    progress.increment();

    return await recursiveModels({
        models,
        password,
        encrypt,
        folder,
        route,
        keys,
        progress,
    });
}
