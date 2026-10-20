# Plan: the select family

Status: done (open questions kept for the lead)
Opened: 2026-09-17
Last updated: 2026-09-21
Owner: x1nx3r
Related: `docs/plans/flexibility.md`, `docs/references.md`

The select family, built on base primitives first. Every number below is
measured from the sheets (`sheets/select/`), not read
off a design doc.

## The sheets

| folder | cells | matrix |
| --- | --- | --- |
| `select/` | 90 | 3 sizes × 6 types × 5 states |
| `multi-select/` | 21 | 3 sizes × 7 states |
| `select-menu-items/` | 72 | 3 sizes × `Selected` × 4 types × 3 states |
| `multi-select-menu-item/` | 9 | 3 sizes × 3 states |

- **Trigger types:** Default, Search, Tags, Avatar leading, Dot leading, Icon leading
- **Trigger states:** Default, Placeholder, Focused, Open, Disabled
- **Multi-select states:** Default, Active, Focused, Disabled, Open default, Open active,
  Search empty state
- **Menu items:** `Selected` true/false × leading type × Default/Hover/Disabled

## Anatomy, measured

**Trigger** — same chassis as the input, which is the reuse decision:

| | sm | md | lg |
| --- | --- | --- | --- |
| box | 320 × 36 | 320 × 40 | 320 × 44 |
| chevron | 9.33 × 5.33 | 9.33 × 5.33 | 11.67 × 6.67 |

- border `#D4D4D4` at rest, **`#183976`** focused and open (the focus token)
- text inset 12 at sm and md, **14 at lg** — and the trailing mark sits on the
  same edge, not a narrower one. The sheet measures both off the leading avatar,
  which has no bearing to confound them: 14 at sm against 16 at lg. Two cells
  draw a mark 2 to 5 further in (the sm Default chevron, the Search and Tags
  clears at md and lg); they read as quirks, not a second rule.
- the chevron is a 16 icon up to md and a **20 at lg** (11.67 × 6.67 of ink
  against 9.33 × 5.33); the clear mark the Search and Tags types draw is 9 to 10
  of ink, so a 10 icon at sm and 12 above
- text inset 12 at md (14.54 from the sheet's 2.5 border), placeholder `#737373`
- **selected values are two lines**: label `#171717` and description `#525252`
  (side by side, not stacked); the placeholder state draws only the placeholder
- leading adornments: avatar 24 × 24 at x14 (md), icon ~15 × 16.7 at x16.5
- Tags type: chips 78 × 23 with a 16 × 16 avatar inside
- Search type: leading search icon and a 10 × 10 clear icon instead of the chevron

**Panel** (from the Open state):

- 320 wide — flush with the trigger — 4 below it, white, bordered
- max height 256 (single, md) / 408 (multi active) / 262 (search empty)
- rows 36 / 40 / 44 with a 2px gap (a pitch of 38 / 42 / 46) — the field's own
  ramp, 14px of label at sm and 16 above — inset 4 at sm and 6 above, the label
  8 from the row's edge and 8 from an adornment
- hover row `#FAFAFA`, 40 tall at md, inset 6 from the panel edge
- selected check 12 × 8.67 at the row's right, 15 × 10.83 at lg (a 16 icon
  against a 20); a checkbox 15 × 15, 19 at lg
- scrollbar thumb ~7 wide
- **only the multi panel carries a search row**: 44 tall (48 at lg), magnifier at
  13.67, the label `#D4D4D4`-free `#737373`, a 2px `#E5E5E5` divider under it
- **only the multi panel carries a footer**: a 2px divider, 60 tall, two secondary
  buttons 36 tall (`#D4D4D4` border, white, label `#404040`, text inset ~16) — 68
  wide at the panel's left inset 12, 90 wide at its right inset 12. The words are
  `Reset` and `Select all` (aef736e): Reset empties the selection, Select all adds
  every option in the list right now. At sm the buttons drop to 32 tall in a 44
  footer. The single panel has no footer.

## Base components: four new, three reused

**New:**

1. **`Popover`** — an anchored panel, nothing else.
   Must support: positioning with flip/shift/collision, a portal, outside-press and
   Escape dismissal, focus return, controlled + uncontrolled `open`, `data-state`,
   an offset (4 here), width matching the anchor, scroll containment.
   This is the only place a new dependency earns its place: `@floating-ui/react`
   (headless; also gives `useDismiss`, `useRole`, `useListNavigation`,
   `useTypeahead`, `useClick`). It is also what the sibling admin-portal uses.

