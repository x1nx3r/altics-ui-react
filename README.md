# Altics UI

An accessible React component library with TypeScript types and a token-based theme. The packaged CSS includes all component styles, so consuming Tailwind projects do not need to scan this package.

## Install and use

```bash
npm install @altics/ui
```

```tsx
import "@altics/ui/styles.css";
import { Button, Card, Input } from "@altics/ui";

export function SignIn() {
  return (
    <Card className="p-6">
      <Input placeholder="Email" />
      <Button className="mt-4">Continue</Button>
    </Card>
  );
}
```

## Theming

The stylesheet follows the system preference by default. Add `light` or `dark` to the document root to explicitly choose a theme, or use `ThemeProvider` with `defaultTheme="light"`, `"dark"`, or `"system"`. Override semantic CSS variables such as `--color-primary` in your application stylesheet.

Available components: Button, IconButton, LinkButton, Text, Input, Textarea, TagsInput, PinInput, OtpInput, NumberInput, PasswordInput, FileInput, Field, Label, Card, Badge, Avatar, Alert, Separator, Skeleton, Spinner, Icon, Stack, Container, and Grid.

## Tailwind preset

Component styles ship compiled, but custom design tokens (`p-xxs`, `rounded-4xl`, `max-w-container-desktop`, …) only exist in your markup if your Tailwind build knows the theme. Add the preset:

```ts
// tailwind.config.ts (ESM-only)
import preset from "@altics/ui/tailwind-preset";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [preset],
};
```

Works from ESM configs (CJS `require()` is not supported — the preset ships as pure ESM). Your own `content` globs and `extend` additions compose on top — the preset deliberately ships no `content` of its own. Raw values stay available as CSS variables regardless (e.g. `style={{ padding: "var(--spacing-xxs)" }}`).

## Class overrides and your own tokens

`cn` merges Tailwind classes, so the last class of a property wins: a `className` passed to a component reliably overrides that component's own class, the same way `style` always wins over a class. It knows the design system's token scales (`gap-md`, `p-lg`, `w-5xl`, `rounded-xxs`, …).

Three routes to change something:

- **A different token value** — override the CSS variable (`--spacing-md`, `--radius-sm`) in your stylesheet. Every class that uses it follows, with no JavaScript involved.
- **A one-off value** — `style` for a raw value, or an arbitrary class (`gap-[3.5rem]`). Both merge like any other class.
- **Your own tokens, in your own components** — build your merge once, where you keep your `cn`:

```ts
// src/lib/cn.ts
import { createCn } from "@altics/ui";

// A theme-shaped map, or the names alone: createCn({ spacing: ["brand"] })
export const cn = createCn({ spacing: { brand: "3.5rem" } });
```

The library's components merge with the library's own scales, so a `className` carrying one of your token names cannot replace one of their classes — that instance has never seen the name. Use your merge in your own components; on a library component, use the default scale, an arbitrary value, or a CSS variable.

## Development and publishing

```bash
npm install
npm run dev          # playground
npm run verify       # typecheck, lint, test, build
npm run probe        # headless geometry probe (needs chromium)
npm run sheets:check # validate the tracked sheet cells
npm pack --dry-run
```

Contributor and agent notes live in `AGENTS.md`. The detailed rig is documented
in `probes/README.md`. The design references are pinned submodules, synced with
`npm run refs:sync` (see `docs/references.md`).

Storybook lives in a separate snapshot repository
(`x1nx3r/altics-ui-react-storybook`); `docs/` keeps the plans and references.

The playground and probes are development-only and excluded from npm through
the `files` allowlist. `prepublishOnly` builds the package before `npm publish`.

## How the probes work

Unit tests assert classes and behaviour. They cannot prove geometry. The probes
render the real components in Chromium and write the measurements as JSON.

```bash
npm run probe          # builds, then runs probe.html
npm run probe -- select-probe
PROBE_SKIP_BUILD=1 npm run probe   # reuse the current dist
```

`npm run probe` builds the library, starts Vite on port 5173, loads the page in
headless Chromium, and prints the page DOM, including the JSON that the page
writes into `<pre id="out">`. The page imports `@altics/ui/styles.css` and
renders one of each shape. Set `PROBE_PORT` to change the port.

| Page                    | Measures                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `probe.html`            | Input family: chips, slot markers, focus, error colors, dividers, textareas, pin/OTP cells, `cn` merges |
| `select-probe.html`     | Select bases: panel width and gap, stepping, flip, scroll containment, focus policy, disabled rows      |
| `pagination-probe.html` | Load-more: rows, chips, panel, search                                                                   |
| `index.html?page=sheet` | Sheet-parity grid, drawn with the real components                                                       |

