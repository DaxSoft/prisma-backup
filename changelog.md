# 1.6.7

-   Improve types

# 1.6.6

-   Add hiearchy method
-   Add sliceTo method
-   Improve stream().download method
-   Improve inject method

# 1.6.3

-   Add FileStream
-   Add FileStream.download to be able to download files from URI
-   Add lastFiles to get the last file modified by his time
-   Fix bugs
-   Centralize Types
-   Upgrade packages

# 1.5.8

-   Fix up inject() && .io().hasFolder

# 1.5.6

-   Fix up .io().accessFile

# 1.5.5

-   Fix up folders and files method from 'io()'

# 1.5.4

-   Change from ESBUILD to Webpack

# 1.5.3

-   Test added
-   Esbuild for building
-   Update readme
-   Update examples

# 1.5.0

-   TypeScript version

# 1.4.1

-   New method named 'back'. In which goes to the previous folder from the current one.
    Ex:

```js
Routes.instance((instance) => {
    instance.set('src', 'example/test/abc');
}).namespace('Basic');
Routes.Basic.back('src'); // example/test instend of example/test/abc

// You can ajust the level
Routes.Basic.back('src', 2); // example instend of example/test/abc
```

-   New method to access the File functions from FileManager. Use 'io()' function.

```js
Route.Basic.io().accessFile(filepath);
```

-   New method to get the name of the last folder name from a path.

```js
Route.Basic.endWith('/example/test'); // test
```

# 1.4.0

-   First release under @vorlefan/path
-   Code packaged with webpack
-   Test with Jest
