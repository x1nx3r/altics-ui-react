# Plan: hardening the base `Input`

Status: done (item 6 deferred by design)
Opened: 2026-09-15
Last updated: 2026-09-17
Owner: x1nx3r
Related: `docs/plans/input-family.md`, `docs/references.md`, sheets at `❖ Design System Altics 2.0(3)/button/input/{input,textarea}/` (local only)

## Goal

Fix the two measured defects in `Input` and take the cheap wins the reference libraries show,
before any more components are built on top of it.

Everything in the family — `PasswordInput`, `NumberInput`, `FileInput`, `OtpInput`, `TagsInput` —
inherits the base, so each fix lands once.

## Where we stand

| | |
| --- | --- |
| Tests | 127 across 10 files (`input` 27, `tags-input` 24, `button` 1) |
| Gate | typecheck clean, lint 1 (upstream `Text.tsx`), lib + probes builds green |
| Branch | `feat/input-blocks`, last commit `f575a22` |
| Reference clones | `refs/{mui,mantine,ark,react-spectrum,react-select,rc-overflow,ant-design,primer}` |

## How to verify

Two layers. The unit tests assert classes; the browser probe asserts geometry, and geometry is
what found every real defect so far.

```
npm test && npm run lint && npm run typecheck && npm run build
cd probes && npm run dev -- --port 5173 --strictPort
chromium --headless --disable-gpu --no-sandbox --virtual-time-budget=9000 \
  --dump-dom "http://localhost:5173/probe.html"
```

`probes/probe.html` + `probes/src/probe.tsx` are the durable probe. They
replace the `/tmp` CDP scripts, which were wiped twice mid-task by environment restarts.

`probes/tool/svg-bbox.py` reads a sheet cell's exact geometry through Chromium's `getBBox`.
Prefer it to pixel scans: anti-aliasing confounds small text, and curve control points overstate a
path's extent, so only this is reliable when a pixel would change the answer.

Two traps the probe page must respect:

- It must import `@altics/ui/styles.css`. The Tailwind preset exports `theme` and `plugins` only,
  with no `content` key, so it cannot generate the library's utilities; without the stylesheet the
  page renders unstyled and every number is meaningless.
- It measures whatever fields it renders, so it must render one of each shape. Every probe run
  before this plan measured the tags card alone, which hid F1 below.

## Findings

Measured 2026-09-15. In px, from the field's border box.

### F1 — the slot margins double-count the region's padding

| field shape | marker right inset | sheet |
| --- | --- | --- |
| plain `Input` | **17** | 12 |
| `leading` + `trailing` | **15** | 12 |
| `leading` only | **17** | 12 |
| tags (`overflow="wrap"`) | 13 | 12 |

The non-attached slot adds `ml-1`/`mr-1` on top of the region's own padding, so the marker sits
4px too far in. Wrap mode hides the defect: the slot dissolves to `display: contents` and the
margin is dropped with it. Every probe until now ran on the tags card, which read a correct 13.

### F2 — the leading affix sits ~2px too far in

Sheet, `Leading text` md: the affix glyph starts 13.11 from the border box. Ours is
`1` (border) + `10` (`pl-2.5`) + `4` (`ml-1`) = 15.

### F3 — `Field` fails silently on children it cannot wire

The guard is `isValidElement(children) && typeof children.type !== "string"`, so a raw `<input>`
or a fragment gets no `id`, no `aria-describedby`, and no warning. The label then points at
nothing, and nothing says so.

### Verified correct — do not "fix" these

- **`disabled` by `opacity-50` is sheet-exact.** The sheet's Disabled cell wraps the field in
  `<g opacity="0.5">`. The references use explicit disabled tokens instead, which survives dark
  surfaces better, so treat that as a future consideration rather than a defect.
- **`Field`'s a11y wiring is Mantine-grade** — `useId`, `htmlFor`, `aria-describedby`,
  `role="alert"`, `required` — and ahead of MUI, whose own docs make the consumer wire
  `aria-describedby` by hand.
- **The focus ring model** — a border owned by the region, painted over in place by a 2px outline —
  matches the sheet's 2px focused stroke and mirrors MUI's `notchedOutline`.
