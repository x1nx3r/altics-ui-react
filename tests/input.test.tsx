import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Field, Input, InputDivider } from "../src";

const valueRegion = (container: HTMLElement) =>
  container.querySelector('[data-slot="value"]') as HTMLElement;
const container = (rendered: { container: HTMLElement }) =>
  rendered.container.firstElementChild as HTMLElement;
const fieldOf = (rendered: { container: HTMLElement }) =>
  rendered.container.querySelector("input") as HTMLInputElement;

describe("Input", () => {
  it("renders a textbox with the md size by default", () => {
    const { container } = render(<Input placeholder="Email" />);
    const input = container.querySelector("input");
    expect(input?.placeholder).toBe("Email");
    expect(container.firstElementChild?.className).toContain("h-10");
  });

  it("sizes the box per the size prop", () => {
    const cases = [
      ["sm", "h-9"],
      ["md", "h-10"],
      ["lg", "h-11"],
    ] as const;
    for (const [size, expected] of cases) {
      const { container } = render(<Input size={size} />);
      expect(container.firstElementChild?.className, size).toContain(expected);
    }
  });

  it("sets the sheet's text size per size", () => {
    // Sheet cap heights: 10.1px at sm against 11.5px at md and lg, so md and lg
    // share a size and sm is one step down.
    const cases = [
      ["sm", "text-sm"],
      ["md", "text-base"],
      ["lg", "text-base"],
    ] as const;
    for (const [size, expected] of cases) {
      const { container } = render(<Input size={size} />);
      expect(container.firstElementChild?.className, size).toContain(expected);
    }
  });

  it("marks the field invalid and paints the sheet error border when error is set", () => {
    const { container } = render(<Input error placeholder="Email" />);
    expect(container.querySelector("input")?.getAttribute("aria-invalid")).toBe("true");
    // sheet: error rest border is red-300, drawn by the value region
    expect(valueRegion(container).className).toContain("border-red-300");
  });

  it("keeps the sheet rest border when error is absent", () => {
    const { container } = render(<Input />);
    // sheet: rest border is neutral-300, drawn by the value region
    expect(valueRegion(container).className).toContain("border-neutral-300");
  });

  it("draws the border on the value region, not the box", () => {
    const { container } = render(<Input />);
    const box = container.firstElementChild as HTMLElement;
    const region = valueRegion(container);
    // The box must not draw a border: the focus outline lives on the region, so
    // a border on the box would show beside the outline instead of under it.
    expect(box.className).not.toMatch(/(^|\s)border(-|\s|$)/);
    // The region owns all four sides; its inner edge is the divider when a
    // panel is attached.
    expect(region.className).toMatch(/(^|\s)border(\s|$)/);
    expect(region.className).toContain("border-neutral-300");
  });

  it("puts the error border on the value region too", () => {
    const { container } = render(<Input error />);
    expect((container.firstElementChild as HTMLElement).className).not.toMatch(
      /(^|\s)border(-|\s|$)/,
    );
    expect(valueRegion(container).className).toContain("border-red-300");
  });

  it("shows a help marker by default, which turns red and becomes an alert on error", () => {
    const normal = render(<Input />);
    const normalMarker = normal.container.querySelector("svg")!;
    expect(normalMarker).not.toBeNull();
    expect(normal.container.querySelector('[data-slot="value"]')!.textContent).toBe("");
    // neutral wrapper at rest
    const normalWrapper = normalMarker.closest("span")!;
    expect(normalWrapper.className).toContain("text-neutral-400");

    const errored = render(<Input error />);
    const errorMarker = errored.container.querySelector("svg")!;
    expect(errorMarker.closest("span")!.className).toContain("text-red-600");
    // the glyph itself changes, not just the colour
    expect(errorMarker.innerHTML).not.toBe(normalMarker.innerHTML);
  });

  it("hides the marker when helpIcon is false", () => {
    const { container } = render(<Input helpIcon={false} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("makes the marker a button when a handler is given", () => {
    const onHelpClick = vi.fn();
    render(<Input onHelpClick={onHelpClick} />);
    const button = screen.getByLabelText("Help");
    fireEvent.click(button);
    expect(onHelpClick).toHaveBeenCalled();
  });

  it("keeps consumer trailing content before the marker", () => {
    const { container } = render(<Input trailing={<span data-testid="x">kg</span>} />);
    const wrapper = container.querySelector("span.gap-2")!;
    const kids = [...wrapper.children].map((el) => el.tagName.toLowerCase());
    expect(kids).toEqual(["span", "svg"]);
  });

  it("keeps the size height by default and trades it for a minimum when growing", () => {
    const fixed = render(<Input />);
    expect(container(fixed).className).toContain("h-10");
    expect(container(fixed).className).not.toContain("min-h-10");

    const growing = render(<Input grow />);
    expect(container(growing).className).toContain("min-h-10");
    expect(container(growing).className).not.toMatch(/(^|\s)h-10(\s|$)/);
    // the field itself accounts for the region's two 1px borders
    expect(fieldOf(growing).className).toContain("h-[38px]");
  });

  it("wraps and dissolves its slots when growing", () => {
    const { container } = render(<Input grow leading="Rp" trailing="kg" />);
    const region = valueRegion(container);
    expect(region.className).toContain("flex-wrap");
    // a slot is one un-wrappable box; in grow mode its children join the wrap
    for (const slot of [...region.querySelectorAll(":scope > span")]) {
      expect(slot.className).toContain("contents");
    }
  });

  it("renders the affixes around the text field", () => {
    const { container } = render(<Input leading="Rp" trailing="kg" />);
    const region = container.querySelector('[data-slot="value"]')!;
    const parts = [...region.children].map((el) => el.tagName.toLowerCase());
    expect(parts).toEqual(["span", "input", "span"]);
  });

  it("draws one divider per side only when the divider prop asks for it", () => {
    const box = (ui: React.ReactElement) => render(ui).container;
    expect(box(<Input leading="Rp" trailing="kg" />).querySelectorAll("span.w-px")).toHaveLength(0);
    expect(
      box(<Input leading="Rp" trailing="kg" divider />).querySelectorAll("span.w-px"),
    ).toHaveLength(2);
    expect(
      box(<Input leading="https://" divider={{ leading: true }} />).querySelectorAll("span.w-px"),
    ).toHaveLength(1);
  });

  it("insets both edges when only one affix is present", () => {
    const { container } = render(<Input trailing={<span>pick</span>} />);
    const cls = container.querySelector('[data-slot="value"]')!.className;
    expect(cls).toContain("pl-3");
    expect(cls).toContain("pr-2.5");
  });
});

describe("InputDivider", () => {
  it("is decorative and spans the box height", () => {
    const { container } = render(<InputDivider />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.className).toContain("h-full");
    expect(el.className).toContain("w-px");
  });
});

describe("Field", () => {
  it("links the label to the input and describes it with the hint", () => {
    const { container } = render(
      <Field label="Email" hint="We never share it.">
        <Input />
      </Field>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;
    expect(label.getAttribute("for")).toBe(input.id);
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe("We never share it.");
  });

  it("replaces the hint with the error and announces it", () => {
    const { container } = render(
      <Field label="Email" hint="hint text" error="Enter a valid email address.">
        <Input />
      </Field>,
    );
    const input = container.querySelector("input")!;
    const alert = container.querySelector("[role='alert']");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(container.textContent).not.toContain("hint text");
    expect(alert?.textContent).toBe("Enter a valid email address.");
    expect(input.getAttribute("aria-describedby")).toBe(alert?.id);
  });

  it("marks the control required without putting the asterisk in the label text", () => {
    const { container } = render(
      <Field label="Email" required>
        <Input />
      </Field>,
    );
    const label = container.querySelector("label")!;
    expect(label.querySelector("[aria-hidden='true']")?.textContent).toBe(" *");
    expect(container.querySelector("input")?.required).toBe(true);
  });
});