The first three run through `npm run probe`. The sheet-parity page needs the
dev server and the CDP driver; see `probes/README.md`.

A probe reads the live DOM, not the source. The sheet cell under `sheets/` is
the other side of the comparison. `probes/tool/svg-bbox.py` reads the sheet's
exact path geometry with the same idea.

### When the sheet scale is wrong

Figma frames are often scaled, and an SVG export carries the transform. A 2x
export doubles every value. A 1.5x frame turns 8 into 12. Check the factor
against a known reference: a 16 icon, a spacing step, or a 1px border.

Then compare the cell with the library's scale: the spacing tokens in
`src/theme/tokens.css`, the width and radius ramps in
`src/theme/theme-extend.ts`, and the type ramp in
`src/components/typography/Text.tsx`. If the value falls between steps, round
to the nearest step and record the raw value, the chosen step, and the reason
in the plan. Record the token name beside the value: for spacing, 16 is `xl`,
12 is `lg`, 8 is `md`.

The target is an exact match to the chosen step, not to a raw decimal that the
frame transform produced. The probe proves the component hits it. A one-off
cell can stay a quirk, but it does not become a new rule. The sheet is
evidence. The scale is the baseline. The probe is the check.

### Why this makes agent work easier

An LLM can read a screenshot and describe it. It cannot measure it reliably.
The eye says "the gap is tight"; the probe says 13.67. That is the difference
between a guess and a match.

The agent can run one command, compare the JSON with the sheet, change one
shape, and rerun. The loop is short and the answer is unambiguous.

The probes also catch the failure that unit tests miss: the classes are right,
but the box moves. An early probe measured only the tags card and missed
doubled slot margins on the plain field. The page now renders one of each
shape, so the next run sees both.

### Why this makes the work auditable

Every geometry claim has a command and an output. A plan quotes the sheet's
value, the scale step, and the probe's value side by side. A commit or PR can
quote the same JSON. A reviewer reruns the same command on the same page and
gets the same numbers.

The page is versioned with the code. The sheet cell is tracked under `sheets/`.
The plan records both. That is the audit trail: source, measurement, decision.

The detailed rig, including the CDP sheet driver and the probe traps, is in
`probes/README.md`.

## Working on a module

One module per branch. The branch carries a plan, the implementation, and the
probe that proves it. The agent can run the commands; you own the scope, the
plan, and the final check.

### 1. Scope the module

Pick one component family, for example `Select` or the input family. Keep the
branch to that family. A change that crosses families gets its own plan.

Start the branch from the current default branch:

```bash
git switch master
git pull --ff-only
git switch -c feat/<module>
```

### 2. Export the sheet cells

In Figma, open the module's sheet page and select all of its variants. Export
them as SVG:

- Format: SVG
- Scale: 1x
- Outline text: on. `svg-bbox.py` reads paths; live text is not measured.

Figma writes one file per selected variant and keeps the variant name. It may
download a ZIP; extract it before you copy the files. Put the files under the
family folder in `sheets/`. Do not rename a value to match the code. The cells
are named from the Figma variant properties, for example
`Size=…, Type=…, Destructive=…, State=…`:

```
sheets/input/input/Size=md, Type=Default, Destructive=False, State=Focused.svg
```

If Figma MCP is available, ask the agent to export the selected variants into
`sheets/<family>/` and run `npm run sheets:check`. Review the names and the
count.

Check the names, then read the exact geometry:

```bash
npm run sheets:check
python3 probes/tool/svg-bbox.py "sheets/input/input/Size=md, Type=Default, Destructive=False, State=Focused.svg"
```

`getBBox` is more reliable than a pixel scan. Anti-aliasing confounds small
text, and curve control points overstate a path's extent.

### 3. Sync the references

Sync only the refs the module needs:

```bash
npm run refs:sync -- mui mantine react-select
```

The worktree is sparse, but the history is complete. `refs/` is material to
read; nothing in `src/` imports from it. If you need a path outside the sparse
set, add it with `git -C refs/<name> sparse-checkout add <path>`.

### 4. Explore the references and write the plan

The plan is the contract. Write it before the component. The agent's job in this
phase is exploration: read the refs, trace the behavior, and bring back
evidence. Your job is to decide.

Read `refs/<name>/` for API shape, edge cases, and focus behaviour. Use
`git -C refs/<name> log` to find the commit behind a behavior. The agent can
read several refs in parallel and bring back the comparison, with citations.

Copy the template from `docs/plans/README.md` into `docs/plans/<module>.md`.
`docs/plans/select.md` is the model: it records the sheet matrix, the base
components, the dependency decision, the rejected alternatives, and the order
of work.

Answer these questions in the plan:

