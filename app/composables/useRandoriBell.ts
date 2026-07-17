type BellCue = "start" | "change" | "finish";

type OutputBus = {
  input: AudioNode;
  dispose: () => void;
};

export function useRandoriBell() {
  let audioContext: AudioContext | undefined;
  let noiseBuffer: AudioBuffer | undefined;

  function play(cue: BellCue) {
    if (!import.meta.client) return;

    const AudioContextClass =
      window.AudioContext ||
      (
        window as Window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    audioContext ??= new AudioContextClass();

    // suspendedでも予約された音はresume後に再生される。
    void audioContext.resume();

    const now = audioContext.currentTime + 0.01;
    const output = createOutput();
    const segments = getSegments(cue);

    for (const { offset, duration } of segments) {
      const start = now + offset;

      // アタックを目立たせるノイズ成分
      addNoiseBurst(output.input, start);

      // 主成分。スマートフォンでも聞こえやすい中高域を中心にする。
      addWhistleTone(output.input, start, duration, {
        type: "square",
        volume: 0.62,
        frequency: 2860,
        glide: 1.018,
      });

      addWhistleTone(output.input, start, duration, {
        type: "sawtooth",
        volume: 0.32,
        frequency: 2890,
        glide: 1.012,
      });

      // 低めの成分を加え、細すぎる音になるのを防ぐ。
      addWhistleTone(output.input, start, duration, {
        type: "triangle",
        volume: 0.42,
        frequency: 1430,
        glide: 1.01,
      });

      // 高域成分を少量追加して存在感を出す。
      addWhistleTone(output.input, start, duration, {
        type: "sine",
        volume: 0.2,
        frequency: 4300,
        glide: 1.008,
      });
    }

    const lastEnd = Math.max(
      ...segments.map(({ offset, duration }) => offset + duration),
    );

    window.setTimeout(output.dispose, (lastEnd + 0.5) * 1000);
  }

  function getSegments(cue: BellCue) {
    if (cue === "start") {
      return [{ offset: 0, duration: 0.5 }];
    }

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

  function createOutput(): OutputBus {
    const context = audioContext!;

    const input = context.createGain();
    const drive = context.createWaveShaper();
    const compressor = context.createDynamicsCompressor();
    const makeupGain = context.createGain();
    const limiter = context.createWaveShaper();

    // 波形を積極的に飽和させ、平均音量を上げる。
    input.gain.value = 2.4;

    drive.curve = createDriveCurve(3.6);
    drive.oversample = "4x";

    // ピークを抑え、短い音でも密度を高くする。
    compressor.threshold.value = -18;
    compressor.knee.value = 2;
    compressor.ratio.value = 20;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.09;

    // コンプレッションで下がった音量を戻す。
    makeupGain.gain.value = 1.8;

    // 最終出力が極端にクリップしないように抑える。
    limiter.curve = createLimiterCurve();
    limiter.oversample = "4x";

    input
      .connect(drive)
      .connect(compressor)
      .connect(makeupGain)
      .connect(limiter)
      .connect(context.destination);

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
    const context = audioContext!;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    const attack = 0.003;
    const release = Math.min(0.03, duration * 0.25);

    oscillator.type = options.type;
    oscillator.frequency.setValueAtTime(options.frequency, start);

    // 鳴り始めだけ少し高くすることで、笛らしい鋭さを出す。
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

    oscillator.addEventListener(
      "ended",
      () => {
        oscillator.disconnect();
        gain.disconnect();
      },
      { once: true },
    );
  }

  function addNoiseBurst(output: AudioNode, start: number) {
    const context = audioContext!;

    noiseBuffer ??= createNoiseBuffer(context);

    const source = context.createBufferSource();
    const bandPass = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = noiseBuffer;

    // クリック音ではなく、笛の息に近い帯域へ絞る。
    bandPass.type = "bandpass";
    bandPass.frequency.value = 3200;
    bandPass.Q.value = 0.8;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.65, start + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.035);

    source.connect(bandPass).connect(gain).connect(output);

    source.start(start);
    source.stop(start + 0.04);

    source.addEventListener(
      "ended",
      () => {
        source.disconnect();
        bandPass.disconnect();
        gain.disconnect();
      },
      { once: true },
    );
  }

  function createNoiseBuffer(context: AudioContext) {
    const duration = 0.05;
    const buffer = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * duration),
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

  return { play };
}
