![](img/header-tap-nyan-module.png)

*Written on 2022-09-09 by Marek Jędryka*

# Part 4: Audio signal processing first steps

In this article, I will describe my first steps in audio signal processing.
It's not my very first time.
I used to signal process during my IT studies many years ago.
It will be interesting and fun to rediscover this area of knowledge.

## Iteration scope

I want to learn signal processing by example.
Tap-ogg project is a good place for practice, but size of changes shouldn't be too big.
The small size of the changes allows faster verification of assumptions and faster observation of effects of the work.

The simplest scope of the project changes is to modify the output sound stream when there is an error occurs in the input TAP stream produced by running tests.
Output sound should be modified since the error report is detected in the TAP stream to the end of tests running.

The requirements mean two problems to solve.
The first one is error detection in the input stream.
The second is proper audio processing.

## Error detection in TAP stream

Error detection should be easy to solve.
Probably it would be detected by a regular expression.
I will describe this later.

## Audio stream processing

To simplify the task, I considered what type of effect I should implement first.
I knew that it's much easier to implement to choose an effect based on a single sample value modification the opposite of complex signal processing.
So it must be not similar to an equalizer or any else spectrum-based effect.
After a short research, the tremolo effect caught my attention.
It's simple effect based on generated sine wave signal combined with the input sound samples.

To implement the tremolo effect I need the sine wave generator.
It is called low frequency oscillator (LFO).
It should be quite easy but please consider that the sine function operates on radian values.
It means the sine function returns 1 for half of π, 0 for π, and so on.
However, during audio stream processing in node.js, there are no radian values, only sample number is available.
The number of the sample I can recalculate to value in seconds.
It's still no radian value but it's possible to transform to value in radians as following.

```JS
const radianFromSampleNumber = ({
  sampling,
  frequency,
  number,
}) => (2 * number * frequency * Math.PI) / sampling
```

So I can implement my LFO now.

```JS
class LowFrequencyOscilator {
  #sampling = 44_100
  #frequency = 20

  constructor({ sampling, frequency }) {
    this.#sampling = sampling
    this.#frequency = frequency
  }

  at(n) {
    return Math.sin(radianFromSampleNumber({
      sampling: this.#sampling,
      frequency: this.#frequency,
      number: n,
    }))
  }
}
```

It's possible to build the tremolo effect function now.
I configured it as 3 Hz in this case.

```JS
const lfo = new LowFrequencyOscilator({
  sampling: 44_100,
  frequency: 3,
})
let n = 0
const tremolo = ({
  ChunkBuffer,
}) => new Transform({
  transform: (chunk, encoding, callback) => {
    const array = new ChunkBuffer(chunk.buffer)
    callback(null, new Uint8Array(array.map(sample => sample * lfo.at(n++)).buffer))
  }
})
```

And I can finally use it!

```JS
const vd = new vorbis.Decoder()
vd.on('format', format => {
  const ChunkBuffer = Float32Array
  vd
    .pipe(tremolo({ ChunkBuffer }))
    .pipe(new Speaker(format))
})
```

In reality, the `ChunkBuffer` value should be set based on decoded `format` metadata.
But it's not a gist, so it was hardcoded to simplify the listing.

References:

- https://www.fender.com/articles/tech-talk/pedal-board-primer-get-to-know-tremolo
- https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#class-streamtransform

## Testing

There are two well specified areas.

- LFO
- Getting `ChunkBuffer` type, the `TypedArray` child class

It sounds like good place to do Testing Driven Development (TDD).
So I did!
Reports are below.

```
  ✔ LowFrequencyOscilator › radian from sample number | 0
  ✔ LowFrequencyOscilator › radian from sample number | π / 6
  ✔ LowFrequencyOscilator › radian from sample number | π / 2
  ✔ LowFrequencyOscilator › radian from sample number | π
  ✔ LowFrequencyOscilator › radian from sample number | 3π / 2
  ✔ LowFrequencyOscilator › radian from sample number | 11π / 6
  ✔ LowFrequencyOscilator › radian from sample number | 2π
  ✔ LowFrequencyOscilator › sinewave value for 0
  ✔ LowFrequencyOscilator › sinewave value for π / 6
  ✔ LowFrequencyOscilator › sinewave value for π / 2
  ✔ LowFrequencyOscilator › sinewave value for π
  ✔ LowFrequencyOscilator › sinewave value for 3π / 2
  ✔ LowFrequencyOscilator › sinewave value for 11π / 6
  ✔ LowFrequencyOscilator › sinewave value for 2π
  ✔ chunkTypedArray › TypedArray class for given format should be Float32Array
  ✔ chunkTypedArray › TypedArray class for given format should be Float64Array
  ✔ chunkTypedArray › TypedArray class for given format should be Int8Array
  ✔ chunkTypedArray › TypedArray class for given format should be Int16Array
  ✔ chunkTypedArray › TypedArray class for given format should be Int32Array
  ✔ chunkTypedArray › TypedArray class for given format should be BigInt64Array
  ✔ chunkTypedArray › TypedArray class for given format should be Uint8Array
  ✔ chunkTypedArray › TypedArray class for given format should be Uint16Array
  ✔ chunkTypedArray › TypedArray class for given format should be Uint32Array
  ✔ chunkTypedArray › TypedArray class for given format should be BigUint64Array
  ✔ chunkTypedArray › throws Error for given format should be Unsupported float bit depth!
  ✔ chunkTypedArray › throws Error for given format should be Unsupported signed integer bit depth!
  ✔ chunkTypedArray › throws Error for given format should be Unsupported unsigned integer bit depth!
  ─

  27 tests passed
```