2. **`Listbox`** — `role="listbox"`, no chrome.
   Must support: single and multiple selection, active descendant tracking,
   keyboard (Up/Down/Home/End, PageUp/PageDown, Enter/Space, Escape),
   typeahead, scroll-into-view on active change, disabled options. Virtualisation
   is out of scope (the sheets show at most ~8 rows + scroll).

3. **`ListboxOption`** — a row, not a button.
   Must support: `role="option"` + `aria-selected` + `aria-disabled`, label +
   description, a leading adornment slot (avatar / dot / icon), the selected
   check, hover/active/disabled treatments, and the 38/42/46 height ramp with its
   own text inset (15.28 at md).

4. **`Select`** — one component with modes, the house pattern (`multiline`, `cell`):
   `multiple`, `searchable`, the six trigger types via `leading` plus a `display`
   kind. Composes Popover + Listbox + the trigger; owns value, placeholder,
   open state, and the trigger's two-line value rendering.

**Reused as-is:** `Input`'s size ramp and chrome language, `TagsInput`'s chip
(for the Tags type), `Field` (label/hint/error wiring), `cn`, the `data-*`
conventions.

## The open architectural question: the trigger's chrome

The trigger is the input chassis **without** an `<input>` — a button-like
combobox (value display, adornments, chevron, `aria-expanded`) that needs the
same border/region/focus-ring/disabled/error behaviour. Three ways:

- **a. Extract `FieldChrome`** from `Input` — box + region + border + rounding +
  focus ring + state attributes — and have both `Input` and the trigger render
  it. Architecturally right, matches "every type builds on the base", but it
  refactors the most-used component in the library.
- **b. `SelectTrigger` duplicates the edge table** — fast, but two sources of
  truth for the family's geometry.
- **c. Extend `Input` with a display mode** — the input element cannot render a
  two-line value or adornments, so this fights the DOM.

Recommendation: **a**, but only after the primitives (Popover/Listbox) exist, so
the refactor lands with a real second consumer rather than speculatively.

## Behaviour and accessibility checklist

- combobox pattern: `role="combobox"`, `aria-expanded`, `aria-controls`,
  `aria-activedescendant`; the trigger keeps focus while the list is open
- labels: `Field` wires `id` / `aria-describedby` / required / error
- the search mode: an input inside the panel, filtered options, an empty state
  (`Search empty state` is a drawn cell), and focus that stays usable
- multiple mode: chips or a count in the trigger, and the panel's own rows
- disabled: field-level and option-level are separate
- reduced motion for any open/close transition

## Measurements taken (`--band=` added to the tool; it no longer hides items)

**Menu items** (the item sheets are glyph outlines; measured with the band off):

| | sm | md | lg |
| --- | --- | --- | --- |
| row height | 38 | 42 | 46 |
| text inset | 12 (ink 13.12) | 14 (ink 15.28) | 14 (ink 15.28) |
| label / description gap | 6 (ink 7.86) | 8 (ink 10.84) | 8 (ink 10.84) |

- label `#171717` at 16px, description `#525252` (neutral-600)
- hover **and** chosen rows fill `#FAFAFA`, 40 tall at md, inset 6 from the panel
- disabled is the whole row at `opacity="0.5"`
- the check is 12 × 8.67, `#525252`, 12 from the row's right (not the text inset)
- leading adornments sit at inset 14: avatar 24, icon 16 — and the Dot type's dot
  is **not drawn in the export**; its text starts 30.78 from the edge, which
  with the avatar's pattern implies an 8px dot, gap 8. Its colour is inferred

**Tags type**: the field is 400 wide, with a 16.67 leading icon. Chips are 78–102
× 23 (24 with borders), avatar 16 at inset 4.5, label 14px `#404040`
(neutral-700), a 7 × 7 remove glyph 8 from the chip's right, and chips 6 apart
between border boxes.

**Multi-select trigger**: the same chassis, showing *text* rather than chips —
placeholder `#737373` when empty, the summary `#171717` when it has a selection.

Still owed: the Search type's panel (the input's geometry and the empty state),
and the six trigger types' chrome.

## Order of work

