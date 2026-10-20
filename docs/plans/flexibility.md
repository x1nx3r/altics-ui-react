# Plan: the flexibility tier

Status: active (phase 5 remains)
Opened: 2026-09-21
Last updated: 2026-09-22
Owner: x1nx3r
Related: `docs/plans/select.md`, `docs/references.md`

The flexibility tier for the select family and the floating primitives, per the
react-select-comparison discussion.

## The goal — three tiers

1. **Configure** with props.
2. **Restyle** with `cn` + `data-slot`s.
3. **Compose** your own select from the published primitives.

Stance: the geometry is non-negotiable; the seams are first-class. North star:
React Aria Components (primitives with baked-in behaviour, styling fully yours) —
not react-select's replace-any-part model, which moves the design outside the
component and taxes every refactor.

## The references, and what we take

| ref | take | leave |
| --- | --- | --- |
| react-select | the ambition (every part has a seam), controlled `inputValue`, `getOptionValue`/`getOptionLabel` | `components`/`styles`/`theme`/`unstyled` |
| Mantine | typed per-part classes, `filter`, `allowDeselect`, `maxSelectedValues` | — |
| MUI | `autoSelect`, `onHighlightChange`, virtualized listbox | `renderInput` |
| antd | virtual list, `maxCount`, `fieldNames` | `mode="tags"` |
| Ark | `closeOnSelect`, `selectOnBlur`, positioning | — |
| RAC | the composable-primitives model (north star) | — |
| Primer | SelectPanel's footer (precedent for ours) | — |

## Phase 1 — publish the primitives — DONE

- Root exports, flat (the existing style): `PopoverPanel`, `usePopover`,
  `ListboxOption` + the types (`PopoverPanelProps`, `Popover`, `PopoverRole`,
  `UsePopoverOptions`, `ListboxOptionProps`).
- A docs pass on the option contracts; the JSDoc is close, make it
  consumer-grade.
- Semver: 0.1.0 → minor-scoped additions; early is cheap.
- Acceptance: an import smoke test; a mini-menu recipe in the probe built only
  from the primitives.

## Phase 2 — data-slots for every part — DONE

| part | slot | status |
| --- | --- | --- |
| field box | `select` | has |
| value region (bordered) | `value` | new — matches Input |
| panel | `popover` | has |
| search row | `search` | new |
| rows scroll region | `options` | new |
| option row | `listbox-option` | has |
| empty state | `no-results` | new |
| loading row | `loading` | new (phase 4) |
| footer | `footer` | new (phase 3) |
| chip | `tag` | has |
| clear button | `clear` | new |

Acceptance: every part targetable by `[data-slot=…]`; the ramp tests updated
where natural.

## Phase 3 — the footer slot — DONE

- `footer?: ReactNode` — given (including `null`) it replaces or hides the
  built-in; the built-in keeps `resetLabel`/`selectAllLabel`.
- Acceptance: a custom footer renders, `null` hides, the default persists.

## Phase 4 — the crucial props — DONE

**4.1 `getOptionValue` / `getOptionLabel`, with light generics.**
`Select<T = SelectOption>`; `options: readonly T[]`; the resolvers are optional
and default through a contained cast to `SelectOption`. Internal refactor: every
`option.value` / `option.label` access goes through `valueOf(option)` /
`labelOf(option)` — `findIndex`, `includes`, the `Set` in `selectAllVisible`,
the keys, `matches`, the trigger rendering, the accessible value.
`description`/`leading` stay `SelectOption` features for this cut; full
resolvers are a later option.
Acceptance: a domain-shaped record (no `value`/`label` fields) drives the
select end to end; the defaults keep every existing test green.

**4.2 `loading?: boolean` + `loadingLabel = "Loading…"`.**
A centered loading row (`data-slot="loading"`, `Spinner` 16) shown instead of
the rows and the empty state; the search field stays live; the footer stays.
Precedence: loading > empty state > rows. The sheets never draw it — a designed
row, not a traced one.

**4.3 The controlled query.** `query` / `defaultQuery` / `onQueryChange`.
Uncontrolled keeps the reset-on-reopen; controlled is the caller's (no reset,
documented).

**4.4 The trigger's `onFocus` / `onBlur` (+ `autoFocus`).**
Forwarded through `getReferenceProps(userProps)` — floating-ui composes
handlers, so nothing is clobbered.

**4.5 `readOnly`.**
The panel never opens, the clear disappears, no fade, still focusable, the
hidden inputs still render (submittable), `data-readonly="true"`.

## Out of scope (deliberate)

Grouping, tags/creatable, async `loadOptions` (compose with `loading` + the
controlled query), `renderOption` (tier 3 instead), `styles`/`components`/
`theme`/`unstyled` (tier 2 instead), `menuPlacement` (flip covers it),
virtualization (a later perf item), RTL.

## Order and size

1 → 2 → 3 → 4. Phases 1–3 are small; 4 is the big one (4.1 is the refactor).
`dist/` rebuilds each phase — the canvas serves it.

## Phase 5 — backend-data hardening

Decisions from the robustness discussion, approved:

**5.1 Fallback labels for unknown chosen values.** A chosen value the options
list doesn't contain — a deleted record, or a still-loading fetch — renders as
`String(value)` everywhere the label would: the single trigger (instead of
falling back to the placeholder while the hidden input submits the value), a
removable fallback chip per unknown value on the multi trigger, and the
accessible value. Removal goes through a `removeValue(value)` helper, since
`choose(option)` needs an option object.

