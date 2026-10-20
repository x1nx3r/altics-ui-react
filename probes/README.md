# Probes

The measurement rig. Unit tests assert classes; these pages assert geometry,
focus, and interaction. Every number quoted in `docs/plans/` came from here,
from the sheet, or from the library's scale.

An LLM can read a screenshot and describe it. It cannot measure it. The probe
returns the box, the gap, and the computed style; the image returns an
impression. The sheet is evidence too, but Figma frames are often scaled, so a
raw decimal is not automatically a target. Compare with the library's scale,
round to the nearest step, and record the reconciliation in the plan.

This is not a demo. The pages are a workbench: deliberately rough, dense, and
repetitive, with every shape and the raw JSON in view. Do not tidy them into a
gallery. A tidy page that hides a case is worse than a rough page that shows it.
Each page renders every shape in its family. A probe that measures a single
shape hides defects in the others — an early run measured only the tags card
and missed the doubled slot margins on the plain field.

## Run

The probe imports `@altics/ui/styles.css` from `dist`. `npm run probe` builds
the library first, then runs the page.

```bash
npm run probe            # probe.html
npm run probe -- select-probe
PROBE_SKIP_BUILD=1 npm run probe   # reuse the current dist
```

`npm run probe` starts Vite on 5173, runs `chromium --headless --dump-dom`, and
prints the page DOM, including the JSON the page wrote into `<pre id="out">`.
Set `PROBE_PORT` to change the port.

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
