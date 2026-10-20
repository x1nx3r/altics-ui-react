# Plan: input family from the Figma sheets

Status: active (phase 5 next, phase 6 deferred to its own plans)
Opened: 2026-09-15
Last updated: 2026-09-15
Owner: x1nx3r
Related: `docs/plans/input-base.md`, sheets at `sheets/input/`, upstream PR #3 (vito), pending colour-token revision

## Goal

Cover all 14 Figma input types without turning `Input` into a config object.
`Input` keeps its 6 props; everything else arrives as a neighbour.

## Naming decision (agreed)

Split by role so each directory name signifies what it holds.

```
src/components/input/
  Input.tsx            base box
  PasswordInput.tsx
  NumberInput.tsx
  FileInput.tsx
  OtpInput.tsx
  TagsInput.tsx        (future)
  Textarea.tsx
  InputDivider.tsx
  index.ts

src/components/field/
  Field.tsx            label + control + hint/error (takes children)
  Label.tsx
  index.ts
```

Why:

- `input/` is a family anchored by `Input`, the same shape as `button/` (Button plus IconButton/LinkButton).
  It does not promise `Input.*` children, which was the objection to `input/` as a namespace.
- `field/` holds exactly the field concept (Field plus its Label). Chakra v3 names the same pair `field/`.
- Dependencies stay one-directional: `Field` clones `children` and never imports a control, so `field/`
  has no import from `input/` and no composite needs `field/`.
- Public API is unaffected: `src/index.ts` re-exports flat, so consumers still write
  `import { Field, Input, PasswordInput } from "@altics/ui"`. Directory layout stays internal.

Rule to document: a component directory is named after the family's anchor component or its concept,
in singular form, and may contain siblings.

## Scope split

| Bucket | Types | Deliverable |
| --- | --- | --- |
| Compositions | Default, Leading text, Leading dropdown, Trailing button, Trailing dropdown, Password | recipes + demo coverage (no new API) |
| New primitive | — | `InputDivider` |
| Composites | Password, Number counter (h/v), File upload | 3 components |
| Recipes only | Date and time, Payment input | docs + demo |
| Out of scope | OTP, Tags inner, Tags outer | separate components, own plan |

Counts from the sheets: 14 types x 3 sizes x 7 states = 294 files.
Seven states = Destructive=False (4) + Destructive=True (3); there is no Destructive+Disabled.

Box geometry notes taken from the sheets:

- All 14 types share the same box chrome: 3 sizes (36/40/44px), 4 border states.
- Tags inner/outer use a wider box (402px vs 322px) — different component.
- Number counter h/v use a narrower box (242px vs 322px) — steppers own trailing space.
- File upload splits the box at x = 241 with a full-height divider.
- Payment input has an inner bordered chip (x 10.5–57.5, stroke `#E5E5E5`) holding a brand mark.
- Date and time has a trailing calendar icon (`#A3A3A3`).

---

## Phase 0 — unblock (blocking)

- Rebase `feat/input-blocks` onto `upstream/master` after PR #3 merges.
  The `form.tsx` conflict resolves as "we delete it, port his `focus-ring` intent".
- Decide the divider colour strategy (see Decisions).

## Phase 0b — directory move

Files: create `src/components/input/` and `src/components/field/`, move `Input.tsx`, `Textarea.tsx`,
`PasswordInput.tsx` (later), `Field.tsx`, `Label.tsx`, update both barrels and the one import path in
`src/index.ts`, delete `src/components/form/`.

- Independent of PR #3 except `src/index.ts` (one line) and the legacy `src/components/form.tsx`
  (already deleted on this branch). Both conflicts are trivial.
- Accept: `typecheck`, `lint`, `test`, `build` unchanged; the public import surface is byte-identical.

## Phase 1 — `InputDivider`

Files: `src/components/form/InputDivider.tsx`, refactor `Input.tsx`, `src/components/form/index.ts`, `src/index.ts`.

- API: `<InputDivider className? />` renders `aria-hidden` `h-full w-px shrink-0`, inheriting the border colour token.
- `Input`'s two existing dividers become calls to it, removing the duplicated markup.
- Accept: existing 19 tests pass; divider geometry unchanged (40px box -> 38px divider, 1px each side).

