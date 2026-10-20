# Probes

The measurement rig. Unit tests assert classes; these pages assert geometry,
focus, and interaction. Every number quoted in `docs/plans/` came from here or
from the sheet.

This is not a demo. The showcase pages exist so the probes can render one of
each shape. A probe that measures a single shape hides defects in the others —
an early run measured only the tags card and missed the doubled slot margins on
the plain field.

## Run

Build the library first: the probe imports `@altics/ui/styles.css` from `dist`.

```bash
npm run build            # from the repo root
npm run probe            # probe.html
npm run probe -- select-probe
```

`npm run probe` starts Vite on 5173, runs `chromium --headless --dump-dom`, and
prints the JSON the page wrote into `<pre id="out">`. Set `PROBE_SKIP_BUILD=1`
to skip the rebuild, or `PROBE_PORT` to change the port.

Two traps the pages must respect:

- Import `@altics/ui/styles.css`, or every number is meaningless. The Tailwind
  preset ships no `content` key, so it cannot generate the library's utilities
  on its own.
- Render one of each shape, as above.

## Pages

| Page | Measures |
| --- | --- |
| `probe.html` | Input family: chips, slot markers, focus, error colours, dividers, textareas, pin/OTP cells, `cn` merges |
| `select-probe.html` | Select bases: panel width and gap, stepping, flip, scroll containment, focus policy, disabled rows |
| `pagination-probe.html` | Load-more: rows, chips, panel, search |
| `index.html?page=sheet` | Sheet-parity grid, drawn with the real components |

## Tools

```bash
python3 probes/tool/svg-bbox.py <file.svg>   # exact path geometry via Chromium getBBox
node probes/tool/sheet-cdp.mjs               # drive the sheet canvas over CDP
```

`svg-bbox.py` renders an SVG in headless Chromium and reads `getBBox` per path.
Prefer it to pixel scans: anti-aliasing confounds small text, and curve control
points overstate a path's extent.

`sheet-cdp.mjs` needs a dev server and a Chromium with a remote debugging port.

```bash
npm run dev -- --port 5173 --strictPort
chromium --remote-debugging-port=9223 "http://localhost:5173/?page=sheet"
node tool/sheet-cdp.mjs
```

`CDP_PORT` and `PAGE_URL` override the defaults (9223 and
`http://localhost:5173/?page=sheet`).
