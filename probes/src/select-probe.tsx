import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@altics/ui";
import "@altics/ui/styles.css";
import "../src/index.css";
import { PopoverPanel, usePopover, type UsePopoverOptions } from "../../src/components/popover";
import { ListboxOption } from "../../src/components/listbox";
import { Select } from "../../src/components/select";

const COUNTRIES = [
  { value: "id", label: "Indonesia", description: "id" },
  { value: "my", label: "Malaysia", description: "my" },
  { value: "sg", label: "Singapore", description: "sg" },
  { value: "th", label: "Thailand", description: "th" },
];

const FRUIT = [
  "Apple",
  "Banana",
  "Cherry",
  "Damson",
  "Elderberry",
  "Fig",
  "Grape",
  "Honeydew",
  "Indian fig",
  "Jackfruit",
  "Kiwi",
  "Lemon",
];

const r = (n: number) => Math.round(n * 10) / 10;
// headless throttles rAF, so wait on a timer: virtual time advances it
const frame = () => new Promise<void>((resolve) => setTimeout(resolve, 16));
const press = (key: string, target: HTMLElement | null) => {
  const el = target ?? (document.activeElement as HTMLElement | null) ?? document.body;
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  el.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
};

type Case = "basic" | "above" | "scroll" | "nofocus" | "disabled" | "first" | "second";

