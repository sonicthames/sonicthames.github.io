# Development Reference

Quick reference for working on Sonic Thames. For architecture and patterns, see [AGENTS.md](AGENTS.md).

## Setup

```bash
# Install dependencies
pnpm install

# Set up environment (required for Mapbox)
cp .env.template .env
# Edit .env and add your VITE_MAPBOX_TOKEN from https://mapbox.com

# Start dev server
pnpm dev  # http://localhost:3001
```

## Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm clean            # Remove build artifacts

# Quality (run before committing)
pnpm typecheck        # TypeScript type checking
pnpm lint             # Lint with Biome
pnpm test             # Run tests
pnpm format           # Auto-fix formatting
pnpm format:check     # Check formatting

# Full quality suite
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test

# Icons
pnpm build-icons      # Regenerate icons from static/icons/*.svg

# Deploy
pnpm deploy           # Build and deploy to GitHub Pages (requires VITE_MAPBOX_TOKEN)
```

## Repository Structure

```
src/
├── components/ui/    # Reusable UI components (Button, Dialog, Link, etc.)
├── domain/           # Domain types (Sound, Category, Location)
├── icon/generated/   # Auto-generated icons (from static/icons/)
├── lib/              # Utilities (RxJS operators, routing, helpers)
├── pages/            # Page components (main, sound, sounds, about, etc.)
├── styles/           # Design tokens (theme.css.ts) and global styles
├── data.json         # Sound recordings content
├── data.io.ts        # Runtime validation with io-ts
└── index.tsx         # App entry point

Key files:
├── .env              # Local environment variables (gitignored)
├── .env.template     # Environment template
├── tailwind.config.ts    # Tailwind configuration
├── vite.config.ts        # Vite build config
└── biome.json        # Linting and formatting config
```

## Common Tasks

### Add Sound Recording
1. Edit `src/data.json` and add entry
2. Run `pnpm typecheck && pnpm test` to validate

### Add UI Component
1. Create `src/components/ui/ComponentName.tsx`
2. Export from `src/components/ui/index.ts`
3. Import via `@/components/ui`

### Add Icon
1. Add SVG to `static/icons/`
2. Run `pnpm build-icons`
3. Import from `@/icon/generated/IconName`

### Update Design Tokens
Edit `src/styles/theme.css.ts` and update Tailwind config if needed

### Update Data Schema
1. Edit `src/data.json`
2. Update codecs in `src/data.io.ts`
3. Run `pnpm typecheck && pnpm test`

## Environment Variables

```bash
# .env
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ciIsImEiOiJjbHh4eHh4In0.xxxxx

# Get token from https://mapbox.com → Account → Tokens
```

## Debugging

### Map not loading
Check `.env` has `VITE_MAPBOX_TOKEN` and restart dev server

### Type errors after data.json changes
Update codecs in `src/data.io.ts` to match new schema

### Build fails but dev works
```bash
pnpm clean && pnpm build
```

### Tests failing after dependency update
```bash
rm -rf node_modules && pnpm install
```

## Tech Stack Reference

- **React 17** - UI framework
- **TypeScript** - Type safety (strict mode)
- **Vite** - Build tool and dev server
- **Tailwind CSS v3** - Utility-first CSS
- **vanilla-extract** - Design tokens and theme
- **Radix UI** - Accessible primitives
- **Mapbox GL** - Interactive mapping
- **RxJS** - Reactive programming
- **fp-ts** - Functional programming utilities
- **io-ts** - Runtime type validation
- **Vitest** - Testing framework
- **Biome** - Linting and formatting

## IDE Setup (VS Code)

Recommended extensions:
- Biome (`biomejs.biome`)
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features (built-in)

`.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

## Related Documentation

- [AGENTS.md](AGENTS.md) - Architecture, patterns, and conventions
- [CONTRIBUTING.md](CONTRIBUTING.md) - Git workflow and PR guidelines (if present)
- [README.md](README.md) - Project overview and getting started
- [CLAUDE.md](CLAUDE.md) - Agent documentation system

---

**Quick links**: [Vite](https://vitejs.dev/) | [Tailwind](https://tailwindcss.com/) | [Radix UI](https://www.radix-ui.com/) | [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/) | [fp-ts](https://gcanti.github.io/fp-ts/) | [io-ts](https://gcanti.github.io/io-ts/)
