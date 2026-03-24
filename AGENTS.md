# Agent Guidelines for omu-aikido-page

Guidelines for agents working on this codebase.

## Project Overview

- **Type**: Static Site (SSG) with Cloudflare Workers API
- **Framework**: Astro + Vue.js 3
- **UI**: UnoCSS (Wind4 preset + Icons preset)
- **Backend**: Hono on Cloudflare Workers
- **Package Manager**: Bun

## Build Commands

```bash
# Install dependencies
bun install

# Development server (Astro on :4321 + Wrangler on :8788)
bun dev

# Build for production
bun build

# Local preview with Cloudflare Pages emulation
bun preview

# Deploy to Cloudflare Workers
bun deploy

# Generate Wrangler types (run automatically before build)
bun cf-typegen
bun prebuild   # alias: bun run cf-typegen

# Format code
bun format     # uses oxfmt
```

## Code Formatting

- **Formatter**: oxfmt (configured in `.oxfmtrc.json`)
- Run `bun format` before committing

## TypeScript Guidelines

- Extends Astro's strict TypeScript config
- Path alias: `@/*` maps to `./src/*`
- Import using: `import { something } from "lib/client"` (no `@` prefix for `lib/`)
- Use explicit type annotations for function parameters and return types
- Use `unknown` for caught errors, then narrow with type checks

```typescript
// Good
async function fetchData(): Promise<Data | null> {
  try {
    const res = await fetch(url);
    return await res.json() as Data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return null;
  }
}
```

## Vue.js Conventions

- Use Composition API with `<script setup lang="ts">`
- Use `ref`, `computed`, `watch`, `onMounted`, `onUnmounted` from Vue
- Always clean up resources in `onUnmounted` (timers, subscriptions, abort controllers)
- Use TypeScript types for props and emits

```typescript
// Props type example
import type { Event } from "./types";

interface Props {
  events: Event[];
  loading?: boolean;
}
```

## File Organization

```
src/
  pages/          # Astro pages (.astro, .mdx, .md)
  components/     # UI components
    root/         # Root layout components (header, footer, head)
    ui/           # Reusable UI components
    component/    # Feature components (Vue, calendar, forms)
  layouts/        # Astro layouts
  composables/    # Vue composables
  styles/         # Global CSS
  assets/         # Images, fonts

lib/              # Client libraries (Hono client, utilities)
worker/           # Cloudflare Workers (Hono)
public/           # Static assets
```

## Error Handling

- Use try/catch with proper error typing
- Provide user-friendly error messages in Japanese
- Log errors to console with context
- Handle async operations with proper loading/error states

## API/Worker Conventions

- Use Zod for request validation with `@hono/zod-validator`
- Always validate and sanitize input
- Use environment variables via `c.env` in Hono handlers
- Return appropriate HTTP status codes (200, 201, 400, 403, 502)

## CSS/Styling

- Use Semantic Tags for DX
- Use UnoCSS utility classes (Tailwind-compatible)
- Prefer semantic class names for accessibility
- Use UnoCSS icons: `<div class="i-heroicons:calendar-days-16-solid" />`

## Import Order

1. Vue/React imports
2. External library imports
3. Internal imports (lib/, @/*)
4. Type imports
5. Relative imports

```typescript
import { ref, computed } from "vue";
import { client } from "lib/client";
import type { Event } from "./types";
import CalendarList from "./calendarList.vue";
```

## Naming Conventions

- **Files**: kebab-case (calendar-view.vue, contact-form.vue)
- **Components**: PascalCase (CalendarView, ContactForm)
- **Composables**: camelCase, prefix with `use` (useTurnstile)
- **Types/Interfaces**: PascalCase (Event, CalendarProps)
- **Constants**: UPPER_SNAKE_CASE for configuration

## Testing

- No test framework currently configured
- If adding tests, use Vitest with Vue Test Utils

## Environment Variables

- Copy `.dev.vars` for local development (already in .gitignore)
- Never commit `.env` or `.dev.vars`

## Git Workflow

- Create feature branches for new features
- Run `bun format` before committing
- Push to main triggers automatic deploy to Cloudflare Workers

## Additional Notes

- Site: https://omu-aikido.com
- Language: Japanese (primary), English (code)
- Content managed via MDX in `src/pages/`
