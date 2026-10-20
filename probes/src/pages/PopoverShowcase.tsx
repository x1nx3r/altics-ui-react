import { useRef, useState, type ReactNode } from "react";
import { Avatar, ChevronDownIcon, Field, SearchLgIcon } from "@altics/ui";
import { Select } from "../../../src/components/select";
import { PopoverPanel, usePopover, type UsePopoverOptions } from "../../../src/components/popover";
import { ListboxOption } from "../../../src/components/listbox";

const DOT = <span className="h-2 w-2 rounded-full bg-neutral-400" />;
const avatar = (label: string) => (
  <Avatar fallback={label.slice(0, 2).toUpperCase()} alt={label} className="h-4 w-4 text-[10px]" />
);

const COUNTRIES = [
  { value: "id", label: "Indonesia", description: "id" },
  { value: "my", label: "Malaysia", description: "my" },
  { value: "sg", label: "Singapore", description: "sg" },
  { value: "th", label: "Thailand", description: "th" },
  { value: "ph", label: "Philippines", description: "ph", disabled: true },
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

const rowClass = (active: boolean, selected: boolean) =>
  [
    "flex h-10 cursor-default items-center justify-between gap-3 rounded-sm px-3 text-base text-foreground",
    active ? "bg-neutral-50" : "",
    selected ? "font-medium" : "",
  ]
    .filter(Boolean)
    .join(" ");

/**
 * One select built from the bases. Everything here is real: the panel is
 * anchored and kept in view, the options are a listbox, the keys step through
 * them, typeahead jumps, and focus returns to the trigger on close.
 */
function BaseSelect({
  label,
  items = FRUIT,
  disabledIndex,
  focus = true,
  placement,
  maxHeight = 256,
  open: controlledOpen,
  onOpenChange,
  defaultOpen,
}: {
  label: string;
  items?: string[];
  disabledIndex?: number;
  focus?: boolean;
  placement?: UsePopoverOptions["placement"];
  maxHeight?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const popover = usePopover({
    role: "listbox",
    placement,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
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
    <div>
      <p className="mb-1 text-xs font-semibold opacity-70">{label}</p>
      <button
        ref={popover.refs.setReference as never}
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border border-neutral-300 bg-background px-3 text-left text-base text-foreground"
        {...popover.getReferenceProps()}
      >
        <span className="truncate">{items[selectedIndex ?? 0]}</span>
        <ChevronDownIcon size={16} />
      </button>

      <PopoverPanel
        popover={popover}
        className="rounded-md border border-neutral-300 bg-background p-1 shadow-md"
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && activeIndex !== null) {
            setSelectedIndex(activeIndex);
          }
        }}
      >
        <div style={{ maxHeight, overflow: "auto" }}>
          {items.map((item, index) => (
            <ListboxOption
              key={item}
              {...popover.getItemProps({
                onClick: () => setSelectedIndex(index),
              })}
              ref={(node) => {
                listRef.current[index] = node;
                labelsRef.current[index] = item;
              }}
              id={`${label}-${index}`.replace(/\s+/g, "-").toLowerCase()}
              active={activeIndex === index}
              selected={selectedIndex === index}
              disabled={index === disabledIndex}
              className={rowClass(activeIndex === index, selectedIndex === index)}
            >
              <span>{item}</span>
              {selectedIndex === index && <span aria-hidden="true">✓</span>}
            </ListboxOption>
          ))}
        </div>
      </PopoverPanel>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-neutral-300 p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mb-4 mt-1 text-xs opacity-70">{hint}</p>
      {children}
    </section>
  );
}

