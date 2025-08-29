import { PathRoute } from '@vorlefan/path';

const Route = new PathRoute();

// current folder
Route.add('__dirname', Route.resolve(__dirname));

// package route
Route.add('main', Route.backward('__dirname', 2)!);

// project route
Route.add('root', Route.backward('main', 2)!);

export { Route };
