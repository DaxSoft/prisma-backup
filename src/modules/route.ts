import { PathRoute } from '@vorlefan/path';

const Route = new PathRoute();

// package route
Route.set('main', Route.resolve(__dirname, '..', '..'));

// project route
Route.set('root', Route.back('main', 2));

export { Route };
