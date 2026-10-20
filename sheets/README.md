# Sheet cells

Exported SVG cells from the design sheets. The plans and the probes cite these
files, so every quoted measurement can be checked.

The PDF boards under `reference/` are local-only and ignored. The SVG cells are
tracked.

## Layout

| Path | Keys |
| --- | --- |
| `button/buttons/` | `Size`, `Hierarchy`, `State`, `Icon only` |
| `button/buttons-dark/` | `Size`, `Dark background`, `State` |
| `button/buttons-small/` | `Size`, `Hierarchy`, `State` |
| `button/loading-spinner/` | `Size` |
| `button/buttons-social/` | `Size`, `Social`, `Supporting text`, `Theme`, `State` |
| `button/buttons-theme/` | `Size`, `Style`, `Theme` |
| `button/app-store/` | `Size`, `Store`, `Style` |
| `input/input/` | `Size`, `Type`, `Destructive`, `State` |
| `input/textarea/` | `Size`, `Type`, `Destructive`, `State` |
| `input/verification/` | `Size`, `Digits` |
| `select/select/` | `Size`, `Type`, `State` |
| `select/select-menu-items/` | `Size`, `Selected`, `Type`, `State` |
| `select/multi-select/` | `Size`, `State` |
| `select/multi-select-menu-item/` | `Size`, `State` |

Run `npm run sheets:check` for the current counts.

## Naming

One file per cell:

```
Size=<size>, <Key>=<Value>, <Key>=<Value>.svg
```

- Start with `Size=`.
- Separate pairs with a comma and one space.
- Use no space around `=`.
- Keep the Figma layer name. Use the same key and value spelling across the
  family.
- Do not rename a value to match the code. The sheet is the source.
- Do not use `(1)`, `copy`, or a similar suffix.

`State=Focused` and `State=Hover` are separate cells even when the files are
identical. The state is part of the matrix.

## Add a cell

1. Export the frame from Figma as SVG.
2. Put it in the family folder under `sheets/`.
3. Run `npm run sheets:check`.
4. Measure it:

   ```bash
   python3 probes/tool/svg-bbox.py "sheets/<family>/Size=..., Key=Value.svg"
   ```

5. Cite the path and the measured value in the plan.

Do not edit an SVG by hand. Re-export the frame. `probes/tool/svg-bbox.py` reads
the paths directly, so keep the export flat.

## Why the cells are tracked

`probes/tool/svg-bbox.py` renders a cell and reads every path's `getBBox`. The
plans quote those values beside ours. A cell that lives only on one machine
makes the quote impossible to check.

The color and gradient PDF boards are visual references. The plans do not cite
them, so `sheets/reference/` stays local.
