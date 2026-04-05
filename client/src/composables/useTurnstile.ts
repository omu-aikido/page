import { ref, onMounted, onUnmounted, nextTick } from "vue";

export type TurnstileStatus =
  | "idle"
  | "checking"
  | "verified"
  | "expired"
  | "error";

export function useTurnstile(siteKey: string) {
  const token = ref("");
  const status = ref<TurnstileStatus>("idle");
  const widgetRef = ref<HTMLElement | null>(null);
  let widgetId: string | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;

  function reset() {
    token.value = "";
    status.value = "idle";
    if (widgetId !== undefined) {
      window.turnstile?.reset(widgetId);
    }
  }

  function executeChallenge() {
    status.value = "checking";
    if (widgetId !== undefined) {
      window.turnstile?.execute(widgetId);
    }
  }

  onMounted(async () => {
    const tryRender = () => {
      if (!siteKey) {
        console.warn("Turnstile siteKey is missing");
        return;
      }

      if (!widgetRef.value) {
        timerId = setTimeout(tryRender, 100);
        return;
      }

      if (window.turnstile) {
        widgetId = window.turnstile.render(widgetRef.value, {
          sitekey: siteKey,
          mode: "inline",
          callback: (t: string) => {
            token.value = t;
            status.value = "verified";
          },
          "expired-callback": () => {
            token.value = "";
            status.value = "expired";
          },
          "error-callback": () => {
            token.value = "";
            status.value = "error";
          },
          "before-interactive-callback": () => {
            status.value = "checking";
          },
        });
      } else {
        timerId = setTimeout(tryRender, 100);
      }
    };

    requestAnimationFrame(async () => {
      await nextTick();
      tryRender();
    });
  });

  onUnmounted(() => {
    clearTimeout(timerId);
    if (widgetId !== undefined) {
      window.turnstile?.remove(widgetId);
    }
  });

  return { token, status, widgetRef, reset, executeChallenge };
}
