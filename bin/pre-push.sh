#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

run_check() {
	echo "Running: $*"
	"$@"
}

run_check pnpm lint
run_check pnpm typecheck
run_check pnpm test -- --run
run_check pnpm build

echo "All pre-push checks passed."
