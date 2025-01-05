---
description: |
  Test services with external dependencies in your ES Module project.
  Easy dependency injection for JavaScript functions!
---

![](img/header-di-module.png)

*Written on 2022-07-05 by Marek Jędryka*

# Pragmatic Dependency Injection

Recently, I faced the following problem:
I needed to test a service function using external resources such as database and REST API actions.
My project uses ES Modules, function-oriented programming and is written in JavaScript, so I couldn't make it so easy.
I couldn't use mocking tools like proxyquire or sinon.

The gist of ESM problem:

```JS
import { db } from '../db'
import { xmlFrom3rdParty } from './api/client'

export const serviceFn = () => {
  const xml = xmlFrom3rdParty()
  db.storeXMLResult(xml)
  return 'done'
}
```

And that was the moment when I realized my project needed some refactorization.
Hopefully, a small one.

## Refactor scope minimalization

Let me consider a few options...

### Closure introduction

I could introduce a configurable factory function returning the original function just configured by the closure.
But it implies changes in usage of the function.

Module interface changes didn't look good for me, so I thought about it again.

### Export default object

I could export the default object from my service function file instead of exporting the function by value.

I don't want to do it because I want to keep chosen way of import/export modules.
So I had to try something else, simpler maybe.

### External stuff export

I exported brand new object including my dependencies for replacement or injection.

```JS
import { db } from '../db'
import { xmlFrom3rdParty } from './api/client'

// introduced external object
export const external = {
  db,
  xmlFrom3rdParty,
}

export const serviceFn = async () => {
  // destructuring is needed for no changes in function block below
  const { db, xmlFrom3rdParty } = external

  const xml = await xmlFrom3rdParty()
  await db.storeXMLResult(xml)
  return 'done'
}
```

Pros:

- no impact on production code
- the module has full control over what set or subset of used dependencies could be injected/replaced

Cons:

- the necessity of destructuring exported `external` object, let's say the simplest dependency container, in each function what uses `external` things

## Impact of refactoring

Changes that I made let me inject dependencies in tests so I could do unit tests without whole universe interactions.
Test cases can be fast, fully-controlled and predictable.
It's a great plus.

And last but not least the changes did impact on the service function file and just added test.
It doesn't impact the production code that uses the service function as well.
