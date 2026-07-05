import { ref, onMounted, onUnmounted, nextTick } from "vue";

import { mountTurnstileWidget, remountTurnstileWidget } from "@/lib/turnstile";
import { canRenderTurnstile } from "@/lib/turnstile-ready";

export type TurnstileStatus =
  | "idle"
  | "checking"
  | "verified"
  | "expired"
  | "error";

export function useTurnstile(siteKey: string) {
  const token = ref("");
  const status = ref<TurnstileStatus>("idle");
  const errorCode = ref<string | null>(null);
  const widgetRef = ref<HTMLElement | null>(null);
  let widgetId: string | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;

  function mountOrRemountWidget() {
    if (!siteKey) {
      console.warn("Turnstile siteKey is missing");
      return;
    }

    if (!widgetRef.value || !window.turnstile) {
      return;
    }

    widgetId = remountTurnstileWidget(
      window.turnstile,
      widgetId,
      widgetRef.value,
      siteKey,
      {
        onSuccess: (t: string) => {
          token.value = t;
          status.value = "verified";
        },
        onExpire: () => {
          token.value = "";
          status.value = "expired";
        },
        onError: (code?: string) => {
          token.value = "";
          status.value = "error";
          errorCode.value = code ?? null;
          console.error("Turnstile error", code ?? "(no code)");
        },
        onBeforeInteractive: () => {
          status.value = "checking";
        },
      },
    );
  }

  function reset() {
    token.value = "";
    status.value = "idle";
    errorCode.value = null;
    mountOrRemountWidget();
  }

  function executeChallenge() {
    reset();
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

      if (
        canRenderTurnstile(window.turnstile) &&
        window.turnstile !== undefined
      ) {
        widgetId = mountTurnstileWidget(
          window.turnstile,
          widgetRef.value,
          siteKey,
          {
            onSuccess: (t: string) => {
              token.value = t;
              status.value = "verified";
            },
            onExpire: () => {
              token.value = "";
              status.value = "expired";
            },
            onError: (code?: string) => {
              token.value = "";
              status.value = "error";
              errorCode.value = code ?? null;
              console.error("Turnstile error", code ?? "(no code)");
            },
            onBeforeInteractive: () => {
              status.value = "checking";
            },
          },
        );
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

  return { token, status, errorCode, widgetRef, reset, executeChallenge };
}
