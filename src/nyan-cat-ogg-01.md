# Part 1: Playing OGG file

If sound playing is needed, you should think about some way to play the sound.
It's obvious.
Not trivial thought.

Let's take a look at the available solutions.

I can use any music player having CLI support.
It should support OGG format because of my assumptions.
It could be for example `play` command from `sox` software package.
But just running a subprocess using `child_process` node package in this case is boring and modest for me.

## Streams introduction

Streams are efficient way of data processing where they operate on small pieces of information called chunks.
They are productive in two aspects:

1. Memory usage because you operate on small chunks so you don't need allocate big datasets for processing.
2. Time of processing because the processing could be started as soon as first chunks are available so you don't have to wait for whole dataset would be ready for processing, ie. be read from filesystem or another resource.

Streams in node.js have a nice event driven API, implemented in the spirit of functional programming.
The most important function of Stream API during working on streams is `pipe`.
It allows you to pass data from the current steam to the next stream, given as its parameter.
It's especially usefull when you have 2 or at most 3 streams in your processing flow.
For more amount of streams I recommend you `pipeline` function to use.
Let's see to the differences in example:

```JS
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream'
import { createGzip } from 'zlib'


// pipe method notation
createReadStream('file.txt')
  .pipe(createGzip())
  .pipe(createWriteStream('file.txt.gz'))

// or pipeline notation as alternative
pipeline(
  createReadStream('file.txt'),
  createGzip(),
  createWriteStream('file.txt.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline failed.', err)
    } else {
      console.log('Pipeline succeeded.')
    }
  },
)
```

As you can see, in `pipeline` function additional callback function parameter is required.
This is not always convenient.
So I don't recommend using it for short stream sequences unless you want to keep your coding standards coherent.
All in all it's up to you.

References:

* https://nodejs.dev/learn/nodejs-streams#why-streams
* https://nodejs.org/api/stream.html

## Streams in the action

Then go back to the concept of playing OGG file.
I need to do a few operations:

1. Read OGG file data from filesystem using `createReadStream` function from `fs` node.js module.
2. Decode OGG data using `Decode` function from `ogg` module.
3. Decode audio PCM data using `Decode` from `vorbis` module (in my case).
4. Send decoded PCM data to speakers using `speaker` module.

### Read file

Reading file from filesystem is the most common, and easiest part of our streams flow.
Just take a look!

```JS
import { createReadStream } from 'fs'
import path from 'path'


const file = path.resolve(
  dirname(import.meta),
  '../nyan.ogg',
)

createReadStream(file)
```

### Decode OGG data

Decoding OGG file is easy thanks `node-ogg` library.
On node.js 12 and later I must to use `@suldashi/ogg` package because it has updates for modern node releases.

One thing what it was needed is add event listener for `stream` event.
Next I had to pipe given stream to speakers, ie. audio output in general.
I added also `error` event listener for error catching and easer debugging.


```JS
import ogg from '@suldashi/ogg'
import Speaker from 'speaker'


const decoder = new ogg.Decoder()
decoder.on('stream', stream => {

  stream.pipe(new Speaker({
    
  }))
  stream.on('end', () => {
    play()
  })
})
decoder.on('error', err => {
  console.log({err})
})

createReadStream(file).pipe(decoder)
```

Great!
I was happy until I played my OGG file.
I heard only big noise.
It was unpleasant experience.

But why?
What wrong happen in my code?
So... it was my lack of knowledge about OGG file.

OGG is only container for audio data.
It can store audio data and some metadata, like autor name, song and album titles etc.
In OGG file header is written type of used audio data compression.
They could be encoded using Vorbis or Opus codec.
It means I need decode twice.

But I don't know what codec to use.
Vorbis or Opus?
Of course it depends on my OGG file encoding.
Let's check this information using `music-metadata` package.
Just see and execute folowing code:

```JS
import { parseFile } from 'music-metadata'


const metadata = await parseFile(file)
console.log({ metadata })
```

