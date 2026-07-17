export type RandoriPreset = {
  id: string;
  name: string;
  durations: number[];
  builtIn?: boolean;
};

export const builtInRandoriPresets: RandoriPreset[] = [
  { id: "three", name: "3人掛け", durations: [30, 30, 30], builtIn: true },
  {
    id: "four",
    name: "4人掛け",
    durations: [30, 30, 30, 60],
    builtIn: true,
  },
];

export function formatDurations(durations: number[]) {
  return durations.map((seconds) => `${seconds}秒`).join(" / ");
}
