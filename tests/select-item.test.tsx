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

  it("follows the field ramp at every size, as the sheets draw it", () => {
    // Figma: the row takes the field's own ramp — 36, 40 and 44, with a 14px
    // label at sm and 16 above — insets 4 at sm and 6 above, and pads the label
    // 8 from its edge. The check is a 16 icon up to md (12 × 8.67 of ink) and a
    // 20 at lg (15 × 10.83).
    const has = (el: HTMLElement, cls: string) => el.className.split(/\s+/).includes(cls);
    const at = (size: SelectItemProps["size"]) =>
      renderItem({ size, selected: true }).container.querySelector<HTMLElement>('[role="option"]')!;

    const sm = at("sm");
    expect(has(sm, "h-9")).toBe(true);
    expect(has(sm, "text-sm")).toBe(true);
    expect(has(sm, "mx-1")).toBe(true);
    expect(has(sm, "pl-2")).toBe(true);
    expect(has(sm, "gap-2")).toBe(true);
    expect(sm.querySelector("svg")!.getAttribute("width")).toBe("16");

    const md = at("md");
    expect(has(md, "h-10")).toBe(true);
    expect(has(md, "text-base")).toBe(true);
    expect(has(md, "mx-1.5")).toBe(true);
    expect(md.querySelector("svg")!.getAttribute("width")).toBe("16");

    const lg = at("lg");
    expect(has(lg, "h-11")).toBe(true);
    expect(has(lg, "text-base")).toBe(true);
    expect(has(lg, "mx-1.5")).toBe(true);
    expect(lg.querySelector("svg")!.getAttribute("width")).toBe("20");
  });

  it("grows the checkbox at lg", () => {
    const boxOf = (c: HTMLElement) => c.querySelector('[role="option"]')!.firstElementChild as HTMLElement;
    expect(boxOf(renderItem({ checkbox: true }).container).className).toContain("h-[15px]");
    expect(boxOf(renderItem({ checkbox: true, size: "lg" }).container).className).toContain(
      "h-[19px]",
    );
  });

  it("keeps the label beside its adornment, not at the far edge", () => {
    // `justify-between` alone pushes the label of an unchosen row to the end,
    // so the adornment and the label travel in one group.
    const { container } = renderItem({ leading: <span data-testid="dot" /> });
    const group = container.querySelector('[role="option"]')!.firstElementChild as HTMLElement;
    expect(group.querySelector('[data-testid="dot"]')).not.toBeNull();
    expect(group.textContent).toContain("Indonesia");
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