1. Fix the measurement tool's band; finish the item/type measurements above
2. `Popover` + tests — DONE (`947ac80`, `5944343`): `@floating-ui/react`, a
   hook plus `PopoverPanel`, 6 tests. Two things learned:
   - floating-ui composes interactions in one `useInteractions` scope, so the
     base is a **hook**, not a provider component; the listbox's navigation
     and typeahead join it there.
   - the middleware array must be **memoised**, or `useFloating`'s effect
     re-runs every render and loops.
   - tests pass a **deterministic platform** (`tests/floating.ts`): jsdom has
     no layout, and `flip` on an aligned placement with a sizeless reference
     never settles — the suite hung on the browser's real configuration.
3. `Listbox` + `ListboxOption` + tests — DONE (`20b670e`, `9cae406`, `138ed3e`).
   The model floating-ui gives a listbox:
   - the panel **is** the listbox (`role="listbox"` from `useRole`); its
     `aria-controls` points at the floating element, so a nested container
     breaks the wiring — options are the panel's children
   - key handling lives on the **panel**, and navigation moves **real focus**
     between options, so an option is focusable but not a tab stop
     (`tabIndex={-1}`); without that the keys do nothing
   - `typeahead` takes a ref of **labels**, not elements
   - `initialFocus={-1}` means *leave focus alone*, so the panel takes focus
     itself on open; `FloatingFocusManager` still returns it to the trigger
   - a caller's `style` must be merged **under** the computed position, or the
     panel loses `top`/`left` (both bugs found by the browser probe, not jsdom)
4. The trigger: chrome shared rather than extracted — Input's size table and
   base strings moved to `input/chrome.ts`, which Input and the Select trigger
   both read (a full `FieldChrome` component extraction would restructure Input
   for one extra consumer; revisit if a third appears) — DONE (`6bbd7ef`)
5. `Select` single — DONE (`34e936c`): value/defaultValue/onValueChange,
   placeholder, the field ramp, disabled, error, a leading slot, label plus
   description in the trigger and the rows, the selected check, a hidden input
   for forms, and Field's label/required/error. Trigger is `role="combobox"` +
   `aria-expanded`/`aria-controls` from floating-ui; 12 tests. The browser probe
   chooses Singapore with two arrows and Enter, and the panel closes.

   Row ramp implemented from the sheets: 38 / 42 / 46. The row's text inset is
   measured at 15.28 and drawn at 14 (`px-3.5`) — worth a second look.

   `searchable` — DONE (`6d0e6d4`, tests in the same pass): a search field at the
   panel's top, 44 tall at sm and md and 48 at lg, with a leading mark and a
   divider under it; filtering on label and description; the sheet's empty state
   (circled mark, title, hint, clear); focus into the field on open, which also
   needed the list navigation to stop taking focus on open or following the
   pointer.

   Measuring the panel corrected the rows again: the hover fill is inset 6 from
   the panel, so the text at 15.28 is 8 of padding, not 14. Rows are the field
   ramp (36/40/44), the check sits 12 in from the row's right, and the item
   sheets' 38/42/46 canvases carry 2 of their own.

   `multiple` — DONE (`e50a385`, tests in the same pass). The multi-select sheets
   differ in three measured ways: the trigger carries a count, not a value
   (placeholder `#737373`, summary `#171717`), the panel keeps a search field by
   default (44 tall, the same divider), and every row leads with a **15px
   checkbox** where the single select trails a check. Toggling leaves the panel
   open, and each value gets its own hidden input. The panel is taller with it:
   408 against 256. The browser probe toggles two rows: search present, panel
   open, trigger reads "2 selected".

   Trigger types — five of six DONE (`8521da2`, tests in the same pass):
   - **Search**: a leading mark and a **clear** that appears only with a value
     (empty shows nothing, no chevron). A clear inside a button is a button in a
     button, so the field took Input's shape — the wrapper carries the chrome and
     the focus ring (`focus-within`), the trigger lies over it, the clear is a
     sibling section
   - **Avatar / Dot / Icon leading**: the `leading` slot on the trigger, and the
     option carries its own adornment for the menu-item sheets' types (sized at
     the call site: 24 avatar, 16 icon, 8 dot)

   - **Tags**: DONE (`a08a35c`, tests in the same pass). `chips` (with
     `multiple`) turns the value into chips — 24 tall, each leading with the
     option's own adornment, its label, and a remove that takes that option back
     out without opening the panel. The sheet's Tags field also trails a clear,
     which `clearable` already draws. Chips carry buttons and a button cannot
     hold buttons, so the trigger became a bare button over a
     `pointer-events-none` layer: the layer draws the leading, the value or the
     chips and the chevron, its chip buttons opt back into pointer events, and
     the button keeps its name from screen-reader-only text.

   All six trigger types are now drawn: Default, Search, Tags, and Avatar, Dot
   and Icon leading.

   Also owed: the two-line trigger value as the sheet draws it. And the browser
   probe now covers five flows: selecting, searching, toggling, removing a chip,
   plus the base measurements.
