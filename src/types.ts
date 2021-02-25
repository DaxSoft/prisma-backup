import { PathRoute } from '@vorlefan/path';

export interface PrismaExportJsonProps {
    models: Record<any, () => Function>;
    enums: Record<any, () => Record<any, any>>;
    onRoute?: (route: PathRoute) => any;
    folderName?: string;
}