- **`overflow="scroll"`** has no real precedent in the references. Primer's nowrap mode scrolls
  the input out of view; ours keeps the text pinned.

## Work items

### 1. Remove the slot's double padding, collapse the region padding (F1, F2) — DONE

- Change: the slots keep `ml-3`/`mr-3` only when attached; the region's padding became
  `attached ? pl-0 : pl-3` on the right and `attached ? pl-0 : (overflow ? pl-2.5 : pl-3)` on the
  left. The divider difference moved into `InputDivider`'s own margin, which also went `mx-2.5` to
  `mx-3` (the sheet puts the affix at 65.9, the divider at 79.5, the text at 91.3).
- One deviation from the plan as written: the left keeps `pl-2.5` for overflow content. Collapsing
  it to `pl-3` would push an empty tags field's placeholder from 13px to 15px, and 13 is the sheet
  value (12.32).
- Why: the region already insets the slot. The nested ternary tracked both.
- Result, measured on the probe:

  | shape | marker right | leading left |
  | --- | --- | --- |
  | plain | 13 (was 17) | — |
  | leading + trailing | 13 (was 15) | 13 (was 15) |
  | leading only | 13 (was 17) | 13 |
  | tags | 13 | 9 (chips) |

  Sheet: marker 12, affix glyph 13.11. Chip layout unchanged (613px chip, no spill, ellipsised).
- Also shifted, for the record: the horizontal number counter's buttons go 15 to 13, and its test
  now asserts `pr-3`. The vertical counter is unaffected — it uses `attachedTrailing`.
- Not separately measured: the password input's reveal toggle inherits the same 2px shift as the
  marker. The rule is shared (a trailing slot now sits on the region's inset), but only the marker
  inset and the affix inset were checked against a sheet. Worth a pass if the password cell gets
  revisited.
- The probe incidentally confirmed item 2's defect: in the mid-length tag case the marker wraps to
  a second row and parks at the left, reading 610 from the right edge.
- Files: `src/components/input/Input.tsx`, `InputDivider.tsx`, `tests/input.test.tsx`,
  `tests/number-input.test.tsx`.

### 2. Take the trailing slot out of the layout — DONE

- Problem: a trailing adornment could change the box. The slot was a flex item, so a marker that
  did not fit the line jumped to a row of its own: a mid-length tag case measured a 62px box where
  the rhythm gives 70, with the marker parked at the left, 610px from the right.
- Change: the slot is positioned (`absolute inset-y-0 right-3`) and the region reserves its width
  with padding (`trailingPad` per size: `pr-9`/`pr-10`/`pr-11`, i.e. the size height), the way
  Mantine reserves a section's width and MUI reserves `paddingRight: 26 + 4` for its icons. Scroll
  mode keeps the slot in the line, which is what keeps it reachable.
- Result, measured: marker at 13 on all six probe shapes, and the 40/70 box rhythm in every case
  (the mid case went 62 to 70).
- Consequence: the reservation narrows the content box, so a capped long tag now measures 585
  against 613 in a 635 field. Still inside the border, still ellipsised.
- Known gap: an attached panel *plus* a separate inner trailing slot gets no reservation (the
  region keeps `pr-0`), so text could run under that slot. Nothing in the sheets uses the pair;
  the vertical counter passes `helpIcon={false}` and no `trailing`.
- Files: `src/components/input/Input.tsx`, `tests/input.test.tsx`, `tests/number-input.test.tsx`.

### 3. Expose state as `data-*` attributes — DONE

- Change: the box carries `data-disabled`, `data-invalid` and `data-overflow`, each present only
  while its state holds. `aria-invalid` stays on the input, where assistive technology reads it.
- Why: consumers could not style a state without tracking our classes. RAC ships
  `data-focus-visible`/`data-invalid` and Mantine ships `data-error`/`data-disabled` for the same
  reason.
- Note: `data-invalid` follows `aria-invalid` as well as `error`, since both feed `invalidState`.
- Decided against: `data-size` (the sizes are baked into classes, so nothing reads it) and
  `data-focused` (the ring is CSS `:focus-within`, so no state to mirror).
- Result: 129 tests. A tags field reports `data-overflow="scroll"` through, since TagsInput passes
  the mode to Input.
- Files: `src/components/input/Input.tsx`, `tests/input.test.tsx`, `tests/tags-input.test.tsx`.

### 4. Warn when `Field` cannot wire its child (F3) — DONE

- Change: the condition is now named once (`canWire`) and covers text, a fragment and a host
  element such as a plain `<input>`. `useDevWarning` warns once per mount when it fails.
- Guard: `import.meta.env.DEV`. Verified that the built bundles carry no `import.meta.env` (so it
  is replaced, not left for the browser) and that the showcase still renders 41 labels and 107
  inputs with no error overlay.
- Result: `tests/field.test.tsx` is new — Field had no tests at all — with five: labels the
  control and points the description at the hint, describes the error instead once invalid, marks
  a required control, warns for all three unwireable shapes, and stays quiet for a wireable one.
  134 tests across 11 files.
- Files: `src/components/field/Field.tsx`, `tests/field.test.tsx`.

### 5. Replace the nested padding/rounding ternaries with a table — DONE

- Change: derive `regionPaddingLeft/Right`, `inputPaddingLeft/Right` and `regionRounding` from one
  small lookup keyed by (attached, slot, divider) instead of chained conditionals.
- Why: `cn` is a plain join with no conflict resolution, so two utilities for the same property let
  source order decide. That has bitten this codebase three times (`bg-brand-secondary`, `pr-0` vs
  `pr-3`, `h-4` vs `h-5`); the `pr-0` case is in this very region, which is why it carries a
  warning comment. A table makes the one-class-per-property rule structural instead of remembered.
- Result: one `edge(side)` returns the region padding, the text padding, the slot gap and the
  corners for a side, from that side's state (panel, reserved slot, or the region's own inset).
  The rounding is per side as a result — `rounded-l-md`/`rounded-r-md` rather than one
  `rounded-none|rounded-r-md|rounded-l-md|rounded-md` expression — which also takes the
  shorthand-versus-corner question off that element, since it no longer carries a shorthand.
