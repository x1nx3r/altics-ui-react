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

`npm run verify` runs typecheck, lint, test, then build. Run it before every
commit. Probes are separate: they need Chromium and a dev server.

The end-to-end workflow for a module (sheet export, refs, plan, probe, PR) is
in `README.md` under "Working on a module".

## The measurement rule

A number in a plan, a commit message, or a Storybook title must come from a
probe or from the sheet. Never infer geometry from the source.

- `probes/src/probe.tsx` measures the input family.
- `probes/src/select-probe.tsx` measures the select bases.
- `probes/tool/svg-bbox.py` reads exact path geometry from the sheet export.
- `probes/tool/sheet-cdp.mjs` drives the sheet canvas with real input events.

Render one of each shape. A probe that measures one shape hides defects in the
others. Import `@altics/ui/styles.css` in every probe page, or the numbers are
meaningless.

## Layout

| Path | What |
| --- | --- |
| `src/` | The library. The only code that ships. |
| `docs/` | Plans and repository documents. |
| `docs/plans/` | Plans, measurements, and decisions. Start here before a component. |
| `probes/` | The measurement rig. |
| `refs/` | Pinned design-system submodules. Read only. |
| `tool/` | Build, icon, ref, and verify scripts. |
| `playground/` | The quick dev app. |

The Storybook app and stories are maintained in
`x1nx3r/altics-ui-react-storybook`; this repository keeps only the plans and
references.

`refs/` is reference material. Nothing under `src/` may import from it, and
nothing under `refs/` ships in the package. Run `npm run refs:sync` when a task
needs upstream API shapes. Do not bump a pin without a reason: the pins are the
commits the plans audited (see `docs/references.md`).

## Plans

A component or a cross-cutting change starts as a plan in `docs/plans/`.

1. Copy the header from `docs/plans/README.md`.
2. Record findings as measured values, with the sheet's value beside ours.
3. Mark items `DONE` as they land; record what was deferred and why.
4. Set `Status: done` when the work closes. Frozen plans are history; put
   corrections in a new plan or an addendum.

## Commits

Conventional Commits, imperative mood, one logical change per commit. Scope by
area (`select`, `input`, `typography`, `docs`, `probes`, `refs`). Example:

```
fix(select): keep the panel on the trigger width
```

Do not commit `dist/`, `node_modules/`, or sheet exports.

## Generated files

Icons in `src/components/icon/icons/` come from `npm run generate:icons`. Do not
hand-edit them. The same applies to `dist/` and the Tailwind preset.
