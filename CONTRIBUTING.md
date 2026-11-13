# Contributing

Setup and commands are in [DEVELOPMENT.md](DEVELOPMENT.md).

## Workflow

1. Branch from `main` as `feature/name`, `fix/name`, `refactor/name` or `docs/name`.
2. Run `pnpm check`. For UI changes, also run `pnpm test:e2e` and `pnpm test:visual`.
3. Open a pull request against `main`. Discuss large changes with the maintainers first.

## Commits

Write the subject in the imperative, in at most 50 characters, with no full stop, for example `fix audio playback state after route change`. The optional body explains why, not what.

## Pull requests

The title follows the commit format. Describe what changed and why and how you tested it, link related issues, and add screenshots for UI changes. Update the docs when behaviour changes, and file an issue instead of adding a `TODO` comment.