- Acceptance met: the 134 tests pass untouched, no test asserted the rounding strings, and the
  probe reports the same geometry as before (marker 13 on all six shapes, boxes at
  70/70/40/40/40/40, chips 585/477/975.9 with the same spills).
- Not fixed here, noted instead: with `attachedLeading` plus a scrolling strip, the strip sits
  flush against the panel — the same missing 12px F1 was, in one combination. `edge().slot` has
  the value if that wants fixing.
- Files: `src/components/input/Input.tsx`.

### 6. Deferred: composition over props

Do not do this yet. If the slot props grow again (a fourth or fifth), reconsider the RAC model —
`Group` holding `Label`, `Input`, `Text` and `FieldError` as siblings wired by context — which
needs no new props per arrangement. It is a breaking change, so it needs a reason.

### 7. Ring only the value area when a divider is present — DONE

Measured on the rendered cells (md, Destructive=False), brand `#183976`, field x 2..322:

| cell | grey at rest | brand ring on focus | grey left |
| --- | --- | --- | --- |
| Leading text (divider at 79) | 2, 79, 321 | **x 79..321** | 2 |
| File upload (panel from 241) | 2, ~241, 321 | **x 2..240** | 321 |
| Leading dropdown (no divider) | 2, 321 | x 2..321 | — |
| Tags inner (chips, no divider) | 2, 401 | x 2..401 | — |
| Default (no slot) | 2, 321 | x 2..321 | — |

**The rule: a divider moves the ring onto the value area; without one the ring covers the whole
field.** The divider's grey line does not survive — the ring takes that edge.

Two things fall out of this, and both shrink the job:

- **Attached panels are already correct.** Our region *is* the value area when a panel is attached,
  its own border turns brand at the junction, and the panel's outer border keeps the resting
  colour. That is the File upload row above, exactly. No change needed.
- **Undivided slots are already correct.** Our ring covers the whole field, which is the Leading
  dropdown and Tags rows.

So the only wrong case is a `leading` or `trailing` slot behind a divider.

