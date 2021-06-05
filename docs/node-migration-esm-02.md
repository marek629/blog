![](img/header-es-module.png)

*Written on 2021-06-05*

# Migration node.js project to ESM - part 2

ESM - ECMAScript Modules are a modern way to manage the binding of JavaScript code written in separated files, so-called modules.

## Motivation

My motivation was described in [part 1](node-migration-esm-01.md) of the series.

## Problem

The second thing that surprised me while migrating to ESM my node.js project was a inability to usage of `__dirname` and `__filename` build-in globals by node's runtime.

## Solution

### Own implementation

There is a way to implement behaviour of `__dirname` and `__filename` globals.
It's based on `import.meta` object that exposes context-specific metadata of ES module.
The metadata object contains one field - URL contains the module file path as a string.
The `url` field could be transformed to `URL` object as you can see on example:

```JS
console.log('meta', import.meta)
console.log('URL', new URL(import.meta.url))
```

What will produce output:

```
meta [Object: null prototype] {
  url: 'file:///home/marek/demo/esm.js'
}
URL URL {
  href: 'file:///home/marek/demo/esm.js',
  origin: 'null',
  protocol: 'file:',
  username: '',
  password: '',
  host: '',
  hostname: '',
  port: '',
  pathname: '/home/marek/demo/esm.js',
  search: '',
  searchParams: URLSearchParams {},
  hash: ''
}
```

This kind of solution was described in good way by David Herron in [him blog post](https://techsparx.com/nodejs/esnext/dirname-es-modules.html).

In general, this situation is caused by no node's module wrapper in ESM mode.

References:

- https://nodejs.org/api/modules.html#modules_dirname
- https://nodejs.org/api/modules.html#modules_filename
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta
- https://nodejs.org/api/modules.html#modules_the_module_wrapper

### Third party solution

But before we will start own implementation, let's check third party solutions published on NPM registry!
And there is our perfect solution: `dirname-filename-esm`.

Why it is the perfect solution?
It's simple - it's written as open source and well tested by the community.
So that means it's tested in some weird and rare edge cases.
And you get TypeScript support out of the box.
This is my first choose before writing code by myself.

Usage example:

```JS
import { dirname, filename } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)
const __filename = filename(import.meta)
```

As you can see, this tiny library is using `import.meta` object as their input.

References:

- https://github.com/rhysd/dirname-filename-esm
- https://www.npmjs.com/package/dirname-filename-esm

## Conclusion

The example of this small library follow to simple conclusion.
Always as you have the possibility to use third party software - use it!

If you think that risk of missing third party dependencies is urgent for your project, please consider some trade-off. For example you can track `node_modules` directory by your VCS, probably `git`.

Of course it would much harder to learn to use of a big, complicated software as your 3rd party dependency.
And it requires much bigger time to consider.
Maybe you should choose a another solution from the market?
May be not?
Who knows?
It's theme for many another articles.

Anyway, probably always time needed to learn a finished software would be smaller than time needed to write and test dedicated software.
At least as long as the ready software fulfil your all requirements.
