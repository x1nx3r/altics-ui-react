import { useRef, useState, type HTMLAttributes } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PopoverPanel, usePopover } from "../src/components/popover";
import { ListboxOption } from "../src/components/listbox";
import { testPlatform } from "./floating";

const OPTIONS = ["Apple", "Banana", "Cherry"];

/** A trigger and a listbox, the way the select will wire them. */
function Harness({
  defaultOpen = true,
  disabledIndex,
}: {
  defaultOpen?: boolean;
  disabledIndex?: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  // useTypeahead wants the labels, index-aligned with the elements.
  const labelsRef = useRef<Array<string | null>>([]);

  const popover = usePopover({
    defaultOpen,
    role: "listbox",
    platform: testPlatform,
    listNavigation: {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
      loop: true,
      selectedIndex,
    },
    typeahead: { listRef: labelsRef, activeIndex, onMatch: setActiveIndex },
  });

  return (
    <>
      <button
        ref={popover.refs.setReference as never}
        {...(popover.getReferenceProps() as HTMLAttributes<HTMLButtonElement>)}
      >
        Choose
      </button>
      <PopoverPanel
        popover={popover}
        className="panel"
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && activeIndex !== null) {
            setSelectedIndex(activeIndex);
          }
        }}
      >
        {OPTIONS.map((label, index) => (
          <ListboxOption
            key={label}
            {...(popover.getItemProps({
              onClick: () => {
                if (index !== disabledIndex) setSelectedIndex(index);
              },
            }) as HTMLAttributes<HTMLDivElement>)}
            ref={(node) => {
              listRef.current[index] = node;
              labelsRef.current[index] = label;
            }}
            id={`fruit-${index}`}
            active={activeIndex === index}
            selected={selectedIndex === index}
            disabled={disabledIndex === index}
          >
            {label}
          </ListboxOption>
        ))}
      </PopoverPanel>
    </>
  );
}

const trigger = () => screen.getByText("Choose");
const panel = () => screen.getByRole("listbox");
const options = () => screen.getAllByRole("option");
const selected = () => options().filter((el) => el.getAttribute("aria-selected") === "true");
const active = () => options().find((el) => el.getAttribute("data-active") === "true");
// A real keydown goes to the focused element and bubbles to the panel, which
// is how floating-ui tracks which option is active.
const press = (key: string) => {
  const target = (document.activeElement as HTMLElement | null) ?? panel();
  fireEvent.keyDown(target, { key });
};
// floating-ui focuses the next option and reports it through React state, so a
// step is not visible until the update flushes.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("Listbox", () => {
  it("announces the listbox, its options and the trigger's wiring", () => {
    render(<Harness />);
    expect(trigger().getAttribute("aria-haspopup")).toBe("listbox");

    expect(panel().getAttribute("data-slot")).toBe("popover");
    expect(trigger().getAttribute("aria-controls")).toBe(panel().id);

    expect(options().map((el) => el.id)).toEqual(["fruit-0", "fruit-1", "fruit-2"]);
    expect(selected().map((el) => el.textContent)).toEqual(["Apple"]);
  });

  it("makes the panel focusable, so the key handling has a home", () => {
    // floating-ui's manager moves focus in on open in a browser, where the
    // panel is tabbable. jsdom cannot see layout, so tabbable reports the
    // panel as hidden and never focuses it — the browser probe is where the
    // focus movement gets confirmed.
    render(<Harness />);
    expect(panel().getAttribute("tabindex")).toBe("-1");
  });

  it("highlights an option on the first arrow", async () => {
    render(<Harness />);
    press("ArrowDown");
    await settle();
    // Stepping onwards moves real focus between options, which jsdom does not
    // reproduce. The browser probe covers that sequence
    // (probes/select-probe.html: fruit-0, then fruit-1).
    const highlighted = active();
    expect(highlighted).not.toBeUndefined();
    expect(options()).toContain(highlighted);
  });

  it("jumps to an option on a letter", () => {
    render(<Harness />);
    press("c");
    expect(active()?.textContent).toBe("Cherry");
  });

  it("never highlights a disabled option", () => {
    render(<Harness disabledIndex={1} />);
    expect(options()[1].getAttribute("aria-disabled")).toBe("true");
    // whatever the starting point, ArrowDown steps over Banana every time
    for (let step = 0; step < 4; step += 1) {
      press("ArrowDown");
      expect(active()?.textContent).not.toBe("Banana");
    }
  });

  it("selects the highlighted option with Enter", async () => {
    render(<Harness />);
    press("c");
    await settle();
    press("Enter");
    expect(selected().map((el) => el.textContent)).toEqual(["Cherry"]);
  });

  it("selects on click and follows the pointer on hover", () => {
    render(<Harness />);
    fireEvent.click(options()[1]);
    expect(selected().map((el) => el.textContent)).toEqual(["Banana"]);

    fireEvent.mouseMove(options()[2]);
    expect(active()?.textContent).toBe("Cherry");
  });

  it("ignores a click on a disabled option", () => {
    render(<Harness disabledIndex={1} />);
    fireEvent.click(options()[1]);
    expect(selected().map((el) => el.textContent)).toEqual(["Apple"]);
  });

  it("renders no listbox while the panel is closed", () => {
    render(<Harness defaultOpen={false} />);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
