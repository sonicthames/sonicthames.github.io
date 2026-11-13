# Sonic Thames

An interactive audio-visual map of recordings along the River Thames, in three categories: **Listen**, **See** and **Feel**. Live at [sonicthames.github.io](https://sonicthames.github.io).

Built with React 19 and the React Compiler, TypeScript, Vite, vanilla-extract, Mapbox GL with PixiJS overlays, React Router, zustand, fp-ts and io-ts.

## Quick start

You need [mise](https://mise.jdx.dev), a [Mapbox access token](https://account.mapbox.com/access-tokens/), and Docker for the visual tests.

```bash
mise install
pnpm install
cp .env.template .env  # add VITE_MAPBOX_TOKEN
pnpm dev               # http://localhost:4420
```

- [DEVELOPMENT.md](DEVELOPMENT.md): commands, quality gates, data model, deployment
- [CONTRIBUTING.md](CONTRIBUTING.md): branches, commits, pull requests
- [AGENTS.md](AGENTS.md): policy for AI agents

Supported browsers follow Vite's default target: Chrome and Edge 111+, Firefox 114+, Safari 16.4+.

## Licence

Private and not licensed for public use. Contact the repository owner for permissions.
