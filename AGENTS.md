# Sonic Thames – Development Guidelines

> **Note**: This file contains all development guidelines for Sonic Thames. Subdirectories may have their own AGENTS.md files that override or extend these rules.

## Project Context

Sonic Thames is an interactive audio-visual web experience mapping multimedia recordings along the River Thames. Users explore geolocated content through an immersive interface categorized as Listen, See, and Feel.

**Tech Stack**: React 17, TypeScript, Vite, Tailwind CSS, vanilla-extract, Radix UI, Mapbox GL, RxJS, fp-ts

## Architecture Principles

### Component Organization
- **Domain models** (`src/domain/`) - Core types and data structures
- **UI components** (`src/components/ui/`) - Reusable, composable primitives
- **Page components** (`src/pages/`) - Compose UI components into views
- **Utilities** (`src/lib/`) - Shared helpers, especially RxJS operators

### Data Flow
- Sound recordings in `src/data.json` with runtime validation via `src/data.io.ts`
- Use **io-ts** for runtime type checking of external data
- Use **RxJS** for reactive state and event streams (utilities in `src/lib/rxjs/`)
- Keep state management simple; avoid premature abstraction

### Key Directories
```
src/
├── components/ui/    # Reusable UI primitives
├── domain/           # Domain models and types
├── icon/generated/   # Auto-generated icons (pnpm build-icons)
├── lib/              # Utilities (RxJS, helpers)
├── pages/            # Page-level components
├── styles/           # Design tokens and themes
└── data.json         # Content data with validation
```

## Styling System

### Hybrid Approach
1. **Tailwind CSS v3** - Primary styling via utility classes
2. **vanilla-extract** - Design tokens and theme management (`src/styles/theme.css.ts`)
3. **Radix UI** - Accessible unstyled primitives
4. **shadcn/ui** - Composable components on Radix
5. **CVA** - Component variants when needed

### Guidelines
- **Prefer Tailwind utilities**: `className="flex gap-4 p-4 bg-bg text-fg"`
- **Use design tokens**: `bg-primary`, `text-accent`, `border-border` (from theme.css.ts)
- **Arbitrary values for one-offs**: `w-[500px]`, `bg-[#F3F4F4]`
- **Merge classes safely**: Use `cn()` from `@/lib/utils`
- **Avoid inline styles** except for truly dynamic runtime values

### Adding New Components
1. Create in `src/components/ui/ComponentName.tsx`
2. Style with Tailwind utilities + design tokens
3. Export from `src/components/ui/index.ts`
4. Import via alias: `import { ComponentName } from "@/components/ui"`

### Design Tokens
Defined in [src/styles/theme.css.ts](src/styles/theme.css.ts):
- Colors: bg, fg, accent, primary, action, destructive, border, etc.
- Radii: sm, md, lg, xl
- Shadows: card
- Spacing: page

Exposed as CSS custom properties for Tailwind integration.

## Code Quality Standards

### Definition of Done for Agents
- Pass the full quality suite locally:
  ```bash
  pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
  ```
  If formatting fails, run `pnpm format` before retrying.
- Update or create any documentation and comments affected by your change.
- Do **not** introduce new `TODO` comments; open a follow-up issue instead.
- When touching build configuration, deployment scripts, or critical runtime paths, ensure `pnpm build` succeeds.

### Agent Workflow Checklist
1. Create a focused feature branch (`git checkout -b feature/descriptive-name`).
2. Implement the change and self-review the diff.
3. Run the quality gates listed above and capture results for PR evidence.
4. Keep commits cohesive and reference related issues where applicable.
5. Provide clear PR context (screenshots, reproduction steps) so reviewers can verify quickly.
6. Preserve human-reviewable history: document branch intent, link test output, and keep PR descriptions concise.

### TypeScript
- Enable strict mode (already configured)
- Use **io-ts** for external data validation (runtime checks)
- Prefer type inference over explicit types when obvious
- Use **fp-ts** for functional patterns (Either, Option, pipe)
- Keep types close to usage; avoid massive type files

### Testing
- **Framework**: Vitest
- Test user-facing behavior, not implementation details
- Cover data validation logic (io-ts codecs)
- Test complex RxJS streams
- Mock external dependencies (Mapbox, fetch)

### Comments & Documentation
- Explain **why**, not **what** (the code shows what)
- Document complex algorithms, timing issues, or third-party API quirks
- Justify non-obvious decisions (map projections, performance trade-offs)
- Reference issues/docs for intentional deviations from conventions
- Avoid stale TODOs; file issues instead