- Change, in `src/components/input/Input.tsx`:
  1. Render a divided slot as a panel-shaped **sibling** of the region — outer-side border and
     rounding, no inner border — instead of a child of it. This reuses the `attached` shape, which
     is already proven by FileInput.
  2. The region then owns the inner edge, so its own border is the divider. Either stop rendering
     `InputDivider` for these types, or keep it and let the border paint over it. Keeping it is the
     smaller diff and keeps the divider tests meaningful.
  3. Extend the edge table from item 5 with this as a third side-state. It already receives
     `divider`, so the input is there.
  4. Move the press-to-focus handler from the region to the box, skipping presses inside a panel,
     or the affix becomes a dead zone once it leaves the region.
- Size: **moderate, no new mechanism.** Roughly 60-100 net lines in `Input.tsx` (the render fork,
  the third edge state, the handler move), ~10 test assertions (divider counts, region padding and
  rounding, slot placement, press-to-focus), plus a probe pass with new divided cases. One focused
  session, then a review against the divided sheet cells at all three sizes.
- Risk: medium. The render now has two shapes, so both must stay right; the press behaviour and the
  corner rounding are the fiddly parts. Mitigated by the sheet cells as a checklist, the probe's
  geometric invariant (the region's edge sits on the divider's position), and the existing suite.
- Result: a slot behind a divider renders as an `affix` panel outside the region, so the region's
  border is the rule and focus stops there. Probed: a divided leading field's region starts 75px in,
  on the affix panel's right edge, and a divided trailing one ends 41.9 from the right — both on the
  affix. An undivided field still spans edge to edge (0/0), so nothing moved for those.
- Two bugs the work surfaced, both caught by tests and the probe rather than by reading:
  `reservesTrailing` still counted a trailing slot that had left the region, so a divided trailing
  field reserved space for nothing; and the reservation branch returned the rounded corner, which
  now belongs to the panel.
- `InputDivider` is no longer rendered: the region's border is the rule. The component stays
  exported for anyone who wants a standalone rule.
- Files: `src/components/input/Input.tsx`, `tests/input.test.tsx`, `tests/helpers.ts`.

### 8. Reconcile Textarea with its sheet by reusing the base — DONE

The sheets moved under the button folder and gained a textarea one:
`❖ Design System Altics 2.0(3)/button/input/input/` (294 cells, the 14 types, unchanged) and
`.../input/textarea/` (42 cells: Default, Tags inner and Tags outer × 2 sizes × 7 states).

Measured on the rendered cells, md with sm in brackets:

| | input | textarea |
| --- | --- | --- |
| box | 320×40 | 320×**128** (320×110) |
| rest border | `#D4D4D4` | `#D4D4D4` |
| focus | `#183976` | `#183976` |
| error rest | `#FCA5A5` | `#FCA5A5` |
| error focus | `#EF4444` | `#EF4444` |
| ring | 1px rest, 2px focused | 1px rest, 2px focused |
| radius | 6 | 6 |
| text inset | 12 | ~15 (13) |
| first text row | centred | 12-13 below the top |
| help marker | yes | **none**, across all ten cells checked |
| disabled | the whole field at 50% | the whole field at 50% |
| sizes | 3 | 2 (sm, md) |

The chrome is identical and only the metrics differ. So Textarea becomes a thin wrapper over the
base with a multiline mode — the shape Mantine uses, where `component="textarea"` plus `multiline`
switches the size table (their `--input-padding-y` changes under `[data-multiline]`).

Why not a second base:

- The chrome would duplicate and drift, and it already has. Our Textarea's error border is
  `border-destructive` where the sheet says red-300, its focus ring stays brand where the sheet
  says red-500, and its `disabled:opacity-50` fades the textarea rather than the whole field.
- The `Tags inner` and `Tags outer` textarea types are a textarea **with chips**. That needs the
  leading slot, the chip insets, the edge table and the wrap and scroll modes. A second base would
  rebuild all of it.

Change:

1. `Input` gains a multiline mode: render a `<textarea>`, top-align rather than centre, and take
   height and padding from a textarea metrics table.
2. Metrics: height 128/110 as a **minimum** so typing grows it; padding `px-4 py-3` (16 left, 12
   top); radius 6 unchanged; no help marker.
