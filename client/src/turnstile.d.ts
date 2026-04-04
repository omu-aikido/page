interface TurnstileInstance {
  render: (
    container: string | HTMLElement,
    params: Record<string, unknown>,
  ) => string;
  execute: (widgetId?: string) => void;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string | undefined;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
  }
}

export {};
