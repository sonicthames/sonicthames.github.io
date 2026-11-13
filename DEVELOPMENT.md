# Development

## Setup

[mise](https://mise.jdx.dev) pins Node.js, pnpm, Lefthook, actionlint and gitleaks in `mise.toml`. `mise.lock` holds their checksums, and CI installs from it with `--locked`.

```bash
mise install
pnpm install
lefthook install
cp .env.template .env  # add VITE_MAPBOX_TOKEN
pnpm dev               # http://localhost:4420
```

With direnv, `direnv allow` puts the tools on `PATH` and loads `.env`; otherwise run `mise activate`. After changing `mise.toml`, run `mise lock` and commit both files.

`.env` takes a public `VITE_MAPBOX_TOKEN` and, optionally, `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST`. Analytics stays off unless both PostHog values are set.

## Commands

| Command                                  | Purpose                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`, `pnpm dev:test`              | Dev server on port 4420, or 4747 for the Playwright MCP                |
| `pnpm build`, `pnpm serve`               | Production build, and its preview on port 4421                         |
| `pnpm check`                             | Every gate: peer check, lint, typecheck, spellcheck, unit tests, build |
| `pnpm lint:fix`, `pnpm format`           | Apply Biome's safe fixes; format                                       |
| `pnpm test`                              | Unit tests                                                             |
| `pnpm test:e2e`                          | Playwright specs except the visual suite                               |
| `pnpm test:visual`, `test:visual:update` | Visual suite in Docker; regenerate its baselines                       |
| `pnpm storybook`                         | Storybook on port 6006                                                 |
| `pnpm build-icons`                       | Regenerate `src/icon/generated/` from `static/icons/`                  |
| `pnpm mcp:discover`                      | List the MCP servers in `.mcp.json` and their tools                    |
| `pnpm run deploy`                        | Publish to GitHub Pages; see [Deployment](#deployment)                 |

Scripts in `scripts/` run on Node.js type stripping, so they use erasable syntax only and import `fp-ts` and `io-ts` through `lib/*.js`, which Biome enforces.

## Quality gates

- **Lint:** Biome (warnings fail), oxlint's React Compiler rules, type-aware oxlint and knip. `no-unsafe-type-assertion` is off because the routing and tuple helpers in `src/lib/` assert types the compiler cannot derive. Each knip waiver in `knip.jsonc` gives a reason.
- **TypeScript:** the strict flags beyond `strict`, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- **Build:** the React Compiler fails the build on a component it cannot compile (`panicThreshold` in `vite.config.ts`). The error names the rule, for example `Refs` for touching `ref.current` during render.
- **Hooks:** pre-commit runs actionlint, lint, typecheck, spellcheck and a gitleaks scan of staged changes, and fails when a tool is missing. Pre-push runs `pnpm check`.
- **CI:** `.github/workflows/ci.yml` runs the gates, the Storybook build, the Playwright specs and the visual suite on Blacksmith runners. They need the Blacksmith GitHub app on the organisation; without it, jobs queue and never start. Runner labels are declared in `.github/actionlint.yaml`.
- **Audit:** a separate job runs `pnpm audit --audit-level=moderate` weekly, on manual dispatch, and when `package.json`, `pnpm-lock.yaml` or `pnpm-workspace.yaml` change. Record an advisory with no fix under `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml`, with the reason.

## Tests

Vitest runs in happy-dom with `src/test/setup.ts`, which mocks Mapbox GL. On Node.js 26 the bare `localStorage` global is Node's own, so stub it with `vi.stubGlobal`.

Playwright specs in `playwright/` run against `pnpm build:e2e`, a production build with a placeholder Mapbox token and no PostHog key, served on port 4748. Map tiles never load, so screenshots are deterministic and test runs send no analytics. Specs import `test` from `playwright/fixtures.ts`, which fails on page errors and on any `console.error` except Mapbox's. Install Chromium once with `pnpm playwright:install`; the MCP servers use the installed Google Chrome instead.

The visual suite renders in the `mcr.microsoft.com/playwright` image matching the catalog version, pinned to `linux/arm64` locally and in CI, so baselines match everywhere; outside Docker it refuses to run. After an intended UI change, check the diffs in `test-results/`, run `pnpm test:visual:update` and commit the new PNGs.

## Dependencies

Direct dependencies are pinned exactly, and Playwright's version lives in the catalog in `pnpm-workspace.yaml`. React stays on a canary build for `ViewTransition`. Renovate waits three days after each release, groups updates and refreshes the lockfile weekly.

## Layout

```
src/
├── components/ui/    # Shared UI components and their stories
├── domain/           # Domain types and io-ts codecs
├── features/map/     # Map experience: overlays, playlist, video, persistence
├── hooks/            # Shared hooks
├── icon/             # SVGR template and generated icons
├── lib/              # Routing, analytics, geo and type helpers
├── pages/            # Route pages; route definitions in location.ts
├── styles/           # Global styles
├── theme/            # Tokens, light and dark themes, recipes
├── ui/components/    # Drawer and panel layout styles
├── data.json         # Sound recordings
└── index.tsx         # Entry point
```

## Data model

Recordings live in `src/data.json`. The codec in `src/domain/sound/codec.ts` validates them, and `src/domain/sound/types.ts` holds the types; change all three together, then run `pnpm typecheck && pnpm test`.

```typescript
{
  title: string
  description: string[]           // paragraphs
  marker: string                  // short map label
  category: "Listen" | "See" | "Feel"
  playOnProximity: boolean        // eligible for the proximity video preview
  duration: string                // ISO 8601 duration, e.g. "PT01M29S"
  location: string | null
  access: string | null           // access instructions
  coordinate: { lng: number; lat: number }
  videoSrc: string                // YouTube video ID
  thumbnailSrc: string | null
  dateTime: string | null         // ISO timestamp, or instead
  interval: string | null         // ISO interval
}
```

## Common tasks

- **UI component:** add it to `src/components/ui/` with any variants as a recipe in `src/theme/recipes/`, export it from `index.ts`, and add a story under `__stories__/`.
- **Icon:** add the SVG to `static/icons/`, run `pnpm build-icons` and expose it in `src/icon/index.tsx`. Never edit `src/icon/generated/` by hand.
- **Design tokens:** edit `src/theme/tokens.css.ts`, then `lightTheme.css.ts` and `darkTheme.css.ts`.
- **Tracked CTA:** wrap it in `TrackedCta`. `useHoverAnalytics` records `cta_hover` with dwell time, and `src/lib/analytics.ts` exposes `trackCtaClick` and `trackCtaHover`.

## Deployment

```bash
VITE_MAPBOX_TOKEN=... pnpm run deploy
```

`scripts/deploy.ts` builds and publishes `dist/` to the `gh-pages` branch. It reads the token from the environment or `.env`, and also accepts it as `MAPBOX_TOKEN` or `MAPBOX_ACCESS_TOKEN`. Plain `pnpm deploy` is a pnpm built-in and does not run the script.

## Signed commits

Commits are signed with SSH (`gpg.format=ssh`). If signing fails with `Couldn't find key in agent`, load the key that `user.signingkey` names, typically with `ssh-add ~/.ssh/id_ed25519_signing`.
