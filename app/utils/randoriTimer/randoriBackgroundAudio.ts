import { audioBufferToWav } from "~/utils/randoriTimer/audioBufferToWav";
import { scheduleRandoriBell } from "~/utils/randoriTimer/randoriBellAudio";

export const BACKGROUND_AUDIO_MAX_SECONDS = 600;
export const RANDORI_AUDIO_SAMPLE_RATE = 24_000;
export const RANDORI_AUDIO_TAIL_SECONDS = 2;

export async function renderRandoriWav(durations: readonly number[]) {
  const totalDuration = durations.reduce(
    (sum, duration) => sum + Math.max(0, duration),
    0,
  );
  if (totalDuration > BACKGROUND_AUDIO_MAX_SECONDS) {
    throw new RangeError("Background playback supports up to 600 seconds.");
  }

  const context = new OfflineAudioContext(
    1,
    Math.ceil(
      (totalDuration + RANDORI_AUDIO_TAIL_SECONDS) * RANDORI_AUDIO_SAMPLE_RATE,
    ),
    RANDORI_AUDIO_SAMPLE_RATE,
  );
  scheduleRandoriBell(context, context.destination, "start", 0);

  let cursor = 0;
  for (let index = 0; index < durations.length; index += 1) {
    cursor += Math.max(0, durations[index] ?? 0);
    scheduleRandoriBell(
      context,
      context.destination,
      index === durations.length - 1 ? "finish" : "change",
      cursor,
    );
  }

  return audioBufferToWav(await context.startRendering());
}
