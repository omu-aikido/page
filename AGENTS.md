# Repository Guidelines

## Project Overview

This is a monorepo static site generator with a serverless backend. It features an Astro-based frontend with Vue.js components, styled with UnoCSS, and a Cloudflare Workers backend using Hono. The project uses Bun as the package manager and Turbo for build orchestration.

**Tech Stack:**
- Frontend: Astro, Vue.js, UnoCSS, Headless UI
- Backend: Cloudflare Workers (Hono)
- Build: Bun, Turbo, Wrangler
- Linting: oxlint, oxfmt

## Project Structure

```
.
├── client/                    # Astro frontend workspace
│   ├── src/
│   │   ├── pages/             # Routable pages (.astro, .mdx, .md)
│   │   ├── components/        # Reusable components (root/, ui/, component/)
│   │   ├── layouts/           # Layout templates
│   │   ├── composables/       # Vue composables and utilities
│   │   ├── styles/            # Global styles
│   │   ├── lib/               # Utility libraries (Hono client, etc.)
│   │   ├── assets/            # Images and static assets
│   │   └── env.d.ts           # Type definitions
│   └── public/                # Static assets
├── worker/                    # Cloudflare Workers workspace
│   ├── hono/                  # Hono server implementation
│   ├── index.ts               # Entry point
│   └── package.json
└── package.json               # Root workspace configuration
```

## Build, Test, and Development Commands

```bash
# Install dependencies (required)
bun install

# Development server (Astro on 4321, Wrangler on 8788)
bun dev

# Build for production
bun build

# Preview production build locally
bun preview

# Code formatting (oxfmt)
bun format

# Linting (oxlint)
bun lint

# Check outdated dependencies
bun outdated

# Generate Wrangler types
bun cf-typegen
```

**Pre-build setup:** TypeScript types are automatically generated before building via the `prebuild` script.

## Coding Style & Naming Conventions

- **Language:** TypeScript (strict mode enabled)
- **Indentation:** 2 spaces
- **Formatting:** oxfmt (run `bun format` before committing)
- **Linting:** oxlint (run `bun lint` to check)
- **JSX:** React-style JSX imports, `module: "Preserve"` in tsconfig
- **Module Resolution:** bundler mode with ESNext target
- **Components:** Use PascalCase (e.g., `MyComponent.astro`, `MyComponent.vue`)
- **Utilities:** Use camelCase (e.g., `parseDate.ts`, `formatString.ts`)

**Type Safety:** Strict TypeScript mode is enforced. Use proper types and avoid `any` when possible.

## Testing Guidelines

There are no dedicated test scripts configured in the current setup. Before adding tests:
- Consider using Vitest for unit tests
- Consider using Playwright for e2e tests
- Place tests adjacent to source files or in a `tests/` directory
- Run linting (`bun lint`) and formatting (`bun format`) for code quality

## Commit & Pull Request Guidelines

**Commit Message Patterns:**
- Merge commits: `Merge pull request #N from user/branch`
- Feature/refactor: Descriptive English or Japanese (e.g., "Add skeleton-item class")
- Fixes: `Fix [description]` or `複数の脆弱性を修正` (Japanese acceptable)
- Cleanup: `[description]を削除` or "Remove [description]"

**Pull Request Requirements:**
- Link related issues in the PR description
- Use semantic branch naming: `feature/`, `fix/`, `refactor/`, `docs/`
- Include descriptive commit messages
- Ensure `bun lint` and `bun format` pass locally before pushing
- Request reviews from team members

## Deployment

This project deploys to **Cloudflare Workers** via Wrangler:

```bash
# Deploy preview
bun run cf-typegen && bun build && wrangler versions upload --preview-alias preview

# Production deployment
wrangler pages deploy dist/
```

Configuration is in `wrangler.json`. Ensure environment variables are set in Cloudflare dashboard.

## Development Tips

- **Hot Reload:** `bun dev` provides hot module replacement for Astro and Wrangler
- **Environment Variables:** Use `.env` file (copy from `.env.example` if available)
- **Type Generation:** Run `bun cf-typegen` after Wrangler config changes
- **Component Reuse:** Store reusable components in `client/src/components/`
- **Utility Sharing:** Export shared functions from `client/lib/` or `worker/`
