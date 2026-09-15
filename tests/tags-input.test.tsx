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

  it("keeps the sheet border and size on the field", () => {
    const { container } = render(<TagsInput size="lg" error />);
    const region = container.querySelector('[data-slot="value"]')!;
    expect(region.className).toContain("border-red-300");
    expect(container.firstElementChild!.className).toBeDefined();
    expect(field(container).closest("div")!.className).toContain("h-11");
  });
});
