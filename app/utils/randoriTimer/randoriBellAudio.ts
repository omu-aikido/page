export type BellCue = "start" | "change" | "finish";

type OutputBus = {
  input: AudioNode;
  dispose: () => void;
};

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

export function scheduleRandoriBell(
  context: BaseAudioContext,
  destination: AudioNode,
  cue: BellCue,
  startTime: number,
) {
  const output = createOutput(context, destination);
  const segments = getSegments(cue);

  for (const { offset, duration } of segments) {
    const start = startTime + offset;
    addNoiseBurst(context, output.input, start);
    addWhistleTone(context, output.input, start, duration, {
      type: "square",
      volume: 0.62,
      frequency: 2860,
      glide: 1.018,
    });
    addWhistleTone(context, output.input, start, duration, {
      type: "sawtooth",
      volume: 0.32,
      frequency: 2890,
      glide: 1.012,
    });
    addWhistleTone(context, output.input, start, duration, {
      type: "triangle",
      volume: 0.42,
      frequency: 1430,
      glide: 1.01,
    });
    // スマートフォンの小型スピーカーでも減衰しにくい中域を補う。
    addWhistleTone(context, output.input, start, duration, {
      type: "sine",
      volume: 0.5,
      frequency: 720,
      glide: 1.015,
    });
    addWhistleTone(context, output.input, start, duration, {
      type: "sine",
      volume: 0.2,
      frequency: 4300,
      glide: 1.008,
    });
  }

  const endTime =
    startTime +
    Math.max(...segments.map(({ offset, duration }) => offset + duration));

  if (typeof window !== "undefined" && "close" in context) {
    window.setTimeout(
      output.dispose,
      Math.max(0, endTime - context.currentTime + 0.5) * 1000,
    );
  }

  return endTime;
}

function getSegments(cue: BellCue) {
  if (cue === "start") return [{ offset: 0, duration: 0.5 }];
  if (cue === "change") {
    return [
      { offset: 0, duration: 0.12 },
      { offset: 0.2, duration: 0.12 },
    ];
  }
  return [
    { offset: 0, duration: 0.14 },
    { offset: 0.22, duration: 0.78 },
  ];
}

function createOutput(
  context: BaseAudioContext,
  destination: AudioNode,
): OutputBus {
  const input = context.createGain();
  const drive = context.createWaveShaper();
  const compressor = context.createDynamicsCompressor();
  const makeupGain = context.createGain();
  const limiter = context.createWaveShaper();

  input.gain.value = 2.4;
  drive.curve = createDriveCurve(3.6);
  drive.oversample = "4x";
  compressor.threshold.value = -18;
  compressor.knee.value = 2;
  compressor.ratio.value = 20;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.09;
  makeupGain.gain.value = 1.8;
  limiter.curve = createLimiterCurve();
  limiter.oversample = "4x";
  input
    .connect(drive)
    .connect(compressor)
    .connect(makeupGain)
    .connect(limiter)
    .connect(destination);

  return {
    input,
    dispose() {
      input.disconnect();
      drive.disconnect();
      compressor.disconnect();
      makeupGain.disconnect();
      limiter.disconnect();
    },
  };
}

function addWhistleTone(
  context: BaseAudioContext,
  output: AudioNode,
  start: number,
  duration: number,
  options: {
    type: OscillatorType;
    volume: number;
    frequency: number;
    glide: number;
  },
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const attack = 0.003;
  const release = Math.min(0.03, duration * 0.25);

  oscillator.type = options.type;
  oscillator.frequency.setValueAtTime(options.frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(
    options.frequency * options.glide,
    start + Math.min(0.05, duration * 0.4),
  );
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(options.volume, start + attack);
  gain.gain.setValueAtTime(options.volume, start + duration - release);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(output);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function addNoiseBurst(
  context: BaseAudioContext,
  output: AudioNode,
  start: number,
) {
  let noiseBuffer = noiseBuffers.get(context);
  if (!noiseBuffer) {
    noiseBuffer = createNoiseBuffer(context);
    noiseBuffers.set(context, noiseBuffer);
  }

  const source = context.createBufferSource();
  const bandPass = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = noiseBuffer;
  bandPass.type = "bandpass";
  bandPass.frequency.value = 3200;
  bandPass.Q.value = 0.8;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.65, start + 0.0015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.035);
  source.connect(bandPass).connect(gain).connect(output);
  source.start(start);
  source.stop(start + 0.04);
}

function createNoiseBuffer(context: BaseAudioContext) {
  const buffer = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * 0.05),
    context.sampleRate,
  );
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createDriveCurve(amount: number) {
  const curve = new Float32Array(1024);
  for (let index = 0; index < curve.length; index += 1) {
    const input = (index * 2) / (curve.length - 1) - 1;
    curve[index] = Math.tanh(input * amount);
  }
  return curve;
}

function createLimiterCurve() {
  const curve = new Float32Array(1024);
  const amount = 1.5;
  const normalization = Math.tanh(amount);
  for (let index = 0; index < curve.length; index += 1) {
    const input = (index * 2) / (curve.length - 1) - 1;
    curve[index] = Math.tanh(input * amount) / normalization;
  }
  return curve;
}
