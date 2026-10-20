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

## Header

Start a plan with:

```md
# Plan: <what changes>

Status: active | done | dropped
Opened: YYYY-MM-DD
Last updated: YYYY-MM-DD
Owner: <name>
Related: links to plans, sheets, refs

## Goal
...
```

## Lifecycle

- A plan is **living while active**. Edit it as the work moves.
- Record a finding as a measured value, with the sheet's value beside ours.
  A number that did not come from `probes/` or the sheet does not belong here.
- Mark items `DONE` when they land. Record what was deferred and why.
- When the work closes, set `Status: done` and freeze the body. Put corrections
  in a new plan or a dated `## Addendum` section.
- Link the plan from the commit that closes it.

## Conventions

- One plan per component family or cross-cutting change, not per ticket.
- Keep sheet paths as they are; the sheets themselves are local-only.
- Plans may quote upstream APIs. The pins live in `docs/references.md`.
