import { resolve } from 'node:path';
import { Route } from '../modules/path-route';

describe('Route', () => {
  test('Is in the same folder?', () => {
    const mainRoute = Route.get('main');

    if (!mainRoute) {
      throw new Error('Route:main not defined');
    }

    expect<string>(mainRoute.routeName).toEqual('main');
    expect<string>(mainRoute.routePath).toEqual(resolve(__dirname, '..', '..'));
  });

  test('Is at the src folder?', () => {
    const mainRoute = Route.get('main');

    if (!mainRoute) {
      throw new Error('Route:main not defined');
    }

    expect<string>(Route.basename(mainRoute.routePath, '')).toEqual('prisma-backup');
  });
});