3. `Textarea` becomes a wrapper: `size="sm" | "md"`, `rows`, and the pass-through props, with the
   public API otherwise unchanged.
4. Size: **moderate** — the same shape as item 7, a render fork plus a metrics table, tests, and a
   probe pass. Noticeably smaller than a second base, and it retires the discrepancies instead of
   duplicating them.

Result: `Input` gained a `multiline` mode (renders a textarea, top-aligned, textarea metrics) and
`Textarea` is now a wrapper over it, the shape Mantine uses.

A second pass with exact geometry (not pixel scans) corrected two of the metrics:

- **The scale is the other way round for text.** The sheets hold the textarea's text at 16px
  whichever size, where the input scales 14/16/16. Ours was `text-sm` at sm.
- **The inset scales by 2**: 14px at sm and 16px at md, against 12 for the input at both sizes.
  Ours was a flat 16. Both fall out of the same string at both sizes — the placeholder glyph is
  identical at sm and md (102.94 x 11.58, the same y) — so the 2px is inset, not font.

Confirmed at the same time: heights 110 and 128; the vertical inset matches (the same glyph y at
both sizes); the placeholder is `#737373`, so an earlier `#959595` reading was anti-aliasing; and
the resize handle is two short diagonal strokes in the bottom-right corner.

Then a render pass showed the metrics were on the wrong element. Height, padding and inset now sit
on the textarea rather than the box:

- the resize grip lands on the field's corner, where the sheet draws it (x 306..315 against a right
  edge of 321), instead of inset from it;
- a min-height on a resizable element bounds the drag, so the handle cannot shrink the textarea
  inside a fixed field — which left it floating over empty space — and, with the floor off the box,
  dragging it larger now grows the field;
- and the region holds its inset back in multiline, or the text is inset twice. It is 1 + 14 at sm
  and 1 + 16 at md, landing on the sheet's 14.84 and 16.84.

Probed: field 110 and 128, the textarea reaching the field's edge (inset 1, the border), padding
12+14 at sm and 12+16 at md, 16px text at both, `resize: vertical`, with the marker inset, box
rhythm and divided-field invariants unchanged. 152 tests across 12 files.

Three discrepancies retired rather than duplicated: the error border was `border-destructive` where
the sheet says red-300, the focus ring stayed brand where the sheet says red-500, and
`disabled:opacity-50` faded the control instead of the field. The textarea also gains
press-to-focus, the `data-*` state and `Field`'s wiring for free.

Decisions:

- **Minimum height by default, `rows` opts out.** The default matches the sheet; the text scrolls
  inside it, as a textarea does. Pass `rows` and the minimum is dropped, leaving native sizing to
  rule. Not auto-growing with content, which would need a JS resize on input — Mantine's
  `autosize`. Worth considering later, not here.
- **A consumer's `className` will not reliably override these metrics.** `cn` joins without
  resolving conflicts, so `min-h-40` and `min-h-[128px]` both land and Tailwind source order
  decides — the same hazard item 5 addressed. `style` always wins, so that is the documented
  escape hatch. Dependable class overrides would need a conflict-aware merge (tailwind-merge,
  a new dependency), which is its own decision rather than something to fold in here.
- **The sheet does draw a resize handle**: the bottom-right corner carries 23 ink pixels against 7
  in the symmetric bottom-left, and the cell's paths include two short diagonal strokes there.
- **The grip itself is the browser's, and no reference tries to mimic it.** None of the eight styles
  `::-webkit-resizer`. Mantine and Primer expose a `resize` prop (Mantine defaulting to `none`), antd
  accepts the native grip and carries a `resizeDirty` flag because `resize: both` breaks wrapper
  layout, and React Spectrum has no user resize at all. Mimicking is Chromium-only or double-draws
  on Firefox, whose grip cannot be styled or hidden — worse than natively different. So the choice is
  exposed instead: `resize`, defaulting to `vertical`, with the state readable as `data-resize`.

### 9. The sheets' textarea type for tags — DONE

The textarea folder carries Tags inner and Tags outer, and measured they are the same field as a
plain textarea with the chips placed as usual: 320x128 (110 at sm), the chips 78 and 99 wide with
6px gaps, and no help marker, all identical to the one-line field.