6. Multi-select's own trigger states (Active, Open active) and the empty state

## Size audit (sm / md / lg)

Every sized part, measured off the sheets at all three sizes (8b13816):

| part | sm | md | lg | how it steps |
| --- | --- | --- | --- | --- |
| trigger box, value | 36, 14px | 40, 16px | 44, 16px | the field ramp |
| trigger text inset | 12 | 12 | 14 | measured off a leading avatar, which has no bearing to confound it |
| trigger trailing mark | 10 | 12 | 14 | the chevron's frame, across 69 cells with zero variance (c67cbf4); our layer adds the field's 1px border, as on the leading side |
| clear mark (Search, Tags) | 12 | 16 | 18 | button position; the sheet's ink sits 12.5 / 17 / 19 (full-sheet audit) |
| chevron | 16 | 16 | 20 | ink 9.33 × 5.33 → 11.67 × 6.67 |
| clear mark | 10 | 12 | 12 | ink 9 → 10 |
| menu row | 36, 14px | 40, 16px | 44, 16px | the field ramp again |
| menu row inset | 4 | 6 | 6 | the hover fill's own edge |
| row padding, gaps | 8, 8 | 8, 8 | 8, 8 | the label ink against the row's edge |
| row check | 16 | 16 | 20 | ink 12 × 8.67 → 15 × 10.83 |
| row checkbox | 15 | 15 | 19 | |
| supporting text (trigger's second line, row description) | 12 | 14 | 14 | one step below the field's own text (cd14997) |
| chip | 24, 12px | 24, 14px | 24, 14px | unchanged — both sheets already agreed |
| panel search row | 44 | 44 | 48 | |
| panel search mark | 16 | 20 | 20 | ink 13.33 → 16.67 |
| panel row pitch | 38 | 42 | 46 | row + 2 |
| empty-state circle | 32 | 32 | 32 | md only in the sheets |

One thing the sheets do not settle:

- **the multi panel's height**: the sheet draws 372 / 408 / 476 by size, but that
  is its content, not a cap. We cap multiple at 408 and single at 256, so our lg
  multi panel is shorter than the sheet's cell.

The Search empty state cell is matched (aef736e): a 32px box with 6px corners
holds the mark, `No teams found` (medium, ebeeaeb) sits 12 under it, `Please try a
different search term.` 4 under that, and `Clear search` — brand text, no pill —
10 more, 18 before the footer. The panel's dividers are 2px fills; its border is
1px.

A weight audit (ebeeaeb) rendered every cluster's copy in our stack at 400, 500,
600 and 700 against the sheet's ink width. It resolved only regular-vs-bold (the
measuring environment's fallback font collapses 500 into 400 and 600 into 700),
and its per-cluster read was later overruled by the Figma spec, which pins the
weights exactly:

| cluster | class | weight |
| --- | --- | --- |
| trigger value, count, placeholder | text-sm / text-base ramp | 400 |
| descriptions (trigger, menu rows) | supportingText ramp | 400 |
| chip label | text-xs / text-sm | 400 |
| search input and its placeholder | text ramp | 400 |
| empty title `No teams found` | text-sm | 400 |
| empty hint `Please try a different search term.` | text-sm | 400 |
| empty action `Clear search` | text-sm | **600 semibold** |
| footer `Reset` / `Select all` | text-sm | **600 semibold** |

The spec wins where the ink disagreed: the footer labels and `Clear search` are
semibold, and the empty title is regular (the audit's +1.8% there was font
noise, not a weight step).
- **the clear mark's frame**: its glyph's frame is unknowable from the ink (a
  ~10px mark could sit in any frame). The full-sheet audit fixes the *ink* at
  12.5 / 17 / 19, which with our glyph puts the button at 12 / 16 / 18.

One bug found outside this family: the **Input insets 12 at lg where its sheet
draws 14** (measured off the same leading avatar). The fix belongs on
`feat/input-blocks`.

The sheets' **Supporting text** style (12 at sm, 14 at md and lg, `#525252`) is
also the line they draw under every field — the line our `Field.hint` covers.
Our hint is `text-xs` at every size and `text-muted-foreground` (≈ `#6B7280`),
so it misses both the step and the colour. The `Field` takes no size, so closing
that needs a decision (a `size` prop, or a caller-styled hint). The button
sheets carry a `Supporting text=True/False` axis of their own — a social
button's label beside its mark — which nothing in this library draws.

## Composites: the re-inspection

A re-read of all 192 cells found exactly two composite components worth having,
and both are built:

| composite | why | cells it draws |
| --- | --- | --- |
| `SelectItem` (a6de892) | the row anatomy appears 81 times across `select-menu-items` and `multi-select-menu-item`, and a consumer composing a select needs it | 72 + 9 |
| `Chip` (76a1bec) | two products draw the same chip: the tags field and a select's Tags trigger | the Tags cells, plus the input family's tags sheets |

Everything else in the sheets is a part of one product, so it stays inside
`Select` and is **not** a component: the trigger chrome, the in-panel search row,
the empty state, the footer, the clear button, the chevron, the check, the
checkbox. Groups, labels and separators do not appear in these sheets at all.

The rule this settles: a composite earns its place when two products draw the
same thing, **or** when a sheet grid cannot be drawn — or a consumer cannot
compose — without it. `Chip` is the first case, `SelectItem` the second.

## Demo and browser probe

The sheet-parity canvas (`probes/?page=sheet`) draws all 192
cells with the real components — 90 select + 21 multi-select + 81 menu-item rows —
and they are live: a press belongs to the control it lands on (trigger, option,
panel, search field) and to the canvas everywhere else, so cells open, filter and
toggle while dragging the background pans. The canvas sits at 100% — 1:1 with the
sheets, where floating-ui's flip and shift are exact. An Open cell holds its
panel only while the cell is on screen (an IntersectionObserver with a bottom
margin, so the panel always fits below the trigger) and reserves the panel's
room in the grid; without the reserve the Open column stacked every row's panel
into a tower, and without the in-view rule the panels whose triggers sat past
the viewport were flipped or shifted into the visible ones. The cursor follows that split — `grab`
over the canvas, the control's own over a cell — and ctrl/⌘+wheel zooms through a
non-passive listener, because React registers `wheel` as passive and a handler
prop cannot stop the browser zooming too. Verified with real input events over
CDP (`probes/tool/sheet-cdp.mjs`): a press opens the panel, an option chooses
and closes, a multiple's search filters while the panel stays open, the
background pans, and ctrl+wheel moves the toolbar's percentage with
`visualViewport.scale` held at 1.

Positioning under zoom taught the rule the library now documents (37e90f8): the
portal root must be the positioned ancestor. Static, it anchored the panel to the
document — exact at 100%, drifting by up to a screenful at 75%.
`probes/?page=popover` is the feature demo — six cards: keyboard/typeahead/
scrolling, a disabled option, an upward placement, a pointer-only panel, a
controlled one, and two instances at once.

`probes/select-probe.html` measures the bases alone, and the numbers stand:

| case | measured |
| --- | --- |
| basic | panel width matches the trigger, gap 3.8 (the 4px offset), focus inside the panel, arrows step `basic-1` → `basic-2` |
| above | gap above 4.2, flipped — it opens upward when there is room |
| scroll | height caps at 256 with 480 of content, scrolls, `End` lands on `scroll-11` and keeps it in view |
| nofocus | focus is *not* in the panel; it stays on the trigger |
| disabled | stepping visits 1, 2, 4, 5, 6 — never 3 |
| two instances | each trigger's `aria-controls` matches its own panel, and the ids differ |

Two more things the probe caught, now fixed: a caller's `style` wiped the
computed position, and `FloatingFocusManager` marked everything outside the
panel inert — the trigger included.

## Open questions for the lead

- adopt `@floating-ui/react` as the family's first structural dependency?
- trigger chrome: extract `FieldChrome` (a refactor of `Input`) or duplicate?
- does the two-line option model (`label` + `description`) come from the product
  data, or is it a sheet illustration we can leave to a slot?
