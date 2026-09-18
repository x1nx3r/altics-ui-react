import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes } from "react";
import { PopoverPanel, usePopover, type PopoverRole } from "../src/components/popover";
import { testPlatform } from "./floating";

/** A trigger and a panel, the way the select will wire them. */
function Harness({
  defaultOpen = false,
  disabled,
  role,
  open,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  disabled?: boolean;
  role?: PopoverRole;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const popover = usePopover({ defaultOpen, disabled, role, open, onOpenChange, platform: testPlatform });
  return (
    <>
      <button
        ref={popover.refs.setReference as never}
        {...(popover.getReferenceProps() as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        Open
      </button>
      <PopoverPanel popover={popover} role={role} className="panel">
        <span>Panel</span>
      </PopoverPanel>
    </>
  );
}

describe("Popover", () => {
  it("renders nothing until the trigger opens it, then portals the panel", () => {
    const { container } = render(<Harness />);
    expect(screen.queryByText("Panel")).toBeNull();

    fireEvent.click(screen.getByText("Open"));

    const panel = document.querySelector('[data-slot="popover"]')!;
    expect(panel).not.toBeNull();
    expect(panel.getAttribute("data-state")).toBe("open");
    expect(panel.className).toBe("panel");
    // left the render tree for a portal on the body
    expect(container.contains(panel)).toBe(false);
  });

  it("toggles with a click on the trigger", () => {
    render(<Harness />);
    const trigger = screen.getByText("Open");
    fireEvent.click(trigger);
    expect(screen.queryByText("Panel")).not.toBeNull();
    fireEvent.click(trigger);
    expect(screen.queryByText("Panel")).toBeNull();
  });

  it("closes on Escape", () => {
    render(<Harness defaultOpen />);
    expect(screen.queryByText("Panel")).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Panel")).toBeNull();
  });

  it("takes the open state from the caller when controlled", () => {
    const onOpenChange = vi.fn();
    render(<Harness open onOpenChange={onOpenChange} />);
    expect(screen.queryByText("Panel")).not.toBeNull();

    // the click reports, but the panel stays open: the caller owns the state
    fireEvent.click(screen.getByText("Open"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText("Panel")).not.toBeNull();
  });

  it("leaves the trigger inert when disabled", () => {
    render(<Harness disabled />);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.queryByText("Panel")).toBeNull();
  });

  it("announces the panel's role and wires the trigger to it", () => {
    render(<Harness defaultOpen role="listbox" />);
    const panel = document.querySelector('[data-slot="popover"]')!;
    expect(panel.getAttribute("role")).toBe("listbox");

    const trigger = screen.getByText("Open");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
  });
});
