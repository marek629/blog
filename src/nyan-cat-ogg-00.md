![](img/header-tap-nyan-module.png)

*Written on 2021-10-25 by Marek Jędryka*

# Part 0: Nyan cat OGG script specification

I'm working on nyan cat TAP reporter modification for a while.
The mod should display nyan cat animation at CLI and play funny song as long as tests are in progress.
The song is fixed.
It is not affected by state of the tests (passing, missing or failing).

During the implementation of the script, I realized I had made implicitly some assumptions about the software.
I describe them now explicitly.

## Input file format

I want to focus on general flow of the whole application, having fun with the implementation without worring about full OGG for all kinds of audio data encoding.
For this reason, I only support OGG files encoded with Vorbis for this moment.

## Running environment

It should be work on my computer.
So it must work under Linux.
But other operating systems are not condemned.
It just depends on the working of the dependencies there.
However, this scenario will not be tested.

## Fun and learning

The project was invented for the fun of using it.
And for the excitement of exploring Node.js while coding.
I will share my knowlage with you in next parts of this article series.

## For developers happiness

It's created for developers/testers usage in external software project using TAP reporter in testing.
The next time you minimize your terminal window, you could hear sound util the tests run.

I think that I can share via Github and NPM repositories soon.
