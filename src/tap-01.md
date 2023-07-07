![](img/header-tap-nyan-module.png)

*Written on 2023-07-07 by Marek Jędryka*

# Developer reflections about merging TAP streams

This article is rather my considerations connected to working around merging TAP streams and software project development in that area.
It's inspired by my experience in `tap-merge` package usage.
I believe it could be valuable for you as well.

References:

- https://testanything.org
- https://www.npmjs.com/package/tap-merge

## Single TAP reporter

The start point is the use of a single TAP reporter, let's call producer as well.
There are plenty of TAP producers delivered by many test runners in different languages.
The apple of my eye is the JavaScript ecosystem, so I can give you just a few examples in my experience:

- `ava` by `--tap` CLI switch, for example:

  ```bash
  ava test/passing.test.js --tap
  ```

- node.js built-in test runner produces TAP stream by default outside TTY (text terminal), for example when `node` works in shell stream
- even `jest` can produce a TAP stream by using a specific reporter

For sake of argument, I will also give some examples of other languages:

- C# (`taps-testing`)
- Fortran (`fortran-tap` and `fortran-testanything`)
- Lua (`busted`, `lua-TestMore` and `luatest`)
- OCalm (`TestSimple`)

Yes, my choice of examples is a bit weird.
I know that!
But I can do that as it's my blog.
You can find TAP producers for your language as well.

References:

- https://www.npmjs.com/package/ava
- https://nodejs.org/dist/latest-v20.x/docs/api/test.html
- https://www.npmjs.com/package/jest-tap-reporter
- https://testanything.org/producers.html

## Merging TAP stream

Running a single TAP producer is easy.
But what we can do to run in parallel two or more producers?
It's a bit challenging because we need to recount the number of running test cases.
To solve that issue we can use `tap-merge` package.

Following `tap-merge` README file, we can merge two `ava` TAP producers to one TAP stream by using the below command:

```bash
cat <(ava test/passing.test.js --tap) <(ava test/skipping.test.js --tap) | tap-merge
```

So this is our first option of merging TAP stream.
In this case, creating processes is fully managed by bash or another shell.

### My package

To be honest, the first approach was really strange and uncomfortable for me.
I didn't like the way of typing in shell-styled redirection of the process output.
Today it's not so strange notation for me but in the meantime I invented an interesting alternative.

So I wanted to write a CLI program in node.js, that would be able to execute given commands as parameters, catch their output stream, merge it in TAP meaning and finally send merged TAP stream to the output.
As I wished, I did.
And I use original `tap-merge` package mechanics under the hood.
Afterwards, I realised it had led me to implement my own TAP producer.

I created `tap-ogg` package to have fun with sound manipulations and visualize that in nyan-cat meme style.
One of its CLI arguments was `--producer` or `-p` as short alias.
I moved this functionality to separate package `@tap-ogg/tap-merge` over time.
It supplies `tmerge` binary to avoid name collision with `tap-merge` from the original `tap-merge` package.
I can write the same two `ava` TAP producers as following:

```bash
tmerge -p "ava test/passing.test.js --tap" -p "ava test/skipping.test.js --tap"
```

As you can see, producers were given as strings to execute by `tmerge` internally.
The second difference is no shell piping as piping is performed in `tmerge` node process.

Now I consider if name `@tap-ogg/multitap` will be more relevant.
This is supported by:

- no name collision in `node_modules/.bin` binaries directory with original `tap-merge`
- funnier name, I associate it with the type of pubs with multiple beer taps

But on the other hand, it's connected to extra effort and mess connected to changing the name of already published package.
Adding binary alias `multitap` looks like a good trade-off.
I can plan package rename for the far future.

#### Background

I invented `tap-ogg` idea as one CLI tool for running tests, presenting their execution as nyan cat animation in colorful ASCII art, and playing sound from OGG file in the same time.
I remember the moment of the idea's origin.
It was when I worked on tests in my job a few companies ago and I figured out nyan reporter for `mocha`.
In one minute I fell in love with that reporter and I knew that I need to implement the idea someday.

A few years later, I started to implement my great idea.
I didn't concider yet that the scope is too big for one project and in fact there is 3 separated functionalities.
So I implemented `tap-ogg` 0.x series as multifunctional combo package.
Afterwards, I realised that my approach should be changed to closer to UNIX philosophy.
I understood that I need to split to 3 separated packages that do only one thing but pretty good and their can work together in common job.
And it's my current approach in working on `tap-ogg` 1.x series.
I believe it's better way.
Time will tell if I am right.

I'm glad because I don't feel bad about my journey to the 0.x series.
I consider `tap-ogg` 0.x series as proof of concept.
When I saw it works I could start the next step of project evolution.
It's great opportunity to learn something new, for example `yarn workspaces` and CLI refactorings with working integration tests and trying to keep it green, I mean passing.
It's huge progress, personally.

### Use an off-the-shelf product

As you can see, own-implemented `tap-merge` variation is useful in a basic scenario.
But it has limitations, especially in control of a number of commands run in parallel.
Fortunately, there is ready to use package at npm registry: `concurrently`.

So we can rewrite our core case with 2 TAP producers to:

```bash
concurrently --raw "ava test/passing.test.js --tap" "ava test/skipping.test.js --tap" | ../node_modules/tap-merge/cli.js
```

The second stage of shell stream is written in a bit strange way, i.e. `../node_modules/tap-merge/cli.js` bacause of binary naming collision with `@tap-ogg/tap-merge`.
Here, I need to use origiral `tap-merge` package.
I see that I need change binary name in my package to solve this issue.

Back to the point, we can also control the number of commands running at the same time.
Example of serial execution given below.

```bash
concurrently --max-processes 1 --raw "ava test/passing.test.js --tap" "ava test/skipping.test.js --tap" | ../node_modules/tap-merge/cli.js
```

References:

- https://www.npmjs.com/package/concurrently

## Conclusion

It's realy hard and complex thing to implement own solution.
On one hand, it's a good opportunity to learn many things through experience, plenty of experiments, and making mistakes.
I enjoyed it and I feel many great experiences are before me as transforming from POC to more stable software is still in progress.
On the other hand, the darker one, it's pretty hard to deal with thinking that I did a big piece of work that nobody needs.
But what I learned and experienced that's mine.

I think the future of my variation of `tap-merge` would be rather a maintenance of the current state of code than trying to compete `concurrently` in their options diversity.
To be honest, I would use `concurrently` instead of my code when I feel the need for more power.
Why should I not do it?
