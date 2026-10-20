#!/usr/bin/env bash
# Dump a probe page as headless DOM. The page writes its measurements as JSON
# into <pre id="out">.
#
#   npm run probe                  probe.html
#   npm run probe -- select-probe  select-probe.html
#
# PROBE_PORT changes the port (5173). PROBE_SKIP_BUILD=1 skips the library
# rebuild when dist/ is already current.
set -euo pipefail
cd "$(dirname "$0")/.." # probes/
page="${1:-probe}"
port="${PROBE_PORT:-5173}"
log="${TMPDIR:-/tmp}/probe-vite.log"

if [ "${PROBE_SKIP_BUILD:-}" != "1" ]; then
  (cd .. && npm run build >/dev/null)
fi

npm run dev -- --port "$port" --strictPort >"$log" 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null || true' EXIT

for _ in $(seq 1 80); do
  if curl -sf "http://localhost:$port/$page.html" >/dev/null; then break; fi
  sleep 0.25
done

chromium --headless --disable-gpu --no-sandbox \
  --virtual-time-budget=9000 --dump-dom "http://localhost:$port/$page.html"
