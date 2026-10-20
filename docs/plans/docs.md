# Plan: Storybook coverage

Status: dropped (the app moved to x1nx3r/altics-ui-react-storybook)
Opened: 2026-09-21
Last updated: 2026-10-20
Owner: x1nx3r
Related: `docs/plans/input-base.md`, `probes/`,
`x1nx3r/altics-ui-react-storybook`

> The Storybook app and stories were removed from this repository. Storybook is
> maintained separately in `x1nx3r/altics-ui-react-storybook`. This plan stays
> as the record of the coverage work done here.

Goal: every component in the library gets a Storybook page — the generated props
table (autodocs), stories that carry the sheet-parity rows, and narrative MDX
for what a table cannot say. The pattern-setters are `Input.stories.tsx` and
`PinInput.stories.tsx`; everything else follows their shape.

## Where the material comes from

- The showcase rows in `probes/src/pages/InputShowcase.tsx` are the source
  for the input family's stories — port nearly verbatim, titles carrying the
  measured values.
- `src/components/*/*.examples.tsx` (Button, IconButton, LinkButton, Text) port
  to CSF mechanically.
- The measured numbers live in `docs/plans/input-base.md`; they become the
  MDX callouts.

## Wave 0 — infrastructure — DONE

1. Light/dark toolbar: a `globalTypes` toggle. The story decorator paints the
   canvas ground from the theme's own token (`hsl(var(--color-background))`),
   so a dark story sits on a dark field; the autodocs page reads the same
   global off the ambient docs context and themes its chrome with
   `themes.light` / `themes.dark` (`AutodocsPage`). Preview hooks are illegal
   inside a docs page — the global comes from `React.useContext(DocsContext)`.
2. `stories/kit.tsx`: the `chip()` helper (now living in Input.stories), a
   sizes-sweep render helper, and the `Row` title convention
   ("sheet parity — …").
3. Title scheme: `Inputs/`, `Fields/`, `Buttons/`, `Typography/`, `Display/`,
   `Layout/`.

## Wave 1 — the input family (fresh, measured)

4. `Textarea.stories` — sizes (128 md / 110 sm, both minimums), `rows` opt-out,
   long content scrolling inside the sheet height, stretched row, error +
   disabled, `resize`.
5. `TagsInput.stories` — sheet parity (Design + Marketing at md/sm/lg), chips
   below, multiline inside and below, `maxTags`, error + disabled, overflow
   wrap/scroll with many tags (the public face of the chips).
6. `OtpInput.stories` — four cells, the field-ramp sizes row, six cells +
   error/disabled.
7. `Field.stories` (+ Label) — the assembly (label, required, hint, error), the
   hint-replaced-by-error swap, disabled. The dev warning is prose in MDX, not
   a story.
8. `InputDivider` — no page of its own: a divider story on Input's page
   (divided affixes, focus stopping at the rule) plus a note.
9. `PasswordInput`, `NumberInput`, `FileInput` — ports of their showcase rows
   (visibility toggle; horizontal and vertical steppers with sizes; browse,
   loading, help, disabled).

## Wave 2 — port the existing examples — DONE

10. `Button`, `IconButton`, `LinkButton` from the button examples files.
11. `Text` from `typography/Text.examples.tsx`.
12. Display: `Alert`, `Avatar`, `Badge`, `Separator`, `Skeleton`, `Spinner`;
    `Card`; layout: `Container`, `Stack`; `Icon` (point at the generator).

The four components with examples files got a Gallery story rendering the
existing `*.examples.tsx` whole (single-sourced, the playground keeps
working) beside an interactive Default with controls. Display and layout
components got discrete stories. Verified: 48 buttons in the Button gallery,
badge variants, icon grid, card content all render.

## Wave 3 — narrative MDX — DROPPED

Decided against: the measured numbers stay where they already live — in the
docstrings (which autodocs renders) and in `docs/plans/input-base.md` —
rather than being duplicated into narrative pages. The docs answer "what is
it and how do I use it"; the plan file keeps the sheet archaeology.

## Wave 4 — polish (optional)

16. The a11y addon runs on `todo` — triage what it reports per component.
17. Controls pass: argTypes where the generated ones mislead (`error`
    string|boolean, `divider` object, `textAlign`).
18. Graduation call: stories move beside the components, `docs/` gets its own
    home. Until then everything in here stays gitignored — no commits. (Superseded:
    the app moved to `x1nx3r/altics-ui-react-storybook`; this repo keeps the plan.)

## Constraints

- Stories import from `../../src` (source, live HMR), never from `dist` —
  `docs/` is a dev workbench, not a consumer; `probes/` already covers
  the built-artifact path.
- Story styles come from `docs/docs.css` (a copy of the source stylesheet's
  three lines): Vite picks the PostCSS config by the CSS file's location, so
  importing `src/styles/index.css` directly ran the ROOT tailwind config,
  whose content scans only `./src` — the stories' own utilities were
  silently dropped.
- Every value in a title or callout is measured from the sheets, not guessed.
- One autodocs tag per component; render stories for sweeps, args stories for
  interactive single states.
- Docstrings keep the house `@example` style — bare JSX after the tag. The
  docs render descriptions as markdown, which strips bare JSX as unknown
  HTML, so `AutodocsPage` (docs/.storybook) fences each example body at
  render time. Never fence examples in the source; the transform lives in
  one file on the docs side.
