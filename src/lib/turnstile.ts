// oxlint-disable typescript/unbound-method
export const TURNSTILE_API_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export interface TurnstileRenderCallbacks {
  onSuccess(token: string): void;
  onExpire(): void;
  onError(code?: string): void;
  onBeforeInteractive(): void;
}

export interface TurnstileRenderApi {
  render(
    container: string | HTMLElement,
    params: Record<string, unknown>,
  ): string;
  remove(widgetId?: string): void;
}

export function mountTurnstileWidget(
  api: TurnstileRenderApi,
  container: HTMLElement,
  siteKey: string,
  callbacks: TurnstileRenderCallbacks,
): string {
  return api.render(container, {
    sitekey: siteKey,
    callback: callbacks.onSuccess,
    "expired-callback": callbacks.onExpire,
    "error-callback": callbacks.onError,
    "before-interactive-callback": callbacks.onBeforeInteractive,
  });
}

export function remountTurnstileWidget(
  api: TurnstileRenderApi,
  widgetId: string | undefined,
  container: HTMLElement,
  siteKey: string,
  callbacks: TurnstileRenderCallbacks,
): string {
  if (widgetId !== undefined) {
    api.remove(widgetId);
  }

  return mountTurnstileWidget(api, container, siteKey, callbacks);
}
