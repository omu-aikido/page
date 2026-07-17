import { describe, expect, it } from "vite-plus/test";

import { audioBufferToWav } from "../app/utils/audioBufferToWav";

describe("audioBufferToWav", () => {
  it("モノラル24 kHzのPCM16 WAVを生成する", async () => {
    const samples = new Float32Array([-1, -0.5, 0, 0.5, 1]);
    const audioBuffer = {
      numberOfChannels: 1,
      length: samples.length,
      sampleRate: 24_000,
      getChannelData: () => samples,
    } as AudioBuffer;

    const blob = audioBufferToWav(audioBuffer);
    const view = new DataView(await blob.arrayBuffer());

    expect(blob.type).toBe("audio/wav");
    expect(readAscii(view, 0, 4)).toBe("RIFF");
    expect(readAscii(view, 8, 4)).toBe("WAVE");
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(24_000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(readAscii(view, 36, 4)).toBe("data");
    expect(view.getUint32(40, true)).toBe(samples.length * 2);
    expect(view.getInt16(44, true)).toBe(-0x8000);
    expect(view.getInt16(52, true)).toBe(0x7fff);
  });
});

function readAscii(view: DataView, offset: number, length: number) {
  return Array.from({ length }, (_, index) =>
    String.fromCharCode(view.getUint8(offset + index)),
  ).join("");
}