function ProbeSelect({
  id,
  items,
  disabledIndex,
  focus = true,
  placement,
  maxHeight = 256,
}: {
  id: Case;
  items?: string[];
  disabledIndex?: number;
  focus?: boolean;
  placement?: UsePopoverOptions["placement"];
  maxHeight?: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const list = items ?? FRUIT;

  const popover = usePopover({
    role: "listbox",
    placement,
    focus,
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
    <div data-case={id} style={{ width: 320, margin: 12 }}>
      <button
        data-slot="trigger"
        ref={popover.refs.setReference as never}
        type="button"
        style={{ width: "100%", height: 40 }}
        {...popover.getReferenceProps()}
      >
        {list[selectedIndex ?? 0]}
      </button>
      <PopoverPanel
        popover={popover}
        style={{ background: "#fff", border: "1px solid #d4d4d4", borderRadius: 6, padding: 4 }}
      >
        <div style={{ maxHeight, overflow: "auto" }}>
          {list.map((item, index) => (
            <ListboxOption
              key={item}
              {...popover.getItemProps({ onClick: () => setSelectedIndex(index) })}
              ref={(node) => {
                listRef.current[index] = node;
                labelsRef.current[index] = item;
              }}
              id={`${id}-${index}`}
              active={activeIndex === index}
              selected={selectedIndex === index}
              disabled={index === disabledIndex}
              style={{ height: 40, display: "flex", alignItems: "center", padding: "0 12px" }}
            >
              {item}
            </ListboxOption>
          ))}
        </div>
      </PopoverPanel>
    </div>
  );
}

const triggerOf = (id: Case) => document.querySelector(`[data-case="${id}"] [data-slot="trigger"]`) as HTMLElement;
const openPanel = () => document.querySelector('[data-slot="popover"]') as HTMLElement | null;
/** The trigger's visible layer: the button itself only holds its a11y name. */
const shownValue = (caseId: string) =>
  (
    (document.querySelector(`[data-case="${caseId}"] [aria-hidden="true"]`) as HTMLElement | null)
      ?.textContent ?? ""
  ).trim();
const activeOption = () => document.querySelector('[data-slot="listbox-option"][data-active="true"]');

async function clickOpen(id: Case) {
  const trigger = triggerOf(id);
  for (const type of ["mousedown", "mouseup", "click"]) {
    trigger.dispatchEvent(new MouseEvent(type, { bubbles: true }));
  }
  await frame();
  await frame();
}

async function closePanel() {
  press("Escape", document.activeElement as HTMLElement);
  await frame();
}

async function measure() {
  const result: Record<string, unknown> = {};
  // progress marks: if a step stalls, the last one written is the clue
  const mark = (step: string) => {
    document.getElementById("out")!.textContent = JSON.stringify({ step, ...result });
  };
  mark("start");

  // basic: geometry, focus, stepping
  await clickOpen("basic");
  {
    const trigger = triggerOf("basic");
    const panel = openPanel();
    if (!panel) {
      result.basic = { error: "no panel" };
    } else {
      const t = trigger.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      const focusInPanel = panel.contains(document.activeElement);
      press("ArrowDown", panel);
      await frame();
      const first = activeOption()?.id;
      press("ArrowDown", document.activeElement as HTMLElement);
      await frame();
      const second = activeOption()?.id;
      result.basic = {
        widthMatches: r(p.width) === r(t.width),
        gap: r(p.top - t.bottom),
        focusInPanel,
        first,
        second,
        stepped: first !== second,
      };
    }
  }
  mark("basic");
  await closePanel();

  // above: the panel opens upwards
  await clickOpen("above");
  {
    const t = triggerOf("above").getBoundingClientRect();
    const p = (openPanel() as HTMLElement).getBoundingClientRect();
    result.above = { gapAbove: r(t.top - p.bottom), flipped: p.bottom <= t.top + 1 };
  }
  mark("above");
  await closePanel();

  // scroll: the panel caps its height, scrolls, and keeps the active row in view
  await clickOpen("scroll");
  {
    const panel = openPanel() as HTMLElement;
    const scroller = panel.firstElementChild as HTMLElement;
    const before = scroller.scrollTop;
    press("End", panel);
    await frame();
    const active = activeOption() as HTMLElement | null;
    const panelRect = panel.getBoundingClientRect();
    const activeRect = active?.getBoundingClientRect();
    result.scroll = {
      panelHeight: r(panelRect.height),
      clientHeight: scroller.clientHeight,
      scrollHeight: scroller.scrollHeight,
      scrolls: scroller.scrollHeight > scroller.clientHeight,
      scrolled: scroller.scrollTop !== before,
      activeInView: activeRect ? activeRect.top >= panelRect.top - 1 && activeRect.bottom <= panelRect.bottom + 1 : null,
      active: active?.id ?? null,
    };
  }
  mark("scroll");
  await closePanel();

  // nofocus: the panel leaves focus alone
  await clickOpen("nofocus");
  {
    const panel = openPanel()!;
    result.nofocus = {
      focusInPanel: panel.contains(document.activeElement),
      focused: document.activeElement?.id || document.activeElement?.tagName,
    };
  }
  mark("nofocus");
  await closePanel();

  // disabled: navigation never lands on it
  await clickOpen("disabled");
  {
    const seen: Array<string | null> = [];
    for (let step = 0; step < 5; step += 1) {
      press("ArrowDown", (document.activeElement as HTMLElement) ?? openPanel());
      await frame();
      seen.push(activeOption()?.id ?? null);
    }
    result.disabled = { sequence: seen, everDisabled: seen.includes("disabled-3") };
  }
  mark("disabled");
  await closePanel();

  // Select: the component, choosing through two steps and Enter
  {
    const caseEl = document.querySelector('[data-case="select"]') as HTMLElement;
    const selectTrigger = caseEl.querySelector('[role="combobox"]') as HTMLElement;
    for (const type of ["mousedown", "mouseup", "click"]) {
      selectTrigger.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    await frame();
    const panel = openPanel()!;
    press("ArrowDown", panel);
    await frame();
    press("ArrowDown", document.activeElement as HTMLElement);
    await frame();
    press("Enter", document.activeElement as HTMLElement);
    await frame();
    result.select = {
      value: shownValue("select"),
      panelClosed: openPanel() === null,
      expanded: selectTrigger.getAttribute("aria-expanded"),
    };
  }
  mark("select");

  // Select, searchable: the field takes focus, filters, and Enter chooses
  {
    const caseEl = document.querySelector('[data-case="select-search"]') as HTMLElement;
    const searchTrigger = caseEl.querySelector('[role="combobox"]') as HTMLElement;
    for (const type of ["mousedown", "mouseup", "click"]) {
      searchTrigger.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    await frame();
    const panel = openPanel()!;
    const input = panel.querySelector("input") as HTMLInputElement;
    const focused = document.activeElement === input;
    const activeInfo = {
      tag: document.activeElement?.tagName,
      id: (document.activeElement as HTMLElement | null)?.id,
      slot: (document.activeElement as HTMLElement | null)?.getAttribute("data-slot"),
      placeholder: (document.activeElement as HTMLInputElement | null)?.placeholder,
      isPanel: document.activeElement === panel,
    };
    // React owns the input's value, so set it the way the browser would
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    setter.call(input, "sin");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await frame();
    const matches = panel.querySelectorAll('[data-slot="listbox-option"]').length;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await frame();
    result.search = {
      focused,
      shown: shownValue("select-search"),
      activeInfo,
      matches,
      chose: searchTrigger.textContent?.trim(),
      closed: openPanel() === null,
    };
  }
  mark("search");

  // Select, multiple: rows toggle, the panel stays open, the trigger counts
  {
    const caseEl = document.querySelector('[data-case="select-multiple"]') as HTMLElement;
    const multiTrigger = caseEl.querySelector('[role="combobox"]') as HTMLElement;
    for (const type of ["mousedown", "mouseup", "click"]) {
      multiTrigger.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    await frame();
    let panel = openPanel()!;
    const hasSearch = !!panel.querySelector("input");
    const rows = [...panel.querySelectorAll('[data-slot="listbox-option"]')] as HTMLElement[];
    rows[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await frame();
    panel = openPanel()!;
    rows[2]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await frame();
    result.multiple = {
      hasSearch,
      stillOpen: openPanel() !== null,
      summary: shownValue("select-multiple"),
      chosen: [...openPanel()!.querySelectorAll('[data-slot="listbox-option"][aria-selected="true"]')].length,
    };
  }
  mark("multiple");
  await closePanel();

  // Select, tags: chips in the trigger, a remove that leaves the panel closed
  {
    const caseEl = document.querySelector('[data-case="select-tags"]') as HTMLElement;
    const chipsBefore = caseEl.querySelectorAll('[data-slot="tag"]').length;
    const remove = caseEl.querySelector('[aria-label^="Remove"]') as HTMLElement;
    for (const type of ["mousedown", "mouseup", "click"]) {
      remove.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    await frame();
    result.tags = {
      chipsBefore,
      chipsAfter: caseEl.querySelectorAll('[data-slot="tag"]').length,
      remaining: shownValue("select-tags"),
    };
  }
  mark("tags");

  // two instances: each trigger controls its own panel
  await clickOpen("first");
  {
    const firstPanel = openPanel() as HTMLElement;
    result.first = {
      controls: triggerOf("first").getAttribute("aria-controls"),
      panelId: firstPanel.id,
      matches: triggerOf("first").getAttribute("aria-controls") === firstPanel.id,
    };
  }
  mark("first");
  await closePanel();
  await clickOpen("second");
  {
    const secondPanel = openPanel() as HTMLElement;
    result.second = {
      controls: triggerOf("second").getAttribute("aria-controls"),
      panelId: secondPanel.id,
      matches: triggerOf("second").getAttribute("aria-controls") === secondPanel.id,
      distinct: triggerOf("second").getAttribute("aria-controls") !== triggerOf("first").getAttribute("aria-controls"),
    };
  }
  await closePanel();

  document.getElementById("out")!.textContent = JSON.stringify(result);
}

function Probe() {
  return (
    <div>
      <ProbeSelect id="basic" />
      <div style={{ height: 700 }} />
      <ProbeSelect id="above" placement="top-start" />
      <ProbeSelect id="scroll" />
      <ProbeSelect id="nofocus" focus={false} />
      <ProbeSelect id="disabled" disabledIndex={3} />
      <div data-case="select">
        <Select options={COUNTRIES} />
      </div>
      <div data-case="select-search">
        <Select options={COUNTRIES} searchable />
      </div>
      <div data-case="select-multiple">
        <Select multiple options={COUNTRIES} />
      </div>
      <div data-case="select-tags">
        <Select multiple chips options={COUNTRIES} defaultValues={["id", "my"]} />
      </div>
      <ProbeSelect id="first" items={FRUIT.slice(0, 4)} />
      <ProbeSelect id="second" items={FRUIT.slice(4, 8)} />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <Probe />
    <Runner />
  </ThemeProvider>,
);

/** Runs the measurement once the probe tree has painted. */
function Runner() {
  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      measure().catch((error: unknown) => {
        document.getElementById("out")!.textContent = `ERROR: ${String(error)}`;
      });
    }, 100);
  }
  return null;
}
