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
  return <Card className="p-6"><Input placeholder="Email" /><Button className="mt-4">Continue</Button></Card>;
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
render the real components in Chromium and print the measurements as JSON.

```bash
npm run probe          # builds, then runs probe.html
npm run probe -- select-probe
PROBE_SKIP_BUILD=1 npm run probe   # reuse the current dist
```

`npm run probe` builds the library, starts Vite on port 5173, loads the page in
headless Chromium, and prints the page DOM, including the JSON that the page
writes into `<pre id="out">`. The page imports `@altics/ui/styles.css` and
renders one of each shape. Set `PROBE_PORT` to change the port.

| Page | Measures |
| --- | --- |
| `probe.html` | Input family: chips, slot markers, focus, error colors, dividers, textareas, pin/OTP cells, `cn` merges |
| `select-probe.html` | Select bases: panel width and gap, stepping, flip, scroll containment, focus policy, disabled rows |
| `pagination-probe.html` | Load-more: rows, chips, panel, search |
| `index.html?page=sheet` | Sheet-parity grid, drawn with the real components |

The first three run through `npm run probe`. The sheet-parity page needs the
dev server and the CDP driver; see `probes/README.md`.

A probe reads the live DOM, not the source. The sheet cell under `sheets/` is
the other side of the comparison. `probes/tool/svg-bbox.py` reads the sheet's
exact path geometry with the same idea.

### Why this makes agent work easier

The agent gets a number, not an opinion. It can run one command, compare the
JSON with the sheet, change one shape, and rerun. The loop is short and the
answer is unambiguous.

The probes also catch the failure that unit tests miss: the classes are right,
but the box moves. An early probe measured only the tags card and missed
doubled slot margins on the plain field. The page now renders one of each
shape, so the next run sees both.

### Why this makes the work auditable

Every geometry claim has a command and an output. A plan quotes the sheet's
value and the probe's value side by side. A commit or PR can quote the same
JSON. A reviewer reruns the same command on the same page and gets the same
numbers.

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

Export the module's cells from Figma as SVG into `sheets/`, under the family
folder. Keep the Figma layer name; the cells are named
`Size=…, Type=…, Destructive=…, State=…`:

```
sheets/input/input/Size=md, Type=Default, Destructive=False, State=Focused.svg
```

Check the names, then read the exact geometry:

```bash
npm run sheets:check
python3 probes/tool/svg-bbox.py "sheets/input/input/Size=md, Type=Default, Destructive=False, State=Focused.svg"
```

`getBBox` is more reliable than a pixel scan. Anti-aliasing confounds small
text, and curve control points overstate a path's extent.

### 3. Read the references

Sync only the refs the module needs:

```bash
npm run refs:sync -- mui mantine react-select
```

Read `refs/<name>/` for API shape, edge cases, and focus behaviour. The refs are
material to read. Nothing in `src/` imports from them.

### 4. Discuss and write the plan

Copy the header from `docs/plans/README.md` into `docs/plans/<module>.md`.
Record:

- the sheet measurements, with the sheet's value beside ours;
- what each reference does, and why we follow or reject it;
- the decisions and the open questions.

Discuss the plan with the agent before implementation. The plan is the contract.

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

The probe prints JSON. Compare each number with the sheet, then record both in
the plan.

If the module has no page, add one under `probes/src/pages/` and list it in
`probes/README.md`. The page must import `@altics/ui/styles.css` and render one
of each shape. A probe that measures one shape hides defects in the others.

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
