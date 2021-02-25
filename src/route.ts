import { PathRoute } from '@vorlefan/path';

const Route = new PathRoute();

// package route
Route.set('main', __dirname);
Route.structuredJoin('main');

// project route
Route.set('root', Route.back('main', 4));
Route.structuredJoin('root');
Route.inject('prisma.backup', 'root');

export { Route };