## Phase 2 — `PasswordInput`

Files: `PasswordInput.tsx`, barrel, tests, demo.

- Wraps `Input`; owns only the trailing toggle.
- Props extend `InputProps` with `defaultVisible` / `visible` / `onVisibleChange`.
- Toggling swaps `type` between `password` and `text`; toggle carries `aria-pressed` and a stable label.
- Accept: masked by default; toggle flips type; `aria-pressed` tracks state; keyboard toggleable.

## Phase 3 — `NumberInput`

Files: `NumberInput.tsx`, tests, demo.

- One component, `orientation: "horizontal" | "vertical"`.
- `value` / `defaultValue` / `onValueChange`, `min`, `max`, `step`, `disabled`, `readOnly`.
- Renders `Input` with the stepper cluster as `trailing`, preceded by an `InputDivider`.
- `inputMode="decimal"`, ArrowUp/ArrowDown step, clamp on blur. Hold-to-repeat optional, can defer.
- Accept: steppers and keyboard both step and clamp; `disabled`/`readOnly` block both; box stays 40px at `md`.

## Phase 4 — `FileInput`

Files: `FileInput.tsx`, tests, demo.

- Structure: visually-hidden `<input type="file">` outside the box, `Input` in read-only display mode,
  trailing cluster `[icon] [divider] [spinner?] [help] [Browse]`.
- Props: `accept`, `multiple`, `onFilesChange`, `loading`, `disabled`, `onHelpClick`, `placeholder`.
- Behaviour: Browse opens the picker; filename shows after selection; `loading` swaps the icon for
  `Spinner` and disables Browse; `disabled` blocks everything.
- a11y: label association, file name announced, spinner labelled, help button labelled, divider `aria-hidden`.
- Accept: picking a file updates the display; disabled/loading block Browse; focus semantics match the
  chosen option in Decisions.

## Phase 5 — recipes + coverage

- Demo page: one card per Group-1 composition, plus Date and Payment recipes, plus the three composites.
- README section with copy-paste snippets for Date (`type="date"` + trailing icon) and Payment
  (leading element carrying its own border).

## Phase 6 — deferred

`OtpInput` and `TagsInput` get their own plan. They change box geometry or field count, so they share the
visual language, not the primitive.

---

## Verification per phase

- `npm run typecheck`
- `npm run lint` (must stay at the single pre-existing `Text.tsx` error)
- `npm test`
- `npm run build` and the probes build
- CDP probe for geometry in light and dark

## Risks

- Colour churn: the pending colour revision will change every border/divider token.
  Mitigation: keep field chrome in one place (`InputDivider` + a class map in `Input.tsx`) so the swap is one edit.
- PR #3 rebase may break demos (`Button` loses `loading`, `form.tsx` edited).
- Focus model: the sheet rings only the text region for focused file upload and drops the divider; ours rings
  the whole box. Decide before Phase 4.

## Status

| Phase | State |
| --- | --- |
| 0 — rebase on the merged upstream work | done |
| 0b — directory move (`input/` + `field/`) | done |
| 1 — `InputDivider` | done |
| 2 — `PasswordInput` | done |
| 3 — `NumberInput` (both orientations) | done |
| 4 — `FileInput` | done |
| 5 — recipes + coverage | next |
| 6 — `OtpInput`, `TagsInput` | deferred, own plans |

Also landed while doing the above: field chrome aligned to the sheets (borders, focus, placeholder,
affix colours, divider), `textAlign` on `Input`, an attached-panel slot, and a guard test that fails
when a class names a token that is unreachable from its Tailwind namespace.

## Decisions needed

1. Divider colour. **Resolved:** neutral-300 (`#D4D4D4`), which the sheets specify, now that the
   palette exists as utilities.
2. File upload focus. **Resolved:** the whole field shows the outline (box-level `focus-within`),
   rather than the sheet's value-area-only ring, so the action never lacks a focus indicator.
   Noted in the component docstring.
3. Where do composites live? **Resolved:** `src/components/input/` for controls, `src/components/field/`
   for `Field` and `Label` (see "Naming decision").
