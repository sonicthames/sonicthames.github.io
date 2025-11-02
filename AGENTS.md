# AI Agent Handbook

Sonic Thames is an interactive audio‑visual React experience mapping recordings along the River Thames. Development blends fp-ts functional patterns, io-ts runtime validation, Tailwind + vanilla-extract styling, and Mapbox GL visualisation. This handbook aligns collaborating AI assistants so we deliver consistent, production-ready work.

---

## Purpose

- Define how Codex and Claude collaborate without stepping on each other’s toes.
- Keep architecture, styling, and data flow decisions coherent across contributions.
- Ensure every change is verified (`pnpm lint`, `pnpm typecheck`, `pnpm build`) before hand-off.
- Make it obvious where to find deeper project context (README, DEVELOPMENT, CONTRIBUTING).

---

## Primary Roles

Both agents can tackle any task; lean on the strengths below when choosing who drives:

- **Codex (GPT‑5)** — precision implementer. Shines at structured edits, strict formatting, refactors, and enforcing process._Strengths_: accuracy, code quality, deterministic reasoning, verification discipline._Watch-outs_: can be overly literal or verbose if guardrails are unclear.
- **Claude** — conceptual synthesiser. Excels at architecture framing, narrative flow, documentation, and higher-level reasoning.
  _Strengths_: communication clarity, synthesis, UX framing, strategic trade-offs.
  _Watch-outs_: less reliable at strict syntax or tooling quirks; may drift from hard rules if not reminded.

They may swap roles mid-task; whichever agent finishes must confirm quality gates and document any gaps.

---

## Collaboration Flow

1. **Confirm scope**

   - Read the user request carefully.
   - Check supporting docs: [README.md](README.md), [DEVELOPMENT.md](DEVELOPMENT.md), [CONTRIBUTING.md](CONTRIBUTING.md), and any local `AGENTS.md`.

2. **Choose the initial driver**

   - Code-heavy, rule-driven, or tooling tasks → Codex usually leads.
   - Narrative, UX, discovery, or synthesis tasks → Claude usually leads.
   - If unsure, pick the agent who can unblock the work fastest and plan for a review pass by the other.

3. **Share context on hand-off**Include:

   - Touched files and major edits.
   - Outstanding questions, blockers, or verification steps.
   - Key decisions (e.g., why a Tailwind utility set was chosen, why a codec changed).
     Use relative links: `src/pages/main/Map.tsx#L120`.

4. **Verify before signalling completion**Run or reason through:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

   - If a command cannot run, state why and what remains unverified.
   - Resolve lint/type issues immediately (`pnpm lint:fix` when helpful, otherwise manual fixes).
   - Never hand off failing checks.

5. **Escalate early when uncertain**
   If instructions conflict or the change risks regressions (Mapbox integration, data schema changes, deployment scripts), pause and seek maintainer guidance instead of guessing.

---

## Quality Checks (Definition of Done)

Before marking a task complete:

- ✅ `pnpm lint` passes with zero fixable issues.
- ✅ `pnpm typecheck` reports no errors or implicit `any`s.
- ✅ `pnpm build` succeeds when build or runtime paths changed.
- ✅ Behavioural expectations hold (map interactions, playback, accessibility affordances).
- ✅ Documentation, comments, and code stay in sync.
- ✅ Any skipped verification is clearly recorded for follow-up.
- ✅ When working on a web app and the work targets a specific use case, functional element, or visual change, exercise it via the Playwright MCP to confirm the behaviour in a real browser context.

---

## Document Map

- Project overview & setup — [README.md](README.md)
- Local tooling & scripts — [DEVELOPMENT.md](DEVELOPMENT.md)
- Workflow & PR expectations — [CONTRIBUTING.md](CONTRIBUTING.md)
- Agent discovery rules — [CLAUDE.md](CLAUDE.md)
- Directory-specific rules — nearest `AGENTS.md` (override this root)

---

## MCP Tool Discovery

To discover available MCP servers and their capabilities programmatically:

```bash
pnpm mcp:discover
```

This script reads `.mcp.json` and lists all configured MCP servers, their capabilities, and configuration details.

### Playwright MCP

Two Playwright MCP servers are configured:

- `playwright` (headless) – Default for automated testing, no visible browser
- `playwright-headed` (visible) – For debugging when you need to see browser interactions

**Test server**: Run `pnpm dev:test` to start the application on port 4747 for testing.

**Tool naming**: In Claude Code, tools are prefixed as `mcp__<server>__<capability>`. For example: `mcp__playwright__browser_navigate` or `mcp__playwright-headed__browser_snapshot`.

**Configuration**: Both servers use 1920×1080 viewport with 10s/30s action/navigation timeouts. Screenshots and traces save to `.playwright-mcp/` (gitignored).

For full server options, run `pnpm exec mcp-server-playwright --help`.

---

## Communication Norms

- State assumptions, uncertainties, and risks explicitly.
- Keep hand-offs concise but complete; highlight what was verified.
- Suggest concrete next steps, not vague “could look at…” statements.
- Preserve prior architectural decisions unless instructions override them.
- Reference files with relative Markdown links; no absolute paths or external URLs.

Tone: factual, direct, professional. No anthropomorphism, filler, or informal chatter.

---

## Repo-Specific Guardrails

- **Architecture**

  - Components live in `src/components/ui/`; pages compose them from `src/pages/`.
  - Domain models and codecs (`src/domain/`, `src/data.io.ts`) define data contracts; keep types and runtime validation aligned.
  - Use RxJS for shared reactive state; unsubscribe in `useEffect` cleanups (`lazyUnsubscribe` helper).
  - Path helpers come from `routePath`/`appRoute`; avoid hardcoded routes.

- **Styling**

  - Prefer Tailwind utilities; fall back to vanilla-extract recipes for complex variants.
  - Use design tokens from `src/styles/theme.css.ts` (`bg-bg`, `text-fg`, `border-border`).
  - Keep accessibility in mind: focus states, ARIA labels, semantic elements.
  - Avoid inline styles except for dynamic runtime values.

- **Icons**

  - SVGs under `static/icons/`; regenerate with `pnpm build-icons`.
  - Icons are imported via `@/icon/generated`; the map in `src/icon/index.tsx` controls tree-shakable access.

- **Data & Mapbox**

  - Update `src/data.json` and matching codecs together; run `pnpm typecheck && pnpm test`.
  - Mapbox access token must be set via `VITE_MAPBOX_TOKEN` (or compatible aliases) before running map features.
  - Keep map bounds, zoom levels, and accessibility overlays intact unless requirements change.

- **Testing & Observability**

  - Use Vitest for behaviour-driven tests; prefer verifying user-facing results.
  - Logging follows repo conventions: `console.debug` (dev only), `console.info`, `console.warn`, `console.error`.
  - When touching critical flows, consider adding or updating tests to cover regressions.

---

## Hand-off Checklist

- [ ] Scope understood; relevant docs reviewed.
- [ ] Driver & reviewer roles agreed (if collaborating).
- [ ] Code formatted and lint clean.
- [ ] TypeScript checks green; build run when applicable.
- [ ] Behavior verified or gaps documented.
- [ ] Summary + next steps communicated with file links.

When all boxes are ticked, you’re clear to hand over or declare completion.
