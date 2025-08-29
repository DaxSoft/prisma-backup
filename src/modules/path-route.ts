import { PathRoute } from "@vorlefan/path";

const Route = new PathRoute();

// package route
Route.add("main", Route.backward(Route.resolve(__dirname), 2)!);

// project route
Route.add("root", Route.backward("main", 2)!);

export { Route };
