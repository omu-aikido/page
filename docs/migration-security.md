# Nuxt migration security notes

問い合わせ API の Origin、16 KiB、strict schema、Rate Limiting、Turnstile、配送 timeout は `server/api/contact-app.ts` で処理する。Cloudflare の binding 名は `wrangler.toml` を正とする。

## CSP の残課題

Nuxt の hydration payload と UnoCSS が生成する inline style を nonce/hash 化する仕組みを staging でまだ検証できていない。このため、現時点の HTTP CSP は `script-src` と `style-src` に `unsafe-inline` を残している。Astro 時代の `unsafe-eval` は削除した。

本番切替前に Turnstile と Nuxt hydration を staging で確認し、nonce 対応が成立する場合は `unsafe-inline` を削除する。成立しないまま切り替える場合、この制約を残存リスクとして扱う。

## Staging で必要な確認

- `CONTACT_ALLOWED_ORIGINS` と `TURNSTILE_HOSTNAME` を staging の正式 hostname に限定する。
- production と staging で Turnstile sitekey/secret を分ける。
- `CONTACT_RATE_LIMITER` の namespace と 1 分 10 回の誤検知を確認する。
- Email、Discord、Workers AI の片系障害と timeout を実 binding で確認する。
