## 概要

- SSG: Astro
- JS Framework: Astro, Vue.js
- UI Framework: UnoCSS, Headless UI,
- Deployment: Cloudflare Workers（wrangler）

## 前提

- bun

## クイックスタート

```sh
# リポジトリルートで実行
bun install
bun dev              # 開発サーバを起動（通常 http://localhost:4321）
```

## scripts

- `bun dev`
  Turbo launch "astro dev" and "wrangler dev --port=8788" — ローカル開発サーバを起動（ポート 4321 と 8788）

- `bun build`
  astro build

- `bun preview`
  astro build && wrangler pages dev — ローカルエミュレーションを起動

- `bun deploy`
  astro build && wrangler versions upload --preview-alias preview — Cloudflare Workers にデプロイ

- `bun cf-typegen`
  wrangler types — Wrangler 用の型生成

- `bun format`
  bunx oxfmt . — コード整形

- `bun prebuild`
  bun run cf-typegen — ビルド前に型生成

## ディレクトリ構成

- `client/src/pages/` — ルーティングされるページ（`.astro`, `.mdx`, `.md`）
- `client/src/components/` — コンポーネント（`root/`, `ui/`, `component/` サブディレクトリ）
- `client/src/layouts/` — レイアウトコンポーネント
- `client/src/styles/` — グローバルスタイル
- `client/src/assets/` — 画像アセット
- `client/lib/` — ユーティリティライブラリ（Hono クライアントなど）
- `client/public/` — 静的アセット
- `server/` — Cloudflare Workers（Hono を使用）
- `package.json`, `README.md` 等プロジェクトルートに配置

## デプロイ（Cloudflare Workers）

This project was created using `bun init` in bun v1.3.11. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
