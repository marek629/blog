---
description: "Quokka.js: Friend or Foe? Explore Use Cases & Top Alternatives."
---

![](img/header-tools-module.png)

*Written on 2023-04-06 by Marek Jędryka*

# Quokka.js Review and Alternatives

To be honest, I'm not a big fan of Quokka.js tools.
In this article, I will try to describe use cases where Quokka would be a good option and others, where exists better alternatives.
At least in my opinion are better ones.

## Review

Quokka.js is developed as an extension for IDEs or code editors, whatever.
In the free, version you can execute only newly created file in the Quokka context.
If you wish to run your existing files, you should check Quokka Pro also known as Wallaby.js.

In my case, I checked quickly the extension for VS Code.
It works quite nice.
The weakness is I can't save a file, close my editor and just continue work then.

In consequence, it's a nice educational tool for me.
Let's say a toy.
But maybe I'm not neutral.

References:

- https://quokkajs.com
- https://devcamp.com/trails/modern-javascript/campsites/modern-javascript-tools/guides/overview-quokka-js-extension
- https://webtoolsweekly.com/archives/issue-332/

## Alternatives

I'm not so cruel.
Even for me, Quokka is interesting.
That's why I'm writing this article.

### Worst

I can see two types of tools that Quokka wins.

1. Node's REPL

    Yes.
    REPL mode of node.js is not convenient during experiments, including learning.
    Quokka is a good solution here that shows you the code execution flow.

2. Online JS code editors

    When you have not-so-stable Internet connection, for example in a train, plane, etc. this could be a good playground.
    Or you don't want to type your code to an external server for some reason.
    It's another good reason to try Quokka.

#### Time Traveling Debugging

The most interesting feature of Wallaby.js is Time Traveling Debugging (TTD) for me.
It seems they have managed to implement it for node.js environment.
Unfortunately, I don't have any experience with that.
Would you like to try it yourself?

Anyway, I believe it was not easy to implement.
Node.js have issues with implementing TTD for years.
It could be JS engine-specific problem.
I didn't see this feature in V8, but I saw the archived attempt to achieve TTD in node.js on Chakra engine.

These days I see it's probably not included on the top of node's wishlist.

References:

- https://quokkajs.com/docs/#debugger
- https://github.com/nodejs/node-chakracore/blob/master/TTD-README.md

### And Even Better

Another power of Quokka is code coverage.
Fortunately, it's a well-covered topic in JS ecosystem.
You can choose one of many tools designed for that.
But writing unit tests ability is needed here.

If you are interested in VS Code extensions in this area, I can recommend the Coverage Gutters extension.
I have used this for years.
It works nicely and it's really useful.

References:

- https://www.atlassian.com/continuous-delivery/software-testing/code-coverage
- https://istanbul.js.org
- https://github.com/ryanluker/vscode-coverage-gutters
