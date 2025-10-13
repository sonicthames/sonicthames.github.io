# Contributing to SonicThames

Thanks for helping improve SonicThames. This document focuses on how we collaborate and keep the project healthy. The same expectations apply whether you are contributing manually or through an automation/agent workflow.

## Definition of Done

Before opening a pull request:

1. `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test` pass locally. Run `pnpm format` if the formatter reports changes.
2. Update or add documentation and comments affected by your change (component docs, contributor guidance, etc.).
3. Avoid introducing new `TODO` comments—file an issue instead if follow-up work is needed.
4. Confirm production builds succeed with `pnpm build` when you touch build configuration, deployment scripts, or core runtime paths.

## Local Quality Checks

### Format

```bash
pnpm format
```

### Lint

```bash
pnpm lint
```

### Typecheck

```bash
pnpm typecheck
```

### Tests

```bash
pnpm test
```

### Full Suite

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
```

## Workflow

1. Fork the repository and clone your fork.
2. Create a focused feature branch (`git checkout -b feature/descriptive-name`).
3. Implement and self-review the change, running the quality checks above.
4. Keep commits cohesive and reference related issues when possible.
5. Open a pull request and include context, screenshots, or repro steps that help reviewers verify the change quickly.

Automation and AI agents should follow the same workflow—ensure the branch history, PR description, and test evidence remain human-reviewable.

### Commit Guidelines

**Titles**: ≤50 chars, imperative mood, no trailing period.

```
✅ add hud animation for health pickup
✅ fix stage transition timing jitter
❌ Added some animation stuff and fixed a few things.
```

**Messages**: Explain _why_ the change matters—the diff already shows _what_ changed.

```
✅ gate cutscene input behind active state

Prevents menus from consuming input once gameplay resumes.

❌ gate cutscene input behind active state

Added run_if to cutscene update and modified GamePlugin schedule...
```

### Inline Comments

- Clarify complex data flow, styling trade-offs, or interactions with third-party APIs.
- Justify non-obvious math, map projections, or timing tweaks.
- Reference issues or documentation for intentional deviations from conventions.

### Logging

- `console.debug` for verbose development-only details (disabled in production builds).
- `console.info` for major lifecycle events (loading assets, navigation transitions).
- `console.warn` for recoverable anomalies.
- `console.error` for failures that need follow-up or bug reports.

### Data & Assets

- Update `src/data.json` and associated typings (`src/data.io.ts`) together to keep type safety intact.
- Regenerate icon components with `pnpm build-icons` after adding SVGs under `static/icons/`.
- Store secrets outside the repo—use `.env` based on `.env.template` for local development.

## Questions?

Open an issue or start a discussion before large refactors or architectural changes. We are happy to help scope the work and share context.