### Logging Levels
- `console.debug` - Verbose dev-only details (stripped in production)
- `console.info` - Major lifecycle events (asset loading, navigation)
- `console.warn` - Recoverable anomalies
- `console.error` - Failures requiring investigation or bug reports

## Common Patterns

### Icon Management
- **Source SVGs**: `static/icons/`
- **Generate**: `pnpm build-icons` (SVGR with custom template)
- **Import**: `import { IconName } from "@/icon/generated/IconName"`
- Auto-includes accessibility: `aria-label`, `<title>`, `role="img"`

### Environment Variables
- Prefix with `VITE_` to expose to client code
- Store in `.env` (gitignored; see `.env.template`)
- **Required**: `VITE_MAPBOX_TOKEN` for map functionality

### Data Schema Updates
1. Edit `src/data.json` for content changes
2. Update `src/data.io.ts` if schema changes
3. Run `pnpm typecheck && pnpm test` to validate

### RxJS Patterns
- Custom operators in `src/lib/rxjs/`
- Use `pipe()` for operator composition
- Properly unsubscribe in React components (useEffect cleanup)
- Prefer declarative streams over imperative event handlers

## Accessibility Requirements

- All interactive elements need ARIA labels
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`)
- Support full keyboard navigation
- SVG icons must have `role="img"` and descriptive `aria-label`
- Test with screen readers when modifying navigation/interactions

## Deployment

```bash
export VITE_MAPBOX_TOKEN=your_token_here
pnpm deploy
```

Process:
1. Validates `VITE_MAPBOX_TOKEN` is set
2. Runs production build (`pnpm build`)
3. Deploys to `gh-pages` branch via `gh-pages` package

Accepts: `VITE_MAPBOX_TOKEN`, `MAPBOX_TOKEN`, or `MAPBOX_ACCESS_TOKEN`

## Anti-Patterns to Avoid

### Don't
- ❌ Add TODO comments (file issues instead)
- ❌ Mix styling approaches inconsistently
- ❌ Skip runtime validation for external data (always use io-ts)
- ❌ Create premature state management abstractions
- ❌ Use inline styles for static values
- ❌ Commit `.env` files or secrets
- ❌ Disable linters/formatters without documented reason

### Do
- ✅ Use functional patterns with fp-ts and pipe
- ✅ Compose small, focused components
- ✅ Leverage type inference where obvious
- ✅ Handle errors explicitly with Either/Option
- ✅ Keep components pure and testable
- ✅ Document complex business logic

## Commit Guidelines

### Title Format
- ≤50 characters
- Imperative mood ("add", "fix", "update")
- No trailing period
- Lowercase start

**Good**:
```
add marker clustering for dense map regions
fix audio playback state after route change
update design tokens for new color palette
```

**Bad**:
```
Added some animation stuff and fixed a few things.
Updates
WIP
```

### Body Format
Explain **why** the change matters (diff shows **what**):

**Good**:
```
gate map interaction during media playback

Prevents accidental navigation while users are engaged with audio/video
content. The interaction lock releases when media stops or user explicitly
closes the player.
```

**Bad**:
```
gate map interaction during media playback

Added boolean flag isMediaPlaying and conditional check in MapView component
handleClick method.
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (localhost:3001) |
| `pnpm build` | Production build |
| `pnpm test` | Run test suite |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Auto-fix formatting |
| `pnpm format:check` | Check formatting without changes |
| `pnpm build-icons` | Regenerate icon components from SVGs |
| `pnpm deploy` | Deploy to GitHub Pages |

## Key File Locations

| Purpose | Location |
|---------|----------|
| Sound recordings data | `src/data.json` |
| Data runtime validation | `src/data.io.ts` |
| Design tokens & theme | `src/styles/theme.css.ts` |
| UI component library | `src/components/ui/` |
| Page layouts | `src/pages/` |
| RxJS utilities | `src/lib/rxjs/` |
| Icon sources (SVG) | `static/icons/` |
| Generated icons | `src/icon/generated/` |
| Environment config | `.env` (local, gitignored) |

## Additional Resources

- [CONTRIBUTING.md](CONTRIBUTING.md) - Full contribution workflow and PR guidelines
- [README.md](README.md) - Project setup, architecture overview, and tech stack details
- [src/styles/theme.css.ts](src/styles/theme.css.ts) - Complete design token definitions
