#!/usr/bin/env bash
# The gate before every commit. Probes are separate: they need a browser and a
# running dev server, so they are not part of this script.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run typecheck
npm run lint
npm test
npm run build
