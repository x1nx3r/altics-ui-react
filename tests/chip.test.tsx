import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Chip } from "../src";

const chipOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="tag"]')!;

describe("Chip", () => {
  it("insets a bare label 10 and an adornment 4, as the sheets draw it", () => {
    const bare = render(<Chip label="Design" />);
    expect(chipOf(bare.container).className).toContain("pl-2.5");
    expect(chipOf(bare.container).className).toContain("gap-0.5");

    const led = render(<Chip label="Indonesia" leading={<span data-testid="flag" />} />);
    expect(chipOf(led.container).className).toContain("pl-1");
    expect(chipOf(led.container).className).toContain("gap-1");
    expect(led.container.querySelector('[data-testid="flag"]')).not.toBeNull();
  });

  it("paints the chip to the sheets' box", () => {
    const { container } = render(<Chip label="Design" />);
    const chip = chipOf(container);
    expect(chip.className).toContain("h-6");
    expect(chip.className).toContain("rounded-sm");
    expect(chip.className).toContain("border-neutral-300");
    expect(chip.className).toContain("pr-1");
  });

  it("steps the label and the close glyph down at sm", () => {
    const labelOf = (container: HTMLElement) =>
      container.querySelector<HTMLElement>('[data-slot="tag"] > span')!;

    const sm = render(<Chip label="Design" size="sm" onRemove={() => {}} />);
    expect(labelOf(sm.container).className).toContain("text-xs");
    expect(sm.container.querySelector("svg")!.getAttribute("width")).toBe("12");

    const md = render(<Chip label="Design" onRemove={() => {}} />);
    expect(labelOf(md.container).className).toContain("text-sm");
    expect(md.container.querySelector("svg")!.getAttribute("width")).toBe("16");
  });

  it("draws no remove left out", () => {
    render(<Chip label="Design" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("removes, and swallows the press so a trigger does not open", () => {
    const onRemove = vi.fn();
    const parent = vi.fn();
    render(
      <div onClick={parent}>
        <Chip label="Design" onRemove={onRemove} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove Design" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(parent).not.toHaveBeenCalled();

    // A press on the label still reaches whatever holds the chip
    fireEvent.click(screen.getByText("Design"));
    expect(parent).toHaveBeenCalledTimes(1);
  });

  it("blocks the remove while disabled", () => {
    const onRemove = vi.fn();
    render(<Chip label="Design" disabled onRemove={onRemove} />);
    const remove = screen.getByRole("button", { name: "Remove Design" });
    expect((remove as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(remove);
    expect(onRemove).not.toHaveBeenCalled();
  });
});
