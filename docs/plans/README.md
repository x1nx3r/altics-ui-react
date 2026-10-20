# Plans

Each plan is the paper trail for a component or a cross-cutting change: what we
set out to do, what the sheets measured, what we built, and what we deferred.

`AGENTS.md` is the entry point. This directory is the record.

## Index

| Plan | Status | Scope |
| --- | --- | --- |
| [input-base](input-base.md) | done, item 6 deferred | Base `Input` geometry and `Field` wiring |
| [input-family](input-family.md) | active, phase 5 next | `PasswordInput`, `NumberInput`, `FileInput`, dividers |
| [select](select.md) | done | `Select`, `MultiSelect`, `SelectItem`, panels, sheet parity |
| [flexibility](flexibility.md) | active, phase 5 | Configure, restyle, compose; backend lists |
| [docs](docs.md) | dropped, app moved out | Storybook coverage and autodocs |

## Template

Start a plan with:

```md
# Plan: <what changes>

Status: active | done | dropped
Opened: YYYY-MM-DD
Last updated: YYYY-MM-DD
Owner: <name>
Related: links to plans, sheets, refs

## Goal
What changes, and why.

## Behavior
States, keyboard paths, focus, ARIA, controlled and uncontrolled modes, edge
cases. Say what the sheet draws and what each reference does.

## The sheets
Cells, matrix, measured values. The sheet's value beside ours. If the sheet
scale is off, record the raw value, the scale step, and why.

## Reference survey
| Ref | Pin | What it does | We take | We reject | Why |
| --- | --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... | ... |

Cite the file and the test. The pin is in `docs/references.md`.

## Decisions
API, DOM, state ownership, composition.

## Rectifications
Where we depart from a reference, the reference's value, our value, and why.
The sheet is the tie-breaker.

## Dependencies
Why a runtime package earns its place, what we rejected, and why each reference
stays a reference.

## Open questions
Question, owner, what it blocks.

## Out of scope
...

## Order of work
...

## Verification
Tests, probe pages, sheet cells, accessibility checks.
```

Use the sections that fit. A small plan can merge them, but the questions must
be answered somewhere. `select.md` is the model.

## Lifecycle

- A plan is **living while active**. Edit it as the work moves.
- Record a finding as a measured value, with the sheet's value beside ours.
  A number that did not come from `probes/`, the sheet, or the library's scale
  does not belong here. If the sheet is off-scale, record the raw value, the
  scale step, and why.
- Mark items `DONE` when they land. Record what was deferred and why.
- When the work closes, set `Status: done` and freeze the body. Put corrections
  in a new plan or a dated `## Addendum` section.
- Link the plan from the commit that closes it.

## Conventions

- One plan per component family or cross-cutting change, not per ticket.
- Cite sheet cells by their path under `sheets/`. The PDF boards under
  `sheets/reference/` are local-only.
- The exports moved from `❖ Design System Altics 2.0(3)/` to `sheets/` on
  2026-10-20; plan paths use the new location.
- Plans may quote upstream APIs. The pins live in `docs/references.md`.
