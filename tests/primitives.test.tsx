import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListboxOption, PopoverPanel, usePopover } from "../src";

/** A consumer's mini-menu, built only from the published primitives. */
function MiniMenu() {
  const popover = usePopover({ open: true, role: "menu" });
  return (
    <div>
      <button type="button" ref={popover.refs.setReference} {...popover.getReferenceProps()}>
        Actions
      </button>
      <PopoverPanel popover={popover} className="min-w-40">
        <ListboxOption id="menu-rename" role="menuitem" onChoose={() => {}}>
          Rename
        </ListboxOption>
        <ListboxOption id="menu-delete" role="menuitem" disabled>
          Delete
        </ListboxOption>
      </PopoverPanel>
    </div>
  );
}

describe("the floating primitives", () => {
  it("are exported and compose into a working popover", () => {
    render(<MiniMenu />);
    expect(screen.getByRole("button", { name: "Actions" })).toBeDefined();
    expect(screen.getByRole("menu")).toBeDefined();
    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeDefined();
    expect(screen.getByRole("menuitem", { name: "Delete" }).getAttribute("aria-disabled")).toBe(
      "true",
    );
  });
});