**What behavior do we want?** List the states and the paths, not adjectives.
For a select: open, close, focus return, outside press, Escape, Tab, typeahead,
Up/Down/Home/End, PageUp/PageDown, disabled options, empty list, long list,
controlled and uncontrolled value, form reset, SSR, reduced motion. For each,
say what the sheet draws and what the reference does.

Ask for the smallest behavior set that satisfies the sheet, not the union of
every reference. A feature that no cell draws is a decision, not a default.

**What does each reference do?** Use a table:

| Ref | Pin | What it does | We take | We reject | Why |
| --- | --- | --- | --- | --- | --- |

Cite the file and the test. The pin is in `docs/references.md`; if the behavior
came from an older commit, cite that commit too. A claim without a path is a
guess.

**What do we reject?** Rejection is a decision, not a taste. Name the reason:
the ref's DOM assumes its own CSS, its API leaks a provider, its accessibility
pattern fights `Field`, its behavior is not in the sheet, its bundle cost is too
high, or its pattern is dated. Record what the rejection costs.

**What do we rectify?** A rectification is a deliberate difference from the
reference: the sheet measures another value, the house pattern composes
differently, or the ref has a defect we will not copy. Record the ref's value,
our value, and the reason. The sheet is the tie-breaker.

The same applies when the sheet is off-scale. A sheet that is off-scale is a
rectification too. Figma frames are often scaled, so a raw decimal is not
automatically the target. Record the raw value, the scale step, and why.

**Why this package?** A reference and a dependency are different decisions.
`refs/` is read-only material; nothing in `src/` imports it. A runtime package
earns its place only when it owns a hard, tested surface we should not rebuild,
such as positioning, focus, or virtualisation. Record the license, the bundle
cost, the API lock-in, and what we rejected. `@floating-ui/react` in the select
plan is the example: it earns its place for flip/shift/collision, a portal,
dismiss, and focus return; a bespoke positioner would be a second source of
truth. For each package, say why we add it and why we do not write it. For each
reference, say why we read it and why we do not depend on it.

**What are the open questions?** Put the question, the owner, and what it
blocks. A plan with no open questions is usually a plan that did not look.

**What is out of scope?** Say it. A plan that lists everything ships nothing.

**How do we know it is done?** List the tests, the probe pages, the sheet cells,
and the accessibility checks.

The agent can read the refs faster than you can. Ask it for a comparison, not a
verdict:

> Read `refs/mui` and `refs/mantine` for the combobox open and focus behavior.
> Cite the file and the test for each claim. Tell me where they disagree, what
> the sheet draws, and which questions need my decision. Do not write code yet.

Review the evidence, make the call, and record it in the plan. If a finding
changes the scope, update the plan before the code. Implementation that is not
in the plan is out of scope.

### 5. Implement

Work on the branch. Keep the component, its tests, and its exports together.
Run the gate as the work moves:

```bash
npm run verify
```

Unit tests assert classes and behaviour. They do not prove geometry.

### 6. Verify with the probes

Run the page that renders the module:

```bash
npm run probe
npm run probe -- select-probe
```

`npm run probe` rebuilds the library first. Set `PROBE_SKIP_BUILD=1` to reuse
the current `dist`.

The page writes the measurements as JSON. Compare each number with the sheet,
then record both in the plan.

If the module has no page, add one under `probes/src/pages/` and list it in
`probes/README.md`. The page must import `@altics/ui/styles.css` and render one
of each shape. A probe that measures one shape hides defects in the others.

For a sheet-parity grid, add the module to `probes/src/pages/SheetParity.tsx`
and open `index.html?page=sheet`.

For canvas work, drive the sheet over CDP:

```bash
npm run dev -- --port 5173 --strictPort
chromium --remote-debugging-port=9223 "http://localhost:5173/?page=sheet"
npm run probe:cdp
```

The agent runs the probe. Repeat it yourself before you approve the result.

### 7. Close the plan and open a PR

Set the plan to `Status: done`, mark what you deferred, and commit. Use
Conventional Commits, one logical change per commit.

```bash
git push -u origin <branch>
gh pr create --repo dionisius77/altics-ui-react --base master \
  --head <you>:<branch>
```

Replace `<you>` with your fork owner. The PR body links the plan and quotes the
probe output. The reviewer repeats the probe step. The diff alone is not the
review.

### Checklist

- [ ] The plan records every sheet measurement and the probe's value.
- [ ] The cells are under `sheets/` and `npm run sheets:check` passes.
- [ ] `npm run verify` passes.
- [ ] The probe renders one of each shape and matches the sheet.
- [ ] Nothing in `src/` imports from `refs/`.
- [ ] The PR links the plan and quotes the probe output.
