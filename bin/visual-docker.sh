#!/usr/bin/env bash
# Runs the visual suite on the host against Chromium in the Playwright Docker
# image, so every machine renders the baselines identically. Arguments go to
# `playwright test`, e.g. --update-snapshots.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for the visual suite" >&2
  exit 1
fi

version="$(sed -n 's/^  playwright: //p' pnpm-workspace.yaml)"
if [[ -z "$version" ]]; then
  echo "could not read the playwright catalog version from pnpm-workspace.yaml" >&2
  exit 1
fi

# Chromium can rasterise differently per CPU architecture, so baselines are
# arm64 everywhere; CI runs this job on an arm64 runner.
platform="linux/arm64"
port="${PLAYWRIGHT_DOCKER_PORT:-4749}"
container="sonicthames-visual-$$"

cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --detach --init --ipc=host \
  --platform "$platform" \
  --name "$container" \
  --publish "127.0.0.1:${port}:${port}" \
  --user pwuser \
  --workdir /home/pwuser \
  "mcr.microsoft.com/playwright:v${version}-noble" \
  npx -y "playwright@${version}" run-server --port "$port" --host 0.0.0.0 \
  >/dev/null

for _ in $(seq 1 120); do
  if docker logs "$container" 2>&1 | grep -q "Listening on"; then
    break
  fi
  sleep 1
done

if ! docker logs "$container" 2>&1 | grep -q "Listening on"; then
  docker logs "$container" >&2 || true
  echo "the Playwright server in Docker did not start" >&2
  exit 1
fi

PLAYWRIGHT_DOCKER_WS="ws://127.0.0.1:${port}/" \
  pnpm exec playwright test playwright/visual.spec.ts "$@"
