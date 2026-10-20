# Design references

`refs/` holds other design systems, checked out as pinned submodules. They are
material to read, not code to import. Nothing in `src/` may import from `refs/`,
and nothing under `refs/` ships in the package.

The plans in `docs/plans/` quote measurements and API shapes taken from these
repositories. The pins are the commits that were audited, so a quote stays
reproducible.

## The refs

| Ref | Pin | Licence | Read for |
| --- | --- | --- | --- |
| `react-select` | `4b69480` | MIT | Select props, menu placement, unstyled base |
| `mantine` | `edd42fa` | MIT | Combobox, Select, MultiSelect, Autocomplete, TagsInput |
| `ark` | `931f720` | MIT | Machine-driven select state, collections, focus traps |
| `mui` | `669f221` | MIT | Autocomplete, `useAutocomplete`, option shaping |
| `ant-design` | `777c552` | MIT | Select modes, `fieldNames`, filtering, empty and tag states |
| `primer` | `9d0632c` | MIT | Select panels, anchored overlays, token inputs |
| `react-spectrum` | `4693fcc` | Apache-2.0 | React Aria Components, stately and aria layers |
| `rc-overflow` | `f1c801c` | MIT | Wrap and scroll measurement for tag fields |

## Sync

A fresh clone has empty submodule directories. Fetch the ones you need:

```bash
npm run refs:sync              # all refs, sparse worktrees
npm run refs:sync -- mui ark   # named refs only
npm run refs:sync -- --full    # full worktrees, no sparse checkout
```

The script pins each ref to the commit recorded in `tool/refs.json`, then applies
the sparse pathspecs from the same file. The full worktrees total about 1.4 GB;
the sparse ones keep only the directories the plans read.

`git submodule update --init --depth 1 --filter=blob:none` fetches the objects.
Sparse patterns are local configuration, so they are applied by the script after
the checkout; `.gitmodules` cannot carry them.

## Updating a pin

Bump a ref only when a task needs a newer API. Change the `sha` in
`tool/refs.json`, run `npm run refs:sync -- <name>`, and commit the new gitlink
with a message that says why. Do not run `git submodule update --remote` as part
of routine work; it dirties eight gitlinks for no reason.