export default function PopoverShowcase({
  dark,
  onToggleDark,
}: {
  dark: boolean;
  onToggleDark: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background p-10 text-foreground">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold">Select bases</h1>
        <span className="flex-1" />
        <button className="text-sm" onClick={onToggleDark}>
          {dark ? "🌙 dark" : "☀️ light"}
        </button>
      </div>

      <p className="mb-8 max-w-2xl text-sm opacity-70">
        Popover + ListboxOption, no Select yet. Not here yet: multiple selection,
        search inside the panel, the six trigger types, the two-line value, sizes.
      </p>

      <div className="grid grid-cols-2 gap-8 xl:grid-cols-3">
        <Card
          title="Select"
          hint="The component the bases were built for: single choice, sizes, disabled, error, and Field wiring. Label plus description, the selected check, and a hidden input for forms."
        >
          <div className="space-y-4">
            <Select options={COUNTRIES} placeholder="Country" />
            <Select options={COUNTRIES} defaultValue="id" size="sm" />
            <Select options={COUNTRIES} defaultValue="my" size="lg" disabled />
            <Field label="Country" required error="Choose one">
              <Select options={COUNTRIES} />
            </Field>
          </div>
        </Card>

        <Card
          title="Searchable"
          hint="The panel carries a search field, as the sheets' multi-select draws one: it takes focus on open, filters as it is typed, keeps the keys working, and shows the sheet's empty state — circled mark, title, hint, clear."
        >
          <Select options={COUNTRIES} searchable placeholder="Country" />
        </Card>

        <Card
          title="Multiple"
          hint="The sheets' multi-select: a search field at the top, a checkbox on every row, the panel stays open while rows are toggled, and the trigger carries a count. Each value is mirrored into its own hidden input."
        >
          <Select multiple options={COUNTRIES} placeholder="Countries" />
        </Card>

        <Card
          title="Search type"
          hint="The sheet's Search trigger: a leading mark and a clear that appears only with a value — no chevron. It can also search inside the panel."
        >
          <div className="space-y-4">
            <Select
              options={COUNTRIES}
              leading={<SearchLgIcon size={16} className="text-neutral-400" />}
              clearable
              placeholder="Search country"
            />
            <Select
              options={COUNTRIES}
              leading={<SearchLgIcon size={16} className="text-neutral-400" />}
              clearable
              searchable
              defaultValue="id"
            />
          </div>
        </Card>

        <Card
          title="Leading types"
          hint="Avatar, Dot and Icon leading are the leading slot. Options carry their own adornment too, as the sheets' menu-item types do."
        >
          <div className="space-y-4">
            <Select
              options={[{ ...COUNTRIES[0], leading: <Avatar fallback="ID" alt="Indonesia" className="h-6 w-6" /> }, ...COUNTRIES.slice(1)]}
              defaultValue="id"
            />
            <Select options={[{ ...COUNTRIES[1], leading: DOT }, ...COUNTRIES.slice(2)]} defaultValue="my" />
            <Select
              options={[{ ...COUNTRIES[2], leading: <SearchLgIcon size={16} className="text-neutral-400" /> }, ...COUNTRIES.slice(3)]}
              defaultValue="sg"
            />
          </div>
        </Card>

        <Card
          title="Tags type"
          hint="The sheet's Tags trigger: chips 24 tall, each carrying its option's adornment, a label and a remove — plus a clear at the end. Removing takes one option back out without opening the panel."
        >
          <Select
            multiple
            chips
            searchable
            clearable
            leading={<SearchLgIcon size={16} className="text-neutral-400" />}
            placeholder="Countries"
            defaultValue={["id", "my"]}
            options={COUNTRIES.map((country) => ({ ...country, leading: avatar(country.label) }))}
          />
        </Card>

        <Card
          title="Keyboard, typeahead, scrolling"
          hint="Arrows step, Home/End jump, a letter jumps to a match, Enter selects. Twelve items scroll inside the panel and the active one stays in view."
        >
          <BaseSelect label="Fruit" />
        </Card>

        <Card
          title="Disabled option"
          hint="Damson cannot be highlighted or chosen: the keys step over it and a click does nothing."
        >
          <BaseSelect label="Fruit, one disabled" disabledIndex={3} />
        </Card>

        <Card
          title="Placement"
          hint="Same list, opened upwards. floating-ui flips and shifts it to stay in view."
        >
          <BaseSelect label="Fruit, above" placement="top-start" />
        </Card>

        <Card
          title="No focus"
          hint="The panel keeps its hands off focus: pointer only, so the page's own focus is untouched."
        >
          <BaseSelect label="Fruit, no focus" focus={false} />
        </Card>

        <Card
          title="Controlled open"
          hint="The caller owns the state; the trigger only reports."
        >
          <div className="space-y-3">
            <BaseSelect label="Fruit, controlled" open={open} onOpenChange={setOpen} />
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-sm border border-neutral-300 px-3 py-1 text-sm"
                onClick={() => setOpen((value) => !value)}
              >
                {open ? "Close" : "Open"} from outside
              </button>
            </div>
          </div>
        </Card>

        <Card
          title="Two at once"
          hint="Each instance wires its own ids, so the trigger of one never points at the panel of the other."
        >
          <div className="space-y-4">
            <BaseSelect label="First" items={FRUIT.slice(0, 4)} />
            <BaseSelect label="Second" items={FRUIT.slice(4, 8)} />
          </div>
        </Card>
      </div>
    </main>
  );
}
