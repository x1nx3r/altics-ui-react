# AGENTS.md

Altics UI is an accessible React component library. Components are built from
the design sheets, verified by measurement, and documented in a separate
Storybook snapshot repository.

## Commands

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Playground | `npm run dev` |
| Build | `npm run build` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Test | `npm test` |
| Full gate | `npm run verify` |
| Probe, headless | `npm run probe [-- <page>]` |
| Probe, CDP | `npm run probe:cdp` |
| Reference submodules | `npm run refs:sync [-- <name>]` |
| Sheets check | `npm run sheets:check` |

`npm run verify` runs typecheck, lint, test, then build. Run it before every
commit. Probes are separate: they need Chromium and a dev server.

The end-to-end workflow for a module (sheet export, refs, plan, probe, PR) is
in `README.md` under "Working on a module".

## The measurement rule

A number in a plan, a commit message, or a Storybook title must come from a
probe, the sheet, or the library's scale. Never infer geometry from the source.

An LLM can read an image; it cannot measure one reliably. Do not accept a
visual estimate as a measurement. Run the probe.

- `probes/src/probe.tsx` measures the input family.
- `probes/src/select-probe.tsx` measures the select bases.
- `probes/src/pagination-probe.tsx` measures the load-more rows and panel.
- `probes/tool/svg-bbox.py` reads exact path geometry from a sheet cell.
- `probes/tool/sheet-cdp.mjs` drives the sheet canvas with real input events.

Render one of each shape. A probe that measures one shape hides defects in the
others. Import `@altics/ui/styles.css` in every probe page, or the numbers are
meaningless.

### Scale reconciliation

Figma frames are often scaled, and an SVG export can carry the transform. A 2x
export doubles every value. A 1.5x frame turns 8 into 12. Check the factor
against a known reference: a 16 icon, a spacing step, or a 1px border. If a
whole cell is off by a factor, correct the factor first; do not round each
value separately.

Then compare the cell with the library's scale: the spacing tokens in
`src/theme/tokens.css`, the width and radius ramps in
`src/theme/theme-extend.ts`, and the type ramp in
`src/components/typography/Text.tsx`. If the value falls between steps, round
to the nearest step and record:

1. the raw sheet value;
2. the scale step we use;
3. why (frame scale, pixel scan, export transform, or a one-off quirk);
4. the probe value after implementation.

Record the token name beside the value when one exists. The target is an exact
match to the chosen step, not to the raw decimal. The probe proves the component
hits it. A one-off cell can stay a quirk, but it does not become a new rule. The
sheet is evidence, the scale is the baseline, the probe is the check.

## Probes

### How it runs

`npm run probe` builds the library, starts Vite on 5173, loads the page in
headless Chromium, and prints the page DOM, including the JSON from
`<pre id="out">`. The page imports `@altics/ui/styles.css` and renders one of
each shape. `npm run probe -- <page>` selects another page.
`PROBE_SKIP_BUILD=1` reuses `dist`; `PROBE_PORT` changes the port.

A probe reads the live DOM, not the source. The sheet cell under `sheets/` is
the other side of the comparison.

The probe pages are a workbench, not a showcase. Keep every shape and the raw
JSON in view; do not tidy them into a gallery.

### Why this is easier and auditable

An LLM can read a screenshot and describe it; it cannot measure it. The probe
gives a number that a reviewer can reproduce.

The agent reports a command, a JSON value, and the sheet value beside it. The
plan records the sheet value, the scale step, and the probe value. A reviewer
reruns the command and gets the same numbers. A commit or PR can quote the same
output, so a geometry change has a before and after.

Before you claim a geometry fix:

1. Run the page that renders the shape.
2. Compare each number with the sheet cell.
3. If the sheet is off-scale, round to the scale step and record the raw value.
4. Record the sheet value, the scale step, and the probe value in the plan.
5. Quote the output in the commit or PR.

The page list, traps, and CDP driver are in `probes/README.md`.

## Sheets

The SVG cells under `sheets/` are the tracked source for geometry. The sheet is
the source; do not infer a value from the code.

To add cells, select all variants on the Figma sheet page and export them as SVG
at 1x with Outline text on; `svg-bbox.py` reads paths, not live text. Keep the
variant names, put the files in the family folder, and run
`npm run sheets:check`.

If Figma MCP is available, export the selected variants into `sheets/<family>/`
yourself, keep the names, run the check, and report the count and paths. Do not
rename a value to match the code.

The naming rules and the folder map are in `sheets/README.md`.

## Layout

| Path | What |
| --- | --- |
| `src/` | The library. The only code that ships. |
| `docs/` | Plans and repository documents. |
| `docs/plans/` | Plans, measurements, and decisions. Start here before a component. |
| `probes/` | The measurement rig. |
| `sheets/` | Exported SVG cells from the design sheets. |
| `refs/` | Pinned design-system submodules, full history, sparse worktree. Read only. |
| `tool/` | Build, icon, ref, and verify scripts. |
| `playground/` | The quick dev app. |

The Storybook app and stories are maintained in
`x1nx3r/altics-ui-react-storybook`; this repository keeps only the plans and
references.

`refs/` is reference material. Nothing under `src/` may import from it, and
nothing under `refs/` ships in the package. The submodules keep full history;
the worktree is sparse. Run `npm run refs:sync` when a task needs upstream API
shapes. Do not bump a pin without a reason: the pins are the commits the plans
audited (see `docs/references.md`).

## Plans

A component or a cross-cutting change starts as a plan in `docs/plans/`.

1. Copy the template from `docs/plans/README.md`.
2. Record findings as measured values, with the sheet's value beside ours.
   Record what we take, reject, and rectify from each reference, and why a
   package earns its place.
3. Mark items `DONE` as they land; record what was deferred and why.
4. Set `Status: done` when the work closes. Frozen plans are history; put
   corrections in a new plan or an addendum.

During exploration, read the refs and return the behavior with file, commit, and
test citations. Give the human the tradeoffs and the open questions. Do not
decide the house style or start the component before the plan records the
decision.

## Commits

Conventional Commits, imperative mood, one logical change per commit. Scope by
area (`select`, `input`, `typography`, `docs`, `probes`, `refs`, `sheets`). Example:

```
fix(select): keep the panel on the trigger width
```

Do not commit `dist/`, `node_modules/`, or the local PDF boards under
`sheets/reference/`.

## Generated files

Icons in `src/components/icon/icons/` come from `npm run generate:icons`. Do not
hand-edit them. The same applies to `dist/` and the Tailwind preset.
