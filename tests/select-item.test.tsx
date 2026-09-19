import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SelectItem, type SelectItemProps } from "../src";

const renderItem = (props: Partial<SelectItemProps> = {}) =>
  render(<SelectItem id="row-0" label="Indonesia" {...props} />);

const row = () => screen.getByRole("option");

describe("SelectItem", () => {
  it("carries the option role and its state", () => {
    const { container } = renderItem({ selected: true, disabled: true });
    expect(row().getAttribute("aria-selected")).toBe("true");
    expect(row().getAttribute("aria-disabled")).toBe("true");
    expect(container.querySelector('[data-slot="listbox-option"]')).not.toBeNull();
    expect(row().getAttribute("data-selected")).toBe("true");
    expect(row().getAttribute("data-disabled")).toBe("true");
  });

  it("reads the label and the description", () => {
    renderItem({ description: "id" });
    expect(row().textContent).toContain("Indonesia");
    expect(row().textContent).toContain("id");
  });

  it("trails a check when chosen, and leads a checkbox when asked", () => {
    const single = renderItem({ selected: true });
    expect(single.container.querySelector("svg")).not.toBeNull();

    const multiple = renderItem({ checkbox: true, selected: true });
    // the checkbox is the row's first element, and carries the mark
    const checkbox = multiple.container.querySelector('[role="option"]')!.firstElementChild!;
    expect(checkbox.getAttribute("aria-hidden")).toBe("true");
    expect(checkbox.className).toContain("bg-primary");
    expect(multiple.container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("leaves an unchecked checkbox empty", () => {
    const { container } = renderItem({ checkbox: true });
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector('[role="option"]')!.firstElementChild!.className).toContain(
      "border-neutral-300",
    );
  });

  it("draws the leading adornment", () => {
    const { container } = renderItem({ leading: <span data-testid="dot" /> });
    expect(container.querySelector('[data-testid="dot"]')).not.toBeNull();
  });

  it("follows the field ramp", () => {
    const sm = renderItem({ size: "sm" });
    expect(sm.container.querySelector('[role="option"]')!.className).toContain("h-9");
    const lg = renderItem({ size: "lg" });
    expect(lg.container.querySelector('[role="option"]')!.className).toContain("h-11");
  });

  it("chooses on click and follows the pointer", () => {
    const onChoose = vi.fn();
    const onActivate = vi.fn();
    renderItem({ onChoose, onActivate });

    fireEvent.click(row());
    fireEvent.mouseMove(row());
    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("refuses a disabled row", () => {
    const onChoose = vi.fn();
    const onActivate = vi.fn();
    renderItem({ onChoose, onActivate, disabled: true });

    fireEvent.click(row());
    fireEvent.mouseMove(row());
    expect(onChoose).not.toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
    expect(row().getAttribute("aria-disabled")).toBe("true");
  });
});
