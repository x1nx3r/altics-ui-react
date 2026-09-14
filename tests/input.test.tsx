import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Field, Input, InputDivider } from "../src";

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

  it("marks the field invalid and paints the border when error is set", () => {
    const { container } = render(<Input error placeholder="Email" />);
    expect(container.querySelector("input")?.getAttribute("aria-invalid")).toBe("true");
    expect(container.firstElementChild?.className).toContain("border-destructive");
  });

  it("keeps the normal border when error is absent", () => {
    const { container } = render(<Input />);
    expect(container.firstElementChild?.className).toContain("border-input");
  });

  it("renders the affixes around the text field", () => {
    const { container } = render(<Input leading="Rp" trailing="kg" />);
    const parts = [...container.firstElementChild!.children].map((el) => el.tagName.toLowerCase());
    expect(parts).toEqual(["span", "input", "span"]);
  });

  it("draws one divider per side only when the divider prop asks for it", () => {
    const box = (ui: React.ReactElement) => render(ui).container;
    expect(box(<Input leading="Rp" trailing="kg" />).querySelectorAll("span.w-px")).toHaveLength(0);
    expect(box(<Input leading="Rp" trailing="kg" divider />).querySelectorAll("span.w-px")).toHaveLength(2);
    expect(
      box(<Input leading="https://" divider={{ leading: true }} />).querySelectorAll("span.w-px"),
    ).toHaveLength(1);
  });

  it("insets both edges when only one affix is present", () => {
    const { container } = render(<Input trailing={<span>pick</span>} />);
    const cls = container.firstElementChild!.className;
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