The code produces output:

```JS
{
  metadata: {
    format: {
      tagTypes: [Array],
      trackInfo: [],
      container: 'Ogg',
      codec: 'Vorbis I',
      sampleRate: 44100,
      bitrate: 96000,
      numberOfChannels: 2,
      numberOfSamples: 9559296,
      duration: 216.76408163265307
    },
    native: { vorbis: [Array] },
    quality: { warnings: [] },
    common: {
      track: [Object],
      disk: [Object],
      movementIndex: {},
      title: 'Nyan Cat [original]',
      comment: [Array]
    }
  }
}
```

In my case I found out that I need to use a Vorbis decoder.
I will describe this process in the next section.

If you are interested, you can listen to encoded Vorbis data.
Just turn your speakers down a bit, play sound below and enjoy!

##### OGG decoded but still Vorbis encoded samples
<!-- ![OGG decoded but still Vorbis encoded samples](audio/nyan-ogg-decoded.ogg) -->
<audio controls src="./audio/nyan-ogg-decoded.ogg">
  Your browser does not support the audio tag or OGG files.
</audio>


### Decode Vorbis samples

So let's decode Vorbis encoded samples!
To do this we need to import `vorbis` npm package and modify `stream` event handler.

```JS
import vorbis from 'vorbis'


decoder.on('stream', stream => {
  const vd = new vorbis.Decoder()
  vd.on('format', format => {
    vd.pipe(new Speaker(format))
  })
  stream.pipe(vd)

  stream.on('end', () => {
    play()
  })
})
```

Stream `stream` is piped to Vorbis decoder `vd` object output and the samples are piped to `Speaker` object now.


### Send audio samples to speakers

Code sending audio samples to spreakers is showed in above code listing in previous section.
But let me explain `format` object given to `Speaker` constructor as a parameter.
The `format` object in my case has following shape:

```JS
{
  channels: 2,
  sampleRate: 44100,
  bitDepth: 32,
  float: true,
  signed: true,
  version: 0,
  bitrateUpper: 0,
  bitrateNominal: 96000,
  bitrateLower: 0,
  bitrateWindow: 0
}
```

As we can read in `speaker` package documentation, Speaker supports following options in their constructor:

* `channels`
* `bitDepth`
* `sampleRate`
* `signed`
* `float`
* `samplesPerFrame`
* `device`

These all options are delivered in `format` object excluding `samplesPerFrame` and `device`.
But in these 2 options case we don't need to change default values, so we can go forward.
In `format` object are a few addidional data like `version` and fields connected to bitrate, but we can ignore this data in this moment as `Speaker` constructor do.

References:

* https://www.npmjs.com/package/speaker


## Final code

Final version of playing OGG file code is here:

```JS
import { createReadStream } from 'fs'
import path from 'path'

import ogg from '@suldashi/ogg'
import { dirname } from 'dirname-filename-esm'
import { parseFile } from 'music-metadata'
import Speaker from 'speaker'
import vorbis from 'vorbis'



const file = path.resolve(
  dirname(import.meta),
  '../nyan.ogg',
)

const metadata = await parseFile(file)
console.log({ metadata })

function play () {
  const decoder = new ogg.Decoder()
  decoder.on('stream', stream => {
    const vd = new vorbis.Decoder()
    vd.on('format', format => {
      console.log({ format })
      vd.pipe(new Speaker(format))
    })
    stream.pipe(vd)
  
    stream.on('end', () => {
      play()
    })
  })
  decoder.on('error', err => {
    console.log({err})
  })

  createReadStream(file).pipe(decoder)
}
play()
```

You can now listen to the OGG file. It's your prize!

##### OGG file is playing
<!-- ![OGG file is playing](audio/nyan.ogg) -->
<audio controls src="./audio/nyan.ogg">
  Your browser does not support the audio tag or OGG files.
</audio>

References:

* https://archive.org/details/nyannyannyan
