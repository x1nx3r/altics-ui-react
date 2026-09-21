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
    // The sheet insets the text 12 and the chevron's frame 10 from the right
    expect(layerOf(sm.container).className).toContain("pl-3");
    expect(layerOf(sm.container).className).toContain("pr-2.5");
    expect(chevron(sm.container)).toBe("16");

    const md = renderSelect({ options: OPTIONS, size: "md" });
    expect(fieldOf(md.container).className).toContain("h-10");
    expect(fieldOf(md.container).className).toContain("text-base");
    expect(layerOf(md.container).className).toContain("pr-3");
    expect(chevron(md.container)).toBe("16");

    const lg = renderSelect({ options: OPTIONS, size: "lg" });
    expect(fieldOf(lg.container).className).toContain("h-11");
    // 14 on both edges at lg, and a 20 chevron: the sheet draws 11.67 × 6.67 of
    // ink there
    expect(layerOf(lg.container).className).toContain("pl-3.5");
    expect(layerOf(lg.container).className).toContain("pr-3.5");
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

  it("spans the value across the field so the chevron sits on its edge", () => {
    // The sheet pins the trailing mark to the field's trailing inset; without
    // flex-1 on the value the mark would follow the text instead.
    const valueOf = (props: SelectProps) => {
      const { container } = renderSelect(props);
      const layer = container
        .querySelector('[role="combobox"]')!
        .parentElement!.querySelector('[aria-hidden="true"]')!;
      return (layer.children[0] as HTMLElement).className;
    };
    expect(valueOf({ options: OPTIONS, placeholder: "Country" })).toContain("flex-1");
    expect(valueOf({ options: OPTIONS, defaultValue: "id" })).toContain("flex-1");
    expect(valueOf({ options: OPTIONS, multiple: true, placeholder: "Country" })).toContain("flex-1");
    expect(valueOf({ options: OPTIONS, multiple: true, defaultValues: ["id", "my"] })).toContain(
      "flex-1",
    );
    expect(
      valueOf({ options: OPTIONS, multiple: true, chips: true, defaultValues: ["id", "my"] }),
    ).toContain("flex-1");
  });

  it("puts the clear mark where the sheet draws it", () => {
    // The sheet's clear ink sits 12.5, 17 and 19 from the right edge; with our
    // glyph that puts the button at 12, 16 and 18.
    const clearOf = (size: SelectProps["size"]) =>
      renderSelect({ options: OPTIONS, size, clearable: true, defaultValue: "id" })
        .container.querySelector('button[aria-label="Clear"]')!.className;
    expect(clearOf("sm")).toContain("right-3");
    expect(clearOf("md")).toContain("right-4");
    expect(clearOf("lg")).toContain("right-[18px]");
  });

  it("keeps the caret in the search field while the highlight moves", () => {
    renderSelect({ options: OPTIONS, searchable: true });
    openPanel();
    const searchField = screen.getByPlaceholderText("Search");
    fireEvent.change(searchField, { target: { value: "si" } });

    // The most relevant row is highlighted and announced, but the field keeps
    // the caret: typing continues without a focus steal.
    expect(document.activeElement).toBe(searchField);
    expect(options()[0].getAttribute("data-active")).toBe("true");
    // floating-ui announces the virtual focus on the listbox itself
    expect(screen.getByRole("listbox").getAttribute("aria-activedescendant")).toBe(options()[0].id);
  });

  it("lets the search field own Space, and chooses with Enter", () => {
    const onValueChange = vi.fn();
    renderSelect({ options: OPTIONS, searchable: true, onValueChange });
    openPanel();
    const searchField = screen.getByPlaceholderText("Search");
    fireEvent.change(searchField, { target: { value: "sin" } });

    fireEvent.keyDown(searchField, { key: " " });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeDefined();

    fireEvent.keyDown(searchField, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("sg");
  });

  it("lets the empty state's copy and the footer's labels be renamed", () => {
    renderSelect({
      options: OPTIONS,
      searchable: true,
      multiple: true,
      noResultsTitle: "Nothing here",
      noResultsHint: "Loosen the filters.",
      noResultsAction: "Start over",
      resetLabel: "Leeren",
      selectAllLabel: "Alles",
    });
    openPanel();
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "zzz" } });
    expect(screen.getByText("Nothing here")).toBeDefined();
    expect(screen.getByText("Loosen the filters.")).toBeDefined();

    fireEvent.click(screen.getByText("Start over"));
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Leeren" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Alles" })).toBeDefined();
  });

  it("takes domain-shaped options through the resolvers", () => {
    const onValueChange = vi.fn();
    type User = { id: number; name: string; team: string };
    const users: User[] = [
      { id: 1, name: "Irfan Yulianto", team: "Design" },
      { id: 2, name: "Siti Rahma", team: "Research" },
      { id: 3, name: "Budi Santoso", team: "Platform" },
    ];
    render(
      <Select
        options={users}
        getOptionValue={(user) => String(user.id)}
        getOptionLabel={(user) => user.name}
        searchable
        searchPlaceholder="Pick a teammate"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByPlaceholderText("Pick a teammate"), { target: { value: "siti" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(document.activeElement).toBe(screen.getByPlaceholderText("Pick a teammate"));
    fireEvent.keyDown(screen.getByPlaceholderText("Pick a teammate"), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("2");
    expect(screen.getByRole("combobox").parentElement!.textContent).toContain("Siti Rahma");
  });

  it("shows a loading row while the options are on their way", () => {
    renderSelect({ options: OPTIONS, searchable: true, loading: true });
    openPanel();
    const searchField = screen.getByPlaceholderText("Search");
    fireEvent.change(searchField, { target: { value: "zzz" } });

    // loading outranks the empty state, and the field stays live
    expect(screen.getByText("Loading…")).toBeDefined();
    expect(screen.queryByText("No teams found")).toBeNull();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(document.activeElement).toBe(searchField);

    cleanup();
    const renamed = renderSelect({
      options: OPTIONS,
      searchable: true,
      loading: true,
      loadingLabel: "Fetching teams…",
    });
    openPanel();
    expect(document.querySelector('[data-slot="loading"]')!.textContent).toContain(
      "Fetching teams…",
    );
  });

  it("lets the caller own the search text", () => {
    const onQueryChange = vi.fn();
    const { rerender } = renderSelect({
      options: OPTIONS,
      searchable: true,
      query: "sin",
      onQueryChange,
    });
    openPanel();
    expect(options()).toHaveLength(1);

    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "siti" } });
    expect(onQueryChange).toHaveBeenCalledWith("siti");

    // the caller applies it — and the text is theirs, so it survives renders
    rerender(
      <Select
        options={OPTIONS}
        searchable
        query="sin"
        onQueryChange={onQueryChange}
        platform={testPlatform}
      />,
    );
    expect(options()).toHaveLength(1);
    expect((screen.getByPlaceholderText("Search") as HTMLInputElement).value).toBe("sin");
  });

  it("starts the search from defaultQuery", () => {
    renderSelect({ options: OPTIONS, searchable: true, defaultQuery: "si" });
    openPanel();
    expect(options()).toHaveLength(3);
  });

  it("focuses the trigger on mount and reports focus changes", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { container } = renderSelect({
      options: OPTIONS,
      autoFocus: true,
      onFocus,
      onBlur,
    });
    expect(document.activeElement).toBe(trigger());
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(trigger());
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(container).toBeDefined();
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
    // the spec pins the way out to text-sm/semibold
    expect(screen.getByText("Clear search").className).toContain("font-semibold");

    fireEvent.click(screen.getByText("Clear search"));
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect((screen.getByPlaceholderText("Search") as HTMLInputElement).value).toBe("");
  });

  it("gives the multiple panel a footer that selects all and resets", () => {
    const onValuesChange = vi.fn();
    renderSelect({ options: OPTIONS, multiple: true, onValuesChange });
    openPanel();

    fireEvent.click(screen.getByRole("button", { name: "Select all" }));
    // Thailand is disabled and stays out of the selection
    expect(onValuesChange).toHaveBeenLastCalledWith(["id", "my", "sg"]);
    // the Figma spec pins these labels to text-sm/semibold
    expect(screen.getByRole("button", { name: "Select all" }).className).toContain("font-semibold");
    expect(screen.getByRole("button", { name: "Reset" }).className).toContain("font-semibold");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onValuesChange).toHaveBeenLastCalledWith([]);
  });

  it("lets a consumer replace or remove the footer", () => {
    const { container } = renderSelect({
      options: OPTIONS,
      multiple: true,
      footer: <div data-testid="custom-footer">Apply and Cancel</div>,
    });
    openPanel();
    expect(screen.queryByRole("button", { name: "Select all" })).toBeNull();
    expect(screen.getByTestId("custom-footer")).toBeDefined();

    cleanup();
    const hidden = renderSelect({ options: OPTIONS, multiple: true, footer: null });
    openPanel();
    expect(hidden.container.querySelector('[data-slot="footer"]')).toBeNull();
  });

  it("keeps the footer out of the single panel", () => {
    renderSelect({ options: OPTIONS, searchable: true });
    openPanel();
    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Select all" })).toBeNull();
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
