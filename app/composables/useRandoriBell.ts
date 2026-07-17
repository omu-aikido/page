export function useRandoriBell() {
  let audioContext: AudioContext | undefined;

  function play(final = false) {
    if (!import.meta.client) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    audioContext ??= new AudioContextClass();
    void audioContext.resume();

    const now = audioContext.currentTime;
    const strikes = final ? [0, 0.2, 0.4] : [0, 0.22];

    strikes.forEach((delay, strikeIndex) => {
      const start = now + delay;
      const frequency = final && strikeIndex === 2 ? 1318.51 : 1046.5;

      addTone(start, frequency, "square", 0.2, 0.22);
      addTone(start, frequency * 2, "sine", 0.1, 0.28);
    });
  }

  function addTone(
    start: number,
    frequency: number,
    type: OscillatorType,
    volume: number,
    duration: number,
  ) {
    const oscillator = audioContext!.createOscillator();
    const gain = audioContext!.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(audioContext!.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  return { play };
}