| | sheet, inside | sheet, below |
| --- | --- | --- |
| chips | top row at y 38, the padding line | 8px under the field, flush left |
| chip inset | 12, where the text sits 16 | flush with the border |
| text after chips | 8px later | the field's own 16 |
| empty field text | 16, the same as a plain textarea | same |
| resize grip | present, at the corner | present |

`TagsInput` gained `multiline`, and because the chips follow the same 4px rule as a one-line field,
the region keeps the inset while the textarea's padding goes to zero — which also lets the textarea
reach the field's edge and puts the grip at the corner. The field holds the sheet's floor and the
textarea stays content-sized, so the chips and the text share the line.

Probed: field 128, chips at 13 (12 plus our border) and top 13, textarea reaching the field's edge,
min-height 102. The plain textareas are unchanged. 157 tests across 12 files.

### 10. The verification sheet for PinInput — DONE

The verification folder holds one cell per size and digit count — 4 and 6 digits, sm/md/lg, no
states — so the resting look is the whole spec and focus, error and disabled stay ours. The
component is PinInput: the sheet's pattern answers to Mantine's PinInput, whose placeholder sits
in the empty cells and clears on the focused one, so the name moved with the work. OtpInput keeps
its earlier shape — cells on the field ramp, 36, 40 and 44 on the 8px gap, no placeholder digits:
the small field for SMS codes, beside the display cells.

| | sheet | ours |
| --- | --- | --- |
| cell | square, 64 / 80 / 96 | `w-16 h-16` / `w-20 h-20` / `w-24 h-24` |
| gap | 8, then 12 at md and lg | `gap-2` / `gap-3` |
| digit | 36 tall at sm and md, 45 at lg — 0.75em, so 48 and 60 | `text-5xl` / `text-6xl` |
| digit colour | 737373, the placeholder token | `placeholder:text-placeholder` |
| inset | none: the glyph is centred | the region drops its padding |

The digit size could not ride `className`: the box already carries `h-9` and `w-full` and cn does
not resolve conflicts. The base gained a `cell` mode, same shape as `multiline` — the span sizes
the field, the box fills it, the font carries the digit — and the region gives up its inset so
`textAlign` centres the glyph.

The sheet's resting cell holds a greyed digit (a 0) where an empty cell drew nothing before. The
mirrors carry it as the input's placeholder, so the value wins once typed; the active cell clears
it so the caret has a slot. The font sizes are the scale's own 48 and 60 — Tailwind defaults,
since the theme overrides spacing and width but never fontSize.

Probed: PinInput 64/80/96 square, gaps 8/12/12, fonts 48/48/60, region inset 0, placeholder "0"
at rgb(115, 115, 115) = 737373; OtpInput back on 40/40, gap 8, font 16, no placeholder. 175 tests
across 13 files.

## Patterns worth stealing, with sources

| From | Pattern | Use |
| --- | --- | --- |
| Mantine `Input.module.css` | Sections are `position: absolute`; the input's padding reserves their width | Item 2 |
| MUI `Autocomplete` | `paddingRight: 26 + 4` reserved for popup/clear icons | Item 2, corroboration |
| RAC `Group`, Mantine `Input` | State as `data-*` attributes | Item 3 |
| Mantine `PillsInputField` | `data-type="hidden" \| "auto"` inputs (`absolute; opacity: 0`) | the dropdown types still owed |
| Mantine `PinInput` | Placeholder shown in the empty cells, cleared on the focused one | Item 10 |
| RAC `TextField` | `Group` + context: `Label`/`Text`/`FieldError` as siblings | Item 6 |
| Primer `TextInputWithTokens` | `visibleTokenCount` + `+N`, un-truncating on focus | the tags collapse option |
| MUI `OutlinedInput` | The ring replaces the border (`notchedOutline`) | confirms our region-border model |

## Not in this plan

The inventory gaps, each its own plan: the two dropdown types, `Date and time`, `Payment input`,
the button sheets' store badges and their plain red `Link` hierarchy, and `button.test.tsx`
(1 test against the widest sheet surface in the library).
