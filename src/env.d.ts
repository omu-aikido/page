type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITEKEY?: string;
}

export {};

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}

/// <reference types="astro/client" />
