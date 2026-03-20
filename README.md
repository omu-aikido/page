## 概要

- SSG: Astro
- JS Framework: Astro, Vue.js
- UI Framework: UnoCSS, Headless UI,
- Deployment: Cloudflare Workers（wrangler）

## 前提

- bun
- Node.js

## クイックスタート

```sh
# リポジトリルートで実行
bun install
bun dev              # 開発サーバを起動（通常 http://localhost:4321）
```

## package.json の主要スクリプト

（プロジェクトの `package.json` を反映）

- `bun dev`
  concurrently "astro dev" "wrangler dev --port=8788" — ローカル開発サーバを起動（ポート 4321 と 8788）

- `bun build`
  astro build — 手動で `bun run prebuild && bun run build` を実行する必要がある

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

- `src/pages/` — ルーティングされるページ（`.astro`, `.mdx`, `.md`）
- `src/components/` — コンポーネント（`root/`, `ui/`, `component/` サブディレクトリ）
- `src/layouts/` — レイアウトコンポーネント
- `src/styles/` — グローバルスタイル
- `src/assets/` — 画像アセット
- `lib/` — ユーティリティライブラリ（Hono クライアントなど）
- `worker/` — Cloudflare Workers（Hono を使用）
- `public/` — 静的アセット
- `package.json`, `README.md` 等プロジェクトルートに配置

## デプロイ（Cloudflare Workers）

`main` ブランチに push または PR がマージされると自動的にデプロイされます。
