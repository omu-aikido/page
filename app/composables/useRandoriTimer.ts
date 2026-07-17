import type { RandoriPreset } from "~/utils/randoriTimer";

const STORAGE_KEY = "omu-aikido-randori-presets-v2";

export function useRandoriTimer() {
  const bell = useRandoriBell();
  const durations = ref([30, 30, 30]);
  const customPresets = ref<RandoriPreset[]>([]);
  const selectedId = ref("three");
  const running = ref(false);
  const remaining = ref(30);
  const activeRound = ref(1);
  let interval: ReturnType<typeof setInterval> | undefined;

  const currentDuration = computed(
    () => durations.value[activeRound.value - 1] ?? 30,
  );
  const displayTime = computed(() => {
    const minutes = Math.floor(remaining.value / 60);
    const seconds = remaining.value % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  });
  const progress = computed(() =>
    currentDuration.value
      ? Math.max(
          0,
          Math.min(100, (remaining.value / currentDuration.value) * 100),
        )
      : 0,
  );

  function stop() {
    if (interval) clearInterval(interval);
    interval = undefined;
    running.value = false;
  }

  function reset() {
    stop();
    activeRound.value = 1;
    remaining.value = durations.value[0] ?? 30;
  }

  function advance() {
    if (activeRound.value >= durations.value.length) {
      bell.play("finish");
      stop();
      remaining.value = 0;
      return;
    }
    activeRound.value += 1;
    remaining.value = currentDuration.value;
    bell.play("change");
  }

  function toggle() {
    if (running.value) return stop();
    if (remaining.value === 0) reset();
    bell.play("start");
    running.value = true;
    interval = setInterval(() => {
      if (remaining.value > 1) remaining.value -= 1;
      else advance();
    }, 1000);
  }

  function setDurations(values: number[], presetId = "") {
    durations.value = values.map((value) =>
      Math.max(5, Math.min(600, Math.round(value || 5))),
    );
    selectedId.value = presetId;
  }

  function savePreset(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const preset: RandoriPreset = {
      id: crypto.randomUUID(),
      name: trimmedName,
      durations: [...durations.value],
    };
    customPresets.value.push(preset);
    selectedId.value = preset.id;
  }

  function deletePreset(id: string) {
    customPresets.value = customPresets.value.filter(
      (preset) => preset.id !== id,
    );
    if (selectedId.value === id) selectedId.value = "";
  }

  watch(durations, reset, { deep: true });
  watch(
    customPresets,
    (presets) => {
      if (import.meta.client)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    },
    { deep: true },
  );

  onMounted(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) customPresets.value = JSON.parse(stored) as RandoriPreset[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  });
  onBeforeUnmount(stop);

  return {
    activeRound,
    customPresets,
    displayTime,
    durations,
    progress,
    remaining,
    running,
    selectedId,
    deletePreset,
    reset,
    savePreset,
    setDurations,
    toggle,
  };
}
