# Agent Guidelines

Code defines reality; this document sets policy. [DEVELOPMENT.md](DEVELOPMENT.md) covers setup, commands, gates and common tasks; skip it for simple Q&A.

## Communication

- Default to terse: no preamble or hedging, full sentences, code and error strings verbatim. Expand where brevity risks misunderstanding.
- Progress updates: 1-2 sentences. Final summary: files changed, checks run with status, residual risks.

## Validation

- Run `pnpm check` before completion. On failure, fix only the reported failures and rerun until green.
- For browser-facing changes, run `pnpm test:e2e`; for visual changes, `pnpm test:visual`. Run suites headless; use the `playwright-headed` MCP server only when asked to watch the browser.
- To try a change interactively, use the Playwright MCP against `pnpm dev:test` (port 4747).
- If you skip a required check, say why and what remains.

## Constraints

- Single driver: one agent edits at a time. Maintainers make final calls; flag uncertainty early.
- Prefer explicit failure over silent fallback.
- Ask questions only when ambiguity changes behaviour, architecture or scope.
- Pause for maintainer guidance before changing the Mapbox integration, the data schema or deployment.
- Use `git mv` for tracked renames. Commit messages follow `CONTRIBUTING.md`. No `Co-Authored-By` lines.
- Do not rename, add or delete `.env` or config variables without explicit approval.
- Stop dev servers and watchers before handoff unless asked otherwise.

## Conventions

- Shared state lives in zustand stores, such as `src/features/map/persistence.ts`.
- Build paths with `appRoute` from `src/pages/location.ts`, not string literals.
- Style with vanilla-extract tokens and recipes; inline styles only for runtime values.
- When the React Compiler rejects a component, fix the component; do not lower `panicThreshold`.
- Logging: `console.debug` (dev only), `console.info`, `console.warn`, `console.error`.
