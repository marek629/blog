![](img/header-es-module.png)

*Written on 2021-05-22 by Marek Jędryka*

# Migration node.js project to ESM - part 1

ESM - ECMAScript Modules are a modern way to manage the binding of JavaScript code written in separated files, so-called modules.

## Motivation

After working on modern frontend applications for a while I started to write backend application in node.js using CommonJS (and of course require function calls).
A few projects later I want to write code in a similar way to frontend code style, so I need to move to ESM (import and export statements).

Node.js can read ESM by default since version 12, so any building tools (i.e. babel) is not required.
One thing I must do was change (or rather add) property in `package.json` of my project:

```JSON
{
  "type": "module"
}
```

## Problem

The first thing that surprised me while migrating to ESM my node.js project was a need of adding file extension after replacement `require` function call to import statement.
However, it would be nonsense to add a `.js` file extension at each import occurrence.

## Solution

### CLI parameter to the rescue!

Since node version 13.4.0, 12.16.0 we can use:

```
--es-module-specifier-resolution=[mode], --experimental-specifier-resolution=[mode]
```

Value of mode could be one of two options: *explicit* (default) or *node*.
For our case node value is a perfect choice.

References:

- https://nodejs.org/dist/latest-v16.x/docs/api/cli.html#cli_experimental_specifier_resolution_mode
- https://nodejs.org/dist/latest-v16.x/docs/api/esm.html#esm_customizing_esm_specifier_resolution_algorithm

### POC

A working proof of concept is started by `app.js` file:

```JS
import { bar } from './foo'


console.log({ bar })
```

Next, let's create a directory `foo` and two files included:

- `bar.mjs`:
  ```JS
  export const bar = {
    name: 'bar',
    type: 'exported constant',
  }
  ```
- `index.js`:
  ```JS
  export * from './bar.mjs'
  ```

And finally, let's run:

```sh
$ node --experimental-specifier-resolution=node app.js
```

I can also skip file extension at node CLI. It's funny for me.

```sh
$ node --experimental-specifier-resolution=node app
```

In both cases node will print to stdout:

```sh
{ bar: { name: 'bar', type: 'exported constant' } }
```

## Conclusion

Described --experimental-specifier-resolution CLI switch works for directories as well as both file extensions (`js` and `mjs`).

It's still flagged as experimental but hopefully, it will be changed in future releases of node.

So is it production-ready? It depends on risk analytics at your organization and other politics.
When your position is careful you should consider build-time transformations (JavaScript transpiler like babel or migrate to TypeScript) instead of node runtime adjustments.
