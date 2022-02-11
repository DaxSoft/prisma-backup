import { BackupModelsValue } from './../../../types/backup';
import { PathRoute } from '@vorlefan/path';
import { GetBackupOnCurrentModelProps } from '../../../types/backup';
import { IFileManager_Files } from '@vorlefan/path/dist/types';
import { decrypt } from '../../crypto';
import { parse, evaluate } from 'groq-js';

export class GetBackupHelper {
    route: PathRoute;
    onCurrentModel: GetBackupOnCurrentModelProps;
    currentFile: IFileManager_Files;
    private models: BackupModelsValue;
    data: BackupModelsValue;
    private currentModel?: Record<any, any>;

    constructor(
        route: PathRoute,
        onCurrentModel: GetBackupOnCurrentModelProps,
        currentFile: IFileManager_Files,
        data: BackupModelsValue
    ) {
        this.route = route;
        this.onCurrentModel = onCurrentModel;
        this.currentFile = currentFile;
        this.data = data;
        this.models = [...data];
    }

    async bootstrap() {
        if (this.models.length === 0) return;
        this.currentModel = this.models.shift();
        await this.handler();
        return await this.bootstrap();
    }

    private async handler() {
        if (!this.currentModel) return;

        await this.onCurrentModel({
            instance: this,
            currentModel: this.currentModel,
            currentFile: this.currentFile,
        });
    }

    async filterModel(dataset: BackupModelsValue, filter: string) {
        let tree = parse(filter);
        const value = await evaluate(tree, { dataset });
        return await value.get();
    }

    async getModel(modelName: string): Promise<BackupModelsValue | undefined> {
        let { data } = await this.route.stream().readJson({
            filepath: this.route.plug('#', `${modelName}.json`),
            options: 'utf-8',
        });

        if (!data) {
            return undefined;
        }

        data = await this.decryptData(data);

        if (!Array.isArray(data)) {
            return undefined;
        }

        return data;
    }

    private async decryptData(data: Record<any, any>) {
        const isEncrypted =
            data.hasOwnProperty('iv') && data.hasOwnProperty('encrypted');
        if (!isEncrypted) return data;

        const d_data = await decrypt({
            password: this.route.getItem('password'),
            iv: data.iv,
            encryptedText: data.encrypted,
        });

        if (!d_data) {
            return data;
        }

        return JSON.parse(d_data);
    }
}
