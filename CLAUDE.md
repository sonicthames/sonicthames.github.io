# Sonic Thames – Agent Documentation System

This repository uses a hierarchical documentation system for AI assistants and developers.

## Documentation Discovery

### Primary Guide: AGENTS.md
All development guidelines, patterns, conventions, and architectural decisions are documented in [AGENTS.md](AGENTS.md). **Start there.**

### Hierarchy
- **Root AGENTS.md** (this directory) contains repository-wide guidelines
- **Directory-specific AGENTS.md** files can override or extend the root guide
- Discovery order: current directory → parent → parent → root
- Local rules override parent rules

### When Working in a Subdirectory
1. Check for an `AGENTS.md` in the current directory
2. If found, apply those rules (they may reference or override the root AGENTS.md)
3. If not found, walk up the directory tree until you find one
4. Root AGENTS.md at the repository level is the fallback

## Project Quick Facts

**Sonic Thames** is an interactive audio-visual web experience exploring the River Thames.

- **Type**: React TypeScript SPA
- **Stack**: React 17, Vite, Tailwind CSS, vanilla-extract, Radix UI
- **Package Manager**: pnpm
- **Deployment**: GitHub Pages
- **Live Site**: https://sonicthames.github.io

**Quality Gate**: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test`

## For Claude Code Users

When starting a conversation:
1. Read [AGENTS.md](AGENTS.md) for all development guidance
2. Check [CONTRIBUTING.md](CONTRIBUTING.md) for workflow details
3. Reference [README.md](README.md) for setup and architecture overview

This file exists to explain the documentation system. The actual guidelines are in AGENTS.md.
