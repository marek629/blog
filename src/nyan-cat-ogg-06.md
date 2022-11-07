![](img/header-tap-nyan-module.png)

*Written on 2022-11-07 by Marek Jędryka*

# Part 6: Mutate audio output on error detected in TAP stream

I have described error detection solution [recently](nyan-cat-ogg-05.md).
I have done audio signal processing even [earlier](nyan-cat-ogg-04.md).

Today, I want to use the both of above together.
Let's mutate the sound starting when the first error occurred in TAP stream.

## Inter Process Communication

To be honest, I realized that I need Inter Process Communication (IPC) mechanism not until implementation of `TapObserver` and `tremolo` modules, just I forgot I have two separated processes.
It happens sometimes.
I think that IPC description as first should be easy to read and understand for you.

### Main Process

The main process is specialized in collecting and printing TAP data.
And obviously, managing the others processes, befitting the main process.

In the stream observation area, I have to do the following things:

* listen to the `observer` object's `change` event
* provide a communication channel between the processes (the forked process has created the channel by default)
* send the `observer` object's data snapshot using `propertiesNamesReplacer` function

```JS
const propertiesNamesReplacer = obj => Object.entries(
  Object.getOwnPropertyDescriptors(obj.__proto__)
)
  .filter(([name, item]) => typeof item.get === 'function')
  .map(([name]) => name)
const sendObserverState = (observer, audio) => audio.send({
  kind: 'tap-stream-observer-state',
  value: JSON.stringify(observer, propertiesNamesReplacer(observer)),
})
export const connectObserverToAudio = (observer, audio) => {
  sendObserverState(observer, audio)
  observer.on('changed', () => sendObserverState(observer, audio))
}

const controller = new AbortController()
const audio = fork(
  resolve(dirname(import.meta), 'audio/play.js'),
  [argv.audio], {
    signal: controller.signal,
  },
)
const observer = new TapObserver
connectObserverToAudio(observer, audio)
```

### Audio Player Process

In the stream observation area, I have to do the following things in the audio player process:

* receive a message from the main process
* initialize dummy object for proper working before the first message would be received

```JS
const observerDummyState = Object.freeze({
  isValid: true,
})
const config = {
  observer: observerDummyState,
}
process.on('message', ({ kind, value }) => {
  switch (kind) {
    case 'tap-stream-observer-state':
      config.observer = JSON.parse(value)
      break
    default:
      break
  }
})
```


The `config` object is a container for `observer` state data snapshots.
It will be used in audio stream processing in the same process.
It's described in the next section.

#### References

* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter
* https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options

## Mutate your Output Audio Stream

To do any modification on the audio stream, I need to pipe an object of `Transform` class.
In slightly more advanced cases, you could need some setup based on audio format file metadata and pass it to your transformer as configuration.
That is also the case here.

```JS
const decoder = new ogg.Decoder()
decoder.on('stream', stream => {
  const vd = new vorbis.Decoder()
  vd.on('format', format => {
    const ChunkBuffer = chunkTypedArray(format)
    const lfo = new LowFrequencyOscilator({
      sampling: format.sampleRate,
      frequency: 3,
    })
    vd
      .pipe(tremolo({ ChunkBuffer, lfo }))
      .pipe(new Speaker(format))
  })
  stream.pipe(vd)
})
```

### Tremolo effect

Configurable Tremolo effect implementation supporting `observer` object provided from the closure is passed below.

```JS
let n = 0
const tremolo = ({
  ChunkBuffer,
  lfo,
}) => new Transform({
  transform: (chunk, encoding, callback) => {
    const { observer } = config
    if (observer.isValid) {
      callback(null, chunk)
      return
    }
    const array = new ChunkBuffer(chunk.buffer)
    callback(null, new Uint8Array(array.map(sample => sample * lfo.at(n++)).buffer))
  }
})
```


## Observe your Input TAP Stream

I needed a class that inherits TransformStream but does not transform itself, so it should be a kind of transparent transformation.
It's caused by the necessity to _observe_ the stream, not real transformation.
Fortunately, the needed transformation class implementation exists in node's `stream` module and it is called `PassThrough`.

My observer class instance should emit an event when error message occurs in observed TAP stream and should emit the event once, the first error occurs.
I mentioned this requirement as optional in the [previous article](nyan-cat-ogg-05.md) and I denied it then.
But as lazy people say, all is not lost that is delayed.

So I had to modify `_transform` method of `TapObserver` class as you can see below.


```JS
  _transform(chunk, encoding, callback) {
    if (this.#errorRegex.test(this._string(chunk))) {
      const oldFlag = this.#errorOccured
      this.#errorOccured = true
      if (this.#errorOccured !== oldFlag) this.emit('changed')
    }
    super._transform(chunk, encoding, callback)
  }
```

### Pipe it!

The next thing I have to do is connect the observer object to the stream pipeline.
I should put it in right order.
I think that piping it after all TAP input streams are merged is the best option.

```JS
const sources = [
  es.merge(tasks.map(proc => proc.stdout)),
  tapMerge(),
  observer,
]
pipeline(
  [
    ...sources,
    process.stdout
  ],
  () => {},
)
```

#### References

* https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#class-streampassthrough
* https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#streampipelinestreams-callback 

## Working

##### Mutated sound at TAP error occurred
<!-- ![Mutated sound at TAP error occurred](video/nyan-cat-5.webm) -->
<video controls src="./video/nyan-cat-5.webm" width="768">
  Your browser does not support the video tag or WEBM files.
</video>

As you can see and hear, the sound is mutated by Tremolo effect since the first error occurs in TAP text stream.
