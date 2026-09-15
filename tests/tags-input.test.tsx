import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TagsInput } from "../src";

const field = (container: HTMLElement) => container.querySelector("input") as HTMLInputElement;
const chips = (container: HTMLElement) => [...container.querySelectorAll('[data-slot="tag"]')];

describe("TagsInput", () => {
  it("commits a tag on Enter and clears the draft", () => {
    const onValueChange = vi.fn();
    const { container } = render(<TagsInput onValueChange={onValueChange} />);
    const input = field(container);
    fireEvent.change(input, { target: { value: "design" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["design"]);
    expect(field(container).value).toBe("");
    expect(chips(container).map((c) => c.textContent)).toEqual(["design"]);
  });

  it("commits on a comma as well", () => {
    const onValueChange = vi.fn();
    const { container } = render(<TagsInput onValueChange={onValueChange} />);
    const input = field(container);
    fireEvent.change(input, { target: { value: "ui" } });
    fireEvent.keyDown(input, { key: "," });
    expect(onValueChange).toHaveBeenCalledWith(["ui"]);
  });

  it("trims, ignores empty tags and refuses duplicates", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <TagsInput defaultValue={["design"]} onValueChange={onValueChange} />,
    );
    const input = field(container);
    fireEvent.change(input, { target: { value: "  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "design" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "  ui  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["design", "ui"]);
  });

  it("splits a pasted list on commas and newlines", () => {
    const onValueChange = vi.fn();
    const { container } = render(<TagsInput onValueChange={onValueChange} />);
    fireEvent.paste(field(container), {
      clipboardData: { getData: () => "one, two\nthree" },
    });
    expect(onValueChange).toHaveBeenCalledWith(["one", "two", "three"]);
    expect(chips(container)).toHaveLength(3);
  });

  it("leaves a plain paste to the field", () => {
    const onValueChange = vi.fn();
    const { container } = render(<TagsInput onValueChange={onValueChange} />);
    fireEvent.paste(field(container), { clipboardData: { getData: () => "plain" } });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("removes the last tag on Backspace when the field is empty", () => {
    const onValueChange = vi.fn();
    render(<TagsInput defaultValue={["a", "b"]} onValueChange={onValueChange} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Backspace" });
    expect(onValueChange).toHaveBeenCalledWith(["a"]);
  });

  it("does not remove anything on Backspace while typing", () => {
    const onValueChange = vi.fn();
    const { container } = render(<TagsInput defaultValue={["a"]} onValueChange={onValueChange} />);
    const input = field(container);
    fireEvent.change(input, { target: { value: "b" } });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("removes a tag from its own button", () => {
    const onValueChange = vi.fn();
    render(<TagsInput defaultValue={["a", "b"]} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByLabelText("Remove a"));
    expect(onValueChange).toHaveBeenCalledWith(["b"]);
  });

  it("stops at maxTags", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <TagsInput defaultValue={["a", "b"]} maxTags={2} onValueChange={onValueChange} />,
    );
    const input = field(container);
    fireEvent.change(input, { target: { value: "c" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(chips(container)).toHaveLength(2);
  });

  it("renders the chips inside the field by default", () => {
    const { container } = render(<TagsInput defaultValue={["a", "b"]} />);
    const region = container.querySelector('[data-slot="value"]')!;
    for (const chip of chips(container)) {
      expect(region.contains(chip)).toBe(true);
    }
  });

  it("renders the chips below the field when asked", () => {
    const { container } = render(<TagsInput chips="below" defaultValue={["a", "b"]} />);
    const region = container.querySelector('[data-slot="value"]')!;
    for (const chip of chips(container)) {
      expect(region.contains(chip)).toBe(false);
    }
    // and the wrapper stacks the field over the row of tags
    expect(container.firstElementChild!.className).toContain("flex-col");
  });

  it("hides the placeholder once a tag exists", () => {
    const empty = render(<TagsInput placeholder="Add a tag" />);
    expect(field(empty.container).placeholder).toBe("Add a tag");

    const filled = render(<TagsInput placeholder="Add a tag" defaultValue={["a"]} />);
    expect(field(filled.container).placeholder).toBe("");
  });

  it("does not move its own state in controlled use", () => {
    const onValueChange = vi.fn();
    const { container } = render(<TagsInput value={["a"]} onValueChange={onValueChange} />);
    const input = field(container);
    fireEvent.change(input, { target: { value: "b" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["a", "b"]);
    expect(chips(container)).toHaveLength(1);
  });

  it("disables the field and the chip buttons together", () => {
    const { container } = render(<TagsInput disabled defaultValue={["a"]} />);
    expect(field(container).disabled).toBe(true);
    expect((screen.getByLabelText("Remove a") as HTMLButtonElement).disabled).toBe(true);
  });

  it("grows the field when the chips are inside", () => {
    const inside = render(<TagsInput defaultValue={["a"]} />);
    const box = inside.container.querySelector("div.flex.w-full")!;
    expect(box.className).toContain("min-h-10");
    expect(inside.container.querySelector('[data-slot="value"]')!.className).toContain("flex-wrap");

    // chips below sit outside the field, so it keeps its fixed height
    const below = render(<TagsInput chips="below" defaultValue={["a"]} />);
    const belowBox = below.container.querySelector("div.flex.w-full")!;
    expect(belowBox.className).toContain("h-10");
    expect(belowBox.className).not.toContain("min-h-10");
  });

  it("keeps the sheet height and scrolls the chips on overflow='scroll'", () => {
    const { container } = render(<TagsInput overflow="scroll" defaultValue={["a", "b"]} />);
    const box = container.querySelector("div.flex.w-full")!;
    expect(box.className).toContain("h-10");
    expect(box.className).not.toContain("min-h-10");
    const region = container.querySelector('[data-slot="value"]')!;
    expect(region.className).not.toContain("flex-wrap");
    // The chips scroll in their own strip, not the whole field, so the text
    // stays where it is and stays clickable however many chips there are.
    expect(region.querySelector("span")!.className).toContain("overflow-x-auto");
    // a chip never shrinks and the text keeps a floor, so the strip gives way
    expect(chips(container)[0].className).toContain("shrink-0");
    expect(field(container).className).toContain("min-w-16");
  });

  it("leaves the field alone when the chips sit below", () => {
    // the row below is outside the field, so no overflow mode reaches it
    const { container } = render(
      <TagsInput chips="below" overflow="scroll" defaultValue={["a"]} />,
    );
    const region = container.querySelector('[data-slot="value"]')!;
    expect(region.className).not.toContain("overflow-x-auto");
  });

  it("paints a chip to the sheet's numbers", () => {
    // Figma md: 24px tall at every size, 6px radius, 1px neutral-300 border,
    // 10px left padding, and a 2px gap before the close glyph.
    const { container } = render(<TagsInput defaultValue={["a"]} />);
    const chip = chips(container)[0];
    expect(chip.className).toContain("h-6");
    expect(chip.className).toContain("rounded-sm");
    expect(chip.className).toContain("border-neutral-300");
    expect(chip.className).toContain("pl-2.5");
    expect(chip.className).toContain("gap-0.5");
    expect(chip.className).toContain("pr-1");
    // The close glyph is 16px at md and steps down to 12px on sm, as the sheet
    // draws it (7px of ink at md against 5.8px at sm).
    const glyph = (size: "sm" | "md" | "lg") =>
      render(<TagsInput size={size} defaultValue={["a"]} />).container.querySelector("svg")!;
    expect(glyph("sm").getAttribute("width")).toBe("12");
    expect(glyph("md").getAttribute("width")).toBe("16");
    expect(glyph("lg").getAttribute("width")).toBe("16");
  });

  it("steps the chip label down on sm", () => {
    const label = (size: "sm" | "md" | "lg") =>
      render(<TagsInput size={size} defaultValue={["a"]} />).container.querySelector(
        '[data-slot="tag"] span',
      )!.className;
    expect(label("sm")).toContain("text-xs");
    expect(label("md")).toContain("text-sm");
    expect(label("lg")).toContain("text-sm");
  });

  it("uses the sheet's insets in either overflow mode", () => {
    // The sheets inset a chip 4px less than the text, and leave 8px between the
    // last chip and the text against a 6px chip gap. Both modes honour that.
    for (const overflow of ["wrap", "scroll"] as const) {
      const { container } = render(<TagsInput overflow={overflow} defaultValue={["a"]} />);
      const region = container.querySelector('[data-slot="value"]')!;
      expect(region.className, overflow).toContain("has-[[data-slot=tag]]:pl-2");
      expect(field(container).className, overflow).toContain("ml-0.5");
    }
  });

  it("keeps the sheet's chip gap in the row below", () => {
    const { container } = render(<TagsInput chips="below" defaultValue={["a"]} />);
    expect(chips(container)[0].parentElement!.className).toContain("gap-1.5");
  });

  it("keeps the sheet border and size on the field", () => {
    const { container } = render(<TagsInput size="lg" error />);
    const region = container.querySelector('[data-slot="value"]')!;
    expect(region.className).toContain("border-red-300");
    expect(container.firstElementChild!.className).toBeDefined();
    expect(field(container).closest("div")!.className).toContain("h-11");
  });
});
