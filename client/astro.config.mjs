// @ts-check
import { defineConfig } from "astro/config";

import vue from "@astrojs/vue";
import UnoCSS from "unocss/astro";

import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import astroLLMsGenerator from "astro-llms-generate";
import rehypeExternalLinks from "rehype-external-links";

// https://astro.build/config
export default defineConfig({
  site: "https://omu-aikido.com",
  output: "static",
  trailingSlash: "never",
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
          content: { type: 'text', value: ' ↗ ' }
        },
      ],
    ],
  },
  integrations: [
    vue(),
    mdx(),
    sitemap(),
    astroLLMsGenerator({
      title: "大阪公立大学合氣道部",
      description:
        "大阪公立大学で活動する体育会所属の合気道団体である、大阪公立大学合氣道部のホームページです。\nなお、当団体は「大阪公立大学合氣道部」であり、「大阪公立大学体育会合気道部」とは別の団体です。",
    }),
    UnoCSS(),
  ],
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8787",
          changeOrigin: true,
        },
      },
    },
  },
});
