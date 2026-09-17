import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Field, Textarea } from "../src";
import { boxOf, regionOf } from "./helpers";

const area = (container: HTMLElement) => container.querySelector("textarea") as HTMLTextAreaElement;

describe("Textarea", () => {
  it("renders a textarea rather than an input", () => {
    const { container } = render(<Textarea placeholder="Notes" />);
    expect(area(container).tagName).toBe("TEXTAREA");
  });

  it("takes the sheet's height per size", () => {
    // The sheets give the textarea two sizes: 110px and 128px.
    expect(boxOf(render(<Textarea size="sm" />).container).className).toContain("min-h-[110px]");
    expect(boxOf(render(<Textarea />).container).className).toContain("min-h-[128px]");
  });

  it("lets rows drop the minimum height so the field sizes natively", () => {
    const { container } = render(<Textarea rows={6} />);
    expect(area(container).rows).toBe(6);
    expect(boxOf(container).className).not.toContain("min-h-[128px]");
  });

  it("insets 16px, where the input insets 12", () => {
    // The sheets inset the textarea 16px and the input 12px.
    expect(regionOf(render(<Textarea />).container).className).toContain("pl-4");
    expect(regionOf(render(<Textarea />).container).className).toContain("pr-4");
  });

  it("paints the sheet's error border, not the destructive token", () => {
    // The sheets draw red-300 at rest and red-500 focused, the same pair the
    // input uses. This used to be border-destructive.
    const { container } = render(<Textarea error />);
    expect(regionOf(container).className).toContain("border-red-300");
    expect(regionOf(container).className).toContain("focus-within:outline-focus-error");
  });

  it("carries no help marker, as the sheet draws none", () => {
    const { container } = render(<Textarea />);
    expect(regionOf(container).querySelector("svg")).toBeNull();
  });

  it("fades the whole field when disabled", () => {
    // The sheet wraps the field, not the control, so the border fades too.
    const { container } = render(<Textarea disabled />);
    expect(boxOf(container).className).toContain("opacity-50");
    expect(area(container).disabled).toBe(true);
  });

  it("puts the caret in the text from a press on the field", () => {
    const { container } = render(<Textarea />);
    expect(fireEvent.mouseDown(regionOf(container))).toBe(false); // prevented
    expect(document.activeElement).toBe(area(container));
  });

  it("is wired by Field like any other control", () => {
    const { container } = render(
      <Field label="Notes" hint="Markdown is fine">
        <Textarea />
      </Field>,
    );
    const field = area(container);
    expect(field.id).not.toBe("");
    expect(screen.getByText("Notes").getAttribute("for")).toBe(field.id);
    expect(field.getAttribute("aria-describedby")).toBe(screen.getByText("Markdown is fine").id);
  });

  it("takes the error from Field and marks itself invalid", () => {
    const { container } = render(
      <Field label="Notes" error="Required">
        <Textarea />
      </Field>,
    );
    expect(area(container).getAttribute("aria-invalid")).toBe("true");
    expect(regionOf(container).className).toContain("border-red-300");
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("passes the input-like helpers through unchanged", () => {
    const onChange = vi.fn();
    const { container } = render(<Textarea onChange={onChange} />);
    fireEvent.change(area(container), { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalled();
    // one control, not an input and a textarea
    expect(container.querySelector("input")).toBeNull();
  });
});
