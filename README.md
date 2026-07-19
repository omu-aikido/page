# 大阪公立大学合氣道部 website

Nuxt 4 / Nitro で構築し、Cloudflare Workers に `cloudflare_module` preset で配置するウェブサイトです。公開情報と問い合わせページは PreRender、カレンダー画面は CSR + PreRender、`/__calendar` は Workers Cache、`/api/contact` は Hono が処理します。

## Commands

```sh
vp install
vp dev
vp check
vp run typecheck
vp test
vp run build
vp run preview
```

Cloudflare binding の型は `vp run generate-types` で再生成します。Workers の dry-run は build 後に次で確認できます。

```sh
vp exec wrangler deploy --dry-run
```

## Structure

- `app/`: Vue pages、layout、components
- `content/pages/`: 公開 Markdown の source of truth
- `server/api/`: Hono 問い合わせ API
- `server/routes/`: カレンダーJSONなどのNitro routes
- `server/services/`: カレンダー、問い合わせ配送処理
- `shared/schemas/`: client/server 共有 ArkType validator
- `scripts/generate-site-content.ts`: Markdown HTML と llms ファイルの build-time 生成