**5.2 Dev-only contract warnings.** `NODE_ENV`-gated, prefixed
`[altics-ui] Select:` — duplicate values among options (ambiguous keys and
selection), non-string values (strict-equality marking breaks), and `options`
not being an array. Deliberately not warned: chosen values missing from the
options — legitimate during an async load, handled by 5.1.

**5.3 Guards.** `options` passes through an `Array.isArray` check (warn plus an
empty list) so a JS consumer's `undefined` cannot crash `.filter`. When the
panel is open and the options length changes, the highlight restarts at 0 (or
null when empty) — the same reset a search performs — rather than pointing at a
stale row. Guarded by a previous-length ref so the initial mount keeps its
chosen highlight.

**5.4 `maxSelectedValues?: number`.** A cap on a multiple select: `choose`
refuses past it, and Select all fills up to it (the union of chosen and
visible, sliced). Unchosen rows refuse silently rather than rendering
disabled — `aria-disabled` would claim the option is broken when it is the
limit that is hit. The count keeps telling the truth.

**5.5 The empty state's way out is query-gated.** `Clear search` renders only
while a search is active; with zero options and no search, offering a no-op
clear and "try a different search term" was misleading copy.

The consumer's job stays theirs: fetch races, value normalisation, the
`leading` node's content safety, list sizes beyond virtualization.

## Phase 7 — ref-parity interaction knobs — DONE

## Phase 8 — close, highlight, clear — DONE

## Phase 9 — classNames per part — DONE

A typed `classNames` prop keyed by the data-slots each part emits —
`select`, `search`, `options`, `footer`, `no-results`, `clear`, `loading` —
as `SelectClassNames`, exported from the root. Three deliberate constraints
from the design review: keys mirror the slot names (one vocabulary, and the
`select` key reaches the bordered box `className` cannot); merge-only
through the existing `cn()`, so geometry cannot be removed, only extended;
no state callbacks — state styling stays on the attribute selectors the
slots already carry (`data-selected`, `aria-expanded`). The `no-results`
key travels through a `className` on the standalone `NoResults` component.
No `load-more` key: the sentinel is an invisible 1px row, nothing to style.

**`closeOnSelect` (default `!multiple`).** One prop overriding both
directions: single stays open when false, multi closes when true. The
defaults preserve the sheets (single closes, multi stays).

**`onHighlightChange(option | null)`.** A single exit for the highlight —
every `setActiveIndex` site routes through `setHighlight`, so keyboard,
pointer, search and list-change resets all report. A preview pane's hook.

**`clearIcon` + `clearLabel`.** The clear button's mark and accessible name
are replaceable; the XCircle on the size ramp stays the default. Follows
the copy-prop pattern (`noResultsAction`, `resetLabel`).

Small, sheet-compatible behaviours mirrored from the references:

**`allowDeselect` (default true, Mantine).** Re-choosing the chosen single
option clears it; `false` keeps the value. The panel closes either way.

**`hideSelectedOptions` (rs/MUI/Mantine).** Chosen options leave the list.
Applied to `visible` and the search's next-visible so the highlight never
points at a removed row; the length-change reset keeps it consistent.

**Backspace drops the last chip (rs `backspaceRemovesValue`).** From the
search field with an empty query, or from the trigger itself. Typing text
keeps Backspace for editing.

**`autoSelectOnBlur` (Mantine) + `tabSelectsValue` (rs).** The blur commit
is single-select only, skips when focus stays inside the panel (a pointer
moving to a row still chooses through the click), and skips the blur an
Escape-close causes — tracked with a consumed-on-blur ref. Tab commits the
highlight without hijacking focus movement.

**Escape semantics.** Escape with a query clears the search and holds the
panel (the dismissal listener never sees the key); Escape without one
closes as before.

**`openOnFocus` (default false) + `openMenuOnClick` (default true).**
Focus-opens for callers that want it; click-to-toggle can be disabled so
`open` alone drives the panel, threaded through a new `openOnTriggerClick`
option on `usePopover`.

## Phase 6 — paginated backend lists — DONE

The paginated scenario, after the review:

**Selection persistence needs nothing.** The selection is a value list,
independent of the rendered options; a chosen row from page 1 stays chosen when
page 2 renders, and the 5.1 fallback chips make page-1 choices visible while
their page is the one not loaded. The consumer's rule: accumulate pages in
`options` — replacing options with only the current page degrades chosen rows
to raw-value chips, visibly.

**`onLoadMore` + `hasMore`.** A sentinel (`data-slot="load-more"`, a 1px row at
the list's bottom) is observed inside the panel's own scroll region, so one
mechanism covers mouse scroll and keyboard users (floating-ui scrolls the
highlighted row into view, which brings the sentinel up). No dependency list —
every render reconnects against the latest nodes; while a page is in flight the
sentinel is gone, so the asks cannot double-fire; `hasMore: false` stops the
asks. The environment guard keeps jsdom (no IntersectionObserver) inert.

**Loading placement refined.** `loading` with an empty list is the first-load
row as before; `loading` with rows loaded keeps the list up and appends the
loading row as a sentinel underneath — the loaded options stay up while the
next page fetches.

**`onSelectAll` / `onReset`.** Overrides for the built-in footer buttons: a
backend trigger selecting every matching row (most never fetched) or clearing
the selection server-side. Left out, the client-side union and reset run as
before. A true 10,000-row select-all is a server concept — the filter
expression, not an id list — and these props hand the buttons to whichever
semantics the backend owns.

**`filter`.** `false` hands filtering to the backend (the options render as
given, whatever the field contains); a function replaces the built-in matcher
— starts-with, accents, pinyin. Without it the client matcher would
double-filter a server-filtered list.
