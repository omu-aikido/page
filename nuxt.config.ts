const staticRoutes = [
  "/",
  "/about",
  "/about/aikido",
  "/about/links",
  "/access",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/support",
  "/terms-of-service",
  "/sitemap-index.xml",
];

const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
    "connect-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
    "frame-src https://challenges.cloudflare.com https://www.google.com",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
};

export default defineNuxtConfig({
  compatibilityDate: "2026-07-17",
  devtools: { enabled: false },
  modules: ["@unocss/nuxt", "@nuxtjs/sitemap"],
  css: ["~/assets/global.css"],
  site: {
    url: "https://omu-aikido.com",
    name: "大阪公立大学合氣道部",
  },
  app: {
    head: {
      htmlAttrs: { lang: "ja", class: "base" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "color-scheme", content: "light dark" },
        {
          name: "theme-color",
          content: "#ffffff",
          media: "(prefers-color-scheme: light)",
        },
        {
          name: "theme-color",
          content: "#1a1a1a",
          media: "(prefers-color-scheme: dark)",
        },
      ],
      link: [
        { rel: "sitemap", href: "/sitemap-index.xml" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
        { rel: "preconnect", href: "https://challenges.cloudflare.com" },
      ],
    },
  },
  runtimeConfig: {
    public: {
      turnstileSiteKey: process.env.PUBLIC_CF_TURNSTILE_SITEKEY ?? "",
    },
    contactAllowedOrigins:
      process.env.CONTACT_ALLOWED_ORIGINS ?? "https://omu-aikido.com",
    turnstileHostname: process.env.TURNSTILE_HOSTNAME ?? "omu-aikido.com",
  },
  routeRules: {
    ...Object.fromEntries(
      staticRoutes.map((route) => [route, { prerender: true }]),
    ),
    "/calendar": {
      ssr: true,
      prerender: false,
      headers: { "Cache-Control": "no-store" },
    },
    "/calendar/monthly": {
      ssr: true,
      prerender: false,
      headers: { "Cache-Control": "no-store" },
    },
    "/apps/lotAikido": { ssr: false, prerender: true },
    "/api/**": {
      cors: false,
      headers: { "Cache-Control": "no-store" },
    },
    "/__calendar": { headers: { "Cache-Control": "no-store" } },
    "/**": { headers: securityHeaders },
  },
  nitro: {
    preset: "cloudflare_module",
    prerender: {
      crawlLinks: true,
      routes: staticRoutes,
      ignore: ["/calendar", "/calendar/monthly", "/__calendar"],
      failOnError: true,
    },
  },
  sitemap: {
    exclude: ["/api/**", "/404"],
  },
  experimental: {
    payloadExtraction: false,
    viewTransition: true,
  },
  vite: {
    optimizeDeps: {
      include: ["arktype"],
    },
  },
  unocss: {
    nuxtLayers: true,
  },
});
