import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Field, Select, type SelectProps } from "../src";
import { testPlatform } from "./floating";

const OPTIONS = [
  { value: "id", label: "Indonesia", description: "id" },
  { value: "my", label: "Malaysia", description: "my" },
  { value: "sg", label: "Singapore", description: "sg" },
  { value: "th", label: "Thailand", description: "th", disabled: true },
];

/** jsdom has no layout, so the deterministic platform keeps the panel fast. */
const renderSelect = (props: SelectProps) => render(<Select platform={testPlatform} {...props} />);

const trigger = () => screen.getByRole("combobox");
/** The field itself: the trigger's button sits over it, the chrome is here. */
const field = () => trigger().parentElement as HTMLElement;
const options = () => screen.getAllByRole("option");
const openPanel = () => fireEvent.click(trigger());
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
const press = (key: string) => {
  const target = (document.activeElement as HTMLElement | null) ?? trigger();
  fireEvent.keyDown(target, { key });
};

describe("Select", () => {
  it("shows the placeholder and announces a closed combobox", () => {
    renderSelect({ options: OPTIONS, placeholder: "Country" });
    expect(field().textContent).toContain("Country");
    expect(trigger().getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("opens on click and lists the options, the chosen one marked", () => {
    renderSelect({ options: OPTIONS, defaultValue: "my" });
    expect(field().textContent).toContain("Malaysia");

    openPanel();
    expect(screen.getByRole("listbox")).toBeDefined();
    expect(options()).toHaveLength(4);
    const selected = options().filter((el) => el.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toContain("Malaysia");
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
  });

  it("chooses an option by click and closes the panel", () => {
    const onValueChange = vi.fn();
    renderSelect({ options: OPTIONS, onValueChange });
    openPanel();
    fireEvent.click(options()[2]);

    expect(onValueChange).toHaveBeenCalledWith("sg");
    expect(field().textContent).toContain("Singapore");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("chooses the highlighted option with Enter", async () => {
    // Stepping further moves real focus between options, which jsdom does not
    // reproduce; the first step and the choice are what it can verify. The
    // browser probe covers the multi-step sequence (scratchpad/select-probe).
    const onValueChange = vi.fn();
    renderSelect({ options: OPTIONS, onValueChange });
    openPanel();
    press("ArrowDown");
    await settle();
    press("Enter");

    expect(onValueChange).toHaveBeenCalledWith("id");
    expect(field().textContent).toContain("Indonesia");
  });

  it("jumps to an option on a letter", async () => {
    renderSelect({ options: OPTIONS });
    openPanel();
    press("s");
    await settle();
    press("Enter");
    expect(field().textContent).toContain("Singapore");
  });

  it("never highlights or chooses a disabled option", async () => {
    const onValueChange = vi.fn();
    renderSelect({ options: OPTIONS, onValueChange });
    openPanel();
    expect(options()[3].getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(options()[3]);
    expect(onValueChange).not.toHaveBeenCalled();

    for (let step = 0; step < 5; step += 1) {
      press("ArrowDown");
      await settle();
      expect(options()[3].getAttribute("data-active")).toBeNull();
    }
  });

  it("does not open while disabled", () => {
    renderSelect({ options: OPTIONS, disabled: true });
    expect(trigger()).toHaveProperty("disabled", true);
    openPanel();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("paints the error border and ring", () => {
    renderSelect({ options: OPTIONS, error: "Required" });
    expect(field().className).toContain("border-red-300");
    expect(field().className).toContain("focus-within:outline-focus-error");
    expect(trigger().getAttribute("aria-invalid")).toBe("true");
  });

  it("follows the field ramp, and steps its marks with it", () => {
    const fieldOf = (container: HTMLElement) =>
      container.querySelector('[role="combobox"]')!.parentElement as HTMLElement;
    const layerOf = (container: HTMLElement) =>
      fieldOf(container).querySelector<HTMLElement>('[aria-hidden="true"]')!;
    const chevron = (container: HTMLElement) =>
      fieldOf(container).querySelector("svg")!.getAttribute("width");

    const sm = renderSelect({ options: OPTIONS, size: "sm" });
    expect(fieldOf(sm.container).className).toContain("h-9");
    expect(fieldOf(sm.container).className).toContain("text-sm");
    // The sheet insets the text and the trailing mark alike: 12 at sm and md
    expect(layerOf(sm.container).className).toContain("px-3");
    expect(chevron(sm.container)).toBe("16");

    const md = renderSelect({ options: OPTIONS, size: "md" });
    expect(fieldOf(md.container).className).toContain("h-10");
    expect(fieldOf(md.container).className).toContain("text-base");
    expect(chevron(md.container)).toBe("16");

    const lg = renderSelect({ options: OPTIONS, size: "lg" });
    expect(fieldOf(lg.container).className).toContain("h-11");
    // 14 at lg, and a 20 chevron: the sheet draws 11.67 × 6.67 of ink there
    expect(layerOf(lg.container).className).toContain("px-3.5");
    expect(chevron(lg.container)).toBe("20");
  });

  it("sets the trigger's supporting text a step below the value", () => {
    const supporting = (size: SelectProps["size"]) => {
      const { container } = renderSelect({ options: OPTIONS, size, defaultValue: "id" });
      const fieldEl = container.querySelector('[role="combobox"]')!.parentElement as HTMLElement;
      const span = [...fieldEl.querySelectorAll("span")].find((s) => s.textContent === "id")!;
      return span.className;
    };
    expect(supporting("sm")).toContain("text-xs");
    expect(supporting("md")).toContain("text-sm");
    expect(supporting("lg")).toContain("text-sm");
  });

  it("steps the panel's search mark with the field", () => {
    const mark = (size: SelectProps["size"]) =>
      renderSelect({ options: OPTIONS, size, searchable: true, defaultOpen: true })
        .container.ownerDocument.querySelector('[role="listbox"] svg')!
        .getAttribute("width");
    expect(mark("sm")).toBe("16");
    // The first panel would answer for the second render: a portal outlives the
    // container until cleanup.
    cleanup();
    expect(mark("md")).toBe("20");
  });

  it("wires Field's label, required flag and error message", () => {
    render(
      <Field label="Country" required error="Choose one">
        <Select options={OPTIONS} platform={testPlatform} />
      </Field>,
    );
    const label = screen.getByText("Country");
    const field = trigger();
    expect(label.getAttribute("for")).toBe(field.id);
    expect(field.getAttribute("aria-required")).toBe("true");
    const message = screen.getByText("Choose one");
    expect(field.getAttribute("aria-describedby")).toBe(message.id);
    expect(field.parentElement!.className).toContain("border-red-300");
  });

  it("mirrors the value into a hidden input for forms", () => {
    const { container } = renderSelect({ options: OPTIONS, name: "country", defaultValue: "id" });
    const hidden = container.querySelector('input[name="country"]') as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("id");
    expect(hidden.type).toBe("hidden");
  });

  it("opens searchable with the search field focused", () => {
    renderSelect({ options: OPTIONS, searchable: true });
    openPanel();
    const searchField = screen.getByPlaceholderText("Search");
    expect(document.activeElement).toBe(searchField);
    expect(options()).toHaveLength(4);
  });

  it("filters the options as the search is typed", () => {
    renderSelect({ options: OPTIONS, searchable: true });
    openPanel();
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "sin" } });
    expect(options()).toHaveLength(1);
    expect(options()[0].textContent).toContain("Singapore");
  });

  it("filters on the description too", () => {
    renderSelect({ options: OPTIONS, searchable: true });
    openPanel();
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "my" } });
    expect(options()).toHaveLength(1);
    expect(options()[0].textContent).toContain("Malaysia");
  });

  it("shows the empty state and clears the search from it", () => {
    renderSelect({ options: OPTIONS, searchable: true });
    openPanel();
    const searchField = screen.getByPlaceholderText("Search");
    fireEvent.change(searchField, { target: { value: "zzz" } });

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No results")).toBeDefined();

    fireEvent.click(screen.getByText("Clear search"));
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect((screen.getByPlaceholderText("Search") as HTMLInputElement).value).toBe("");
  });

  it("chooses the first match with Enter while searching", () => {
    const onValueChange = vi.fn();
    renderSelect({ options: OPTIONS, searchable: true, onValueChange });
    openPanel();
    const searchField = screen.getByPlaceholderText("Search");
    fireEvent.change(searchField, { target: { value: "sin" } });
    fireEvent.keyDown(searchField, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith("sg");
    expect(field().textContent).toContain("Singapore");
  });

  it("starts fresh when the panel reopens", () => {
    renderSelect({ options: OPTIONS, searchable: true });
    openPanel();
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "sin" } });
    press("Escape");
    openPanel();
    expect((screen.getByPlaceholderText("Search") as HTMLInputElement).value).toBe("");
    expect(options()).toHaveLength(4);
  });

  it("toggles options while multiple and keeps the panel open", () => {
    const onValuesChange = vi.fn();
    renderSelect({ options: OPTIONS, multiple: true, onValuesChange });
    openPanel();
    fireEvent.click(options()[0]);
    expect(onValuesChange).toHaveBeenLastCalledWith(["id"]);
    expect(screen.getByRole("listbox")).toBeDefined();

    fireEvent.click(options()[2]);
    expect(onValuesChange).toHaveBeenLastCalledWith(["id", "sg"]);
    expect(field().textContent).toContain("2 selected");
    expect(screen.getByRole("listbox")).toBeDefined();

    // toggling the same row again takes it back out
    fireEvent.click(options()[0]);
    expect(onValuesChange).toHaveBeenLastCalledWith(["sg"]);
  });

  it("shows the placeholder until something is chosen", () => {
    renderSelect({ options: OPTIONS, multiple: true, placeholder: "Countries" });
    expect(field().textContent).toContain("Countries");
    openPanel();
    fireEvent.click(options()[1]);
    expect(field().textContent).toContain("1 selected");
  });

  it("marks the chosen rows and carries a checkbox", () => {
    renderSelect({ options: OPTIONS, multiple: true, defaultValues: ["my"] });
    openPanel();
    const chosen = options().filter((el) => el.getAttribute("aria-selected") === "true");
    expect(chosen).toHaveLength(1);
    expect(chosen[0].textContent).toContain("Malaysia");
    expect(options()[0].querySelector(".border-neutral-300")).not.toBeNull();
  });

  it("refuses to toggle a disabled row while multiple", () => {
    const onValuesChange = vi.fn();
    renderSelect({ options: OPTIONS, multiple: true, onValuesChange });
    openPanel();
    fireEvent.click(options()[3]);
    expect(onValuesChange).not.toHaveBeenCalled();
  });

  it("searches by default while multiple", () => {
    renderSelect({ options: OPTIONS, multiple: true });
    openPanel();
    const searchField = screen.getByPlaceholderText("Search");
    fireEvent.change(searchField, { target: { value: "sin" } });
    expect(options()).toHaveLength(1);
    expect(options()[0].textContent).toContain("Singapore");
  });

  it("mirrors every chosen value into a hidden input", () => {
    const { container } = renderSelect({
      options: OPTIONS,
      multiple: true,
      name: "countries",
      defaultValues: ["id", "sg"],
    });
    const hidden = [...container.querySelectorAll('input[name="countries"]')] as HTMLInputElement[];
    expect(hidden.map((input) => input.value)).toEqual(["id", "sg"]);
  });

  it("clears from the trigger when clearable", () => {
    const onValueChange = vi.fn();
    renderSelect({ options: OPTIONS, defaultValue: "id", clearable: true, onValueChange });
    const clearButton = screen.getByLabelText("Clear");
    fireEvent.click(clearButton);

    expect(onValueChange).toHaveBeenCalledWith("");
    expect(field().textContent).toContain("Select");
    // nothing left to clear, and no chevron either: the sheet's Search type
    expect(screen.queryByLabelText("Clear")).toBeNull();
    expect(field().querySelector("svg")).toBeNull();
  });

  it("shows no clear while empty", () => {
    renderSelect({ options: OPTIONS, clearable: true });
    expect(screen.queryByLabelText("Clear")).toBeNull();
  });

  it("clears every value when multiple and clearable", () => {
    const onValuesChange = vi.fn();
    renderSelect({
      options: OPTIONS,
      multiple: true,
      clearable: true,
      defaultValues: ["id", "sg"],
      onValuesChange,
    });
    fireEvent.click(screen.getByLabelText("Clear"));
    expect(onValuesChange).toHaveBeenCalledWith([]);
  });

  it("renders an option's own adornment beside its label", () => {
    renderSelect({
      options: [
        { value: "id", label: "Indonesia", leading: <span data-testid="dot" /> },
        ...OPTIONS.slice(1),
      ],
    });
    openPanel();
    expect(options()[0].querySelector('[data-testid="dot"]')).not.toBeNull();
  });

  it("shows the chosen options as chips when asked", () => {
    renderSelect({ options: OPTIONS, multiple: true, chips: true, defaultValues: ["id", "sg"] });
    expect(screen.getByText("Indonesia")).toBeDefined();
    expect(screen.getByText("Singapore")).toBeDefined();
    expect(screen.getByLabelText("Remove Indonesia")).toBeDefined();
    // the count is replaced by the chips
    expect(field().textContent).not.toContain("2 selected");
  });

  it("removes a chip's option and leaves the panel closed", () => {
    const onValuesChange = vi.fn();
    renderSelect({
      options: OPTIONS,
      multiple: true,
      chips: true,
      defaultValues: ["id", "sg"],
      onValuesChange,
    });
    fireEvent.click(screen.getByLabelText("Remove Indonesia"));

    expect(onValuesChange).toHaveBeenCalledWith(["sg"]);
    expect(screen.queryByLabelText("Remove Indonesia")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("keeps the chips off a single select", () => {
    renderSelect({ options: OPTIONS, chips: true, defaultValue: "id" });
    expect(screen.queryByLabelText("Remove Indonesia")).toBeNull();
    expect(field().textContent).toContain("Indonesia");
  });

  it("names the trigger with the chosen labels", () => {
    renderSelect({ options: OPTIONS, multiple: true, chips: true, defaultValues: ["id", "sg"] });
    expect(trigger().textContent).toContain("Indonesia, Singapore");
  });

  it("takes the open state from the caller", () => {
    const onOpenChange = vi.fn();
    renderSelect({ options: OPTIONS, open: true, onOpenChange });
    expect(screen.getByRole("listbox")).toBeDefined();

    press("Escape");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // the caller owns it, so the panel stays open
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("portals the panel into the container it is given", () => {
    function Contained() {
      const root = useRef<HTMLDivElement>(null);
      return (
        <>
          <div ref={root} data-testid="root" />
          <Select platform={testPlatform} options={OPTIONS} defaultOpen portalRoot={root} />
        </>
      );
    }
    render(<Contained />);
    const root = screen.getByTestId("root");
    expect(root.querySelector('[data-slot="popover"]')).not.toBeNull();
  });

  it("keeps the value when controlled", async () => {
    const onValueChange = vi.fn();
    renderSelect({ options: OPTIONS, value: "id", onValueChange });
    openPanel();
    fireEvent.click(options()[1]);
    expect(onValueChange).toHaveBeenCalledWith("my");
    // the caller owns the value, so the field still shows the old one
    await waitFor(() => expect(field().textContent).toContain("Indonesia"));
  });
});
