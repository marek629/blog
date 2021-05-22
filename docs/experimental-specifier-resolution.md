# Migration node.js project to ESM - part 1

ESM - ECMAScript Modules are a modern way to manage binding of JavaScript code written in separated files.

## Motivation

After working on modern frontend applications for a while I started to write backend application in node.js using CommonJS (and of course require funtion calls). A few projects later I want to write code in similar way to frontend code style, so I need to move to ESM (import and export statements).

Node.js can read ESM by default since version 12, so any building tools (i.e. babel) is not required. One thing what I must to do, it was change (or rather add) property in `package.json` of my project:
```JSON
{
  "type": "module"
}
```

## Surprice

First thing what surrprised me while migration to ESM at node.js project was must of adding file extension after replacement require function call to import statement. However it would be a nonsense to add .js file extension at each import occurence.

## CLI parameter to the rescue

Since node version 13.4.0, 12.16.0 we can use:

```
--es-module-specifier-resolution=[mode], --experimental-specifier-resolution=[mode]
```

https://nodejs.org/dist/latest-v16.x/docs/api/cli.html#cli_experimental_specifier_resolution_mode

Value of mode could be one of two options: 'explicit' (default) or node. For our case node value is perfect choise.

## POC

Working proof of concept is started by app.js file:

```JS
import { bar } from './foo'


console.log({ bar })
```

Next let's create directory foo and two files included.

First bar.mjs:

```JS
export const bar = {
  name: 'bar',
  type: 'exported constance',
}
```

And the second - index.js:

```JS
export * from './bar.mjs'
```

And finally let's run:

```sh
$ node --experimental-specifier-resolution app.js
```

I can also skip file extension at node CLI. It's funny for me.

```sh
$ node --experimental-specifier-resolution app
```

In both cases node will print to stdout: 

```sh
{ bar: { name: 'bar', type: 'exported constance' } }
```

## Conclusion

Described --experimental-specifier-resolution CLI switch works for both extensions (js and mjs).

It's still flagged as experimental but hopefully it will be changed in future releases of node.

So is it production ready? It depends on risk analytics at your organisation and other politics. When your position is careful you should consider a build time transformations (JavaScript transpiler like babel or migrate to TypeScript) instead of node runtime modifications.