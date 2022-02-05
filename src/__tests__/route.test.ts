import { Route } from '../modules/route';
import { resolve } from 'path';

describe('Route', () => {
    test('Is in the same folder?', () => {
        const mainRoute = Route.get('main');

        expect<string>(mainRoute.name).toEqual('main');
        expect<string>(mainRoute.filepath).toEqual(
            resolve(__dirname, '..', '..')
        );
    });

    test('Is at the src folder?', () => {
        const mainRoute = Route.get('main');
        expect<string>(Route.basename(mainRoute.filepath, '')).toEqual(
            'package'
        );
    });
});
