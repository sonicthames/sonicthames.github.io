# Contributing

Thanks for your interest in improving Sonic Thames.

## Before You Start

- [DEVELOPMENT.md](DEVELOPMENT.md) - Setup, commands, and common tasks
- [AGENTS.md](AGENTS.md) - Architecture and code patterns
- [README.md](README.md) - Project overview

## Workflow

```bash
# 1. Create a branch
git checkout -b feature/descriptive-name

# 2. Make changes and run quality checks
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test

# 3. Commit with a clear message
git commit -m "add marker clustering for dense regions"

# 4. Push and open a PR
git push -u origin feature/descriptive-name
```

### Branch Naming
- `feature/name` - New functionality
- `fix/name` - Bug fixes
- `refactor/name` - Code improvements
- `docs/name` - Documentation

## Commit Messages

**Format**: Imperative mood, ≤50 chars, no period

```
✅ add marker clustering for dense map regions
✅ fix audio playback state after route change
✅ update design tokens for new color palette

❌ Added some stuff
❌ WIP
❌ Fixed bugs.
```

**Body** (optional): Explain why, not what

```
gate map interaction during media playback

Prevents accidental navigation while users are engaged with audio/video
content. Releases when media stops or user closes the player.

Fixes #42
```

## Pull Requests

**Title**: Same format as commit messages

**Include**:
- What changed and why
- How you tested it
- Screenshots (for UI changes)
- Related issue numbers

## Code Review

**Reviewers**: Be kind, explain suggestions, distinguish blockers from nits

**Contributors**: Don't take feedback personally, ask questions, address concerns

## Definition of Done

Before opening a PR:
- ✅ Quality suite passes: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test`
- ✅ No new `TODO` comments (file issues instead)
- ✅ Documentation updated if needed
- ✅ `pnpm build` succeeds (if touching build config or deployment)

## Getting Help

- **Setup issues**: Check [DEVELOPMENT.md](DEVELOPMENT.md)
- **Code patterns**: Check [AGENTS.md](AGENTS.md)
- **Questions**: Open a discussion or issue
- **Large changes**: Discuss with maintainers first

## Recognition

Contributors are recognized through Git history, GitHub stats, and mentions in release notes.

---

Thank you for contributing!
