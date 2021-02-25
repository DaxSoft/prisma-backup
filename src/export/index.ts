import { PrismaExportJsonProps } from './../types';
import { Route } from '../route';

/*
:--------------------------------------------------------------------------
: Export function
:--------------------------------------------------------------------------
*/

async function ExportEnums({
    enums,
    folderName,
}: Omit<PrismaExportJsonProps, 'models'>): Promise<void> {
    await Promise.allSettled(
        Object.keys(enums).map(async (enumsKey) => {
            const _obj = enums[enumsKey]();
            try {
                console.log('ENUMS:', '[', enumsKey, ']');
                await Route.json()
                    .set(folderName || 'default')
                    .store({
                        data: _obj,
                        filename: `${enumsKey}.enums.json`,
                        force: true,
                    });
            } catch (error) {}
        })
    );
}

async function ExportModels({
    models,
    folderName,
}: Omit<PrismaExportJsonProps, 'enums'>): Promise<void> {
    await Promise.allSettled(
        Object.keys(models).map(async (modelsKey) => {
            try {
                const method = models[modelsKey]();
                const _obj = await method();

                console.log('MODELS:', '[', modelsKey, ']');
                await Route.json()
                    .set(folderName || 'default')
                    .store({
                        data: _obj,
                        filename: `${modelsKey}.models.json`,
                        force: true,
                    });
            } catch (error) {}
        })
    );
}

export async function PrismaBackupExport({
    enums,
    models,
    folderName = Date.now().toString(),
    onRoute,
}: PrismaExportJsonProps): Promise<Boolean> {
    try {
        const __fill = Array(32).fill(':').join(':');
        console.log('\n', __fill);
        console.log('\n\t', '[START]', 'PRISMA BACKUP EXPORT');
        console.log('\n', __fill);
        Route.inject(folderName || 'default', 'prisma.backup');
        if (!!onRoute) {
            onRoute(Route);
        }
        await ExportEnums({ enums, folderName });
        await ExportModels({ models, folderName });
        console.log('\n', __fill);
        console.log('\n\t', '[END]', 'PRISMA BACKUP EXPORT');
        console.log('\n', __fill);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
