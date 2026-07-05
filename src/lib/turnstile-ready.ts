export function canRenderTurnstile(
  turnstile:
    | {
        render?: (
          container: string | HTMLElement,
          params: Record<string, unknown>,
        ) => string;
      }
    | undefined,
): boolean {
  return typeof turnstile?.render === "function";
}
