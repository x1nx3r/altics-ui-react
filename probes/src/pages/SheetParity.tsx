import { cloneElement, useEffect, useRef, useState } from "react";
import { Avatar, Field, Input, SearchLgIcon } from "@altics/ui";
import { Select, type SelectOption } from "../../../src/components/select";
import { SelectItem } from "../../../src/components/select/SelectItem";

/**
 * The sheets' grids on a canvas, drawn with the real components — nothing
 * here is a replica, so an Open cell is a genuinely open panel.
 *
 * The canvas zooms with CSS `zoom` rather than a transform: a transform scales
 * what you see but not the numbers floating-ui measures, so a portalled panel
 * would land in the wrong place. `zoom` keeps layout and measurement in step,
 * and every panel is portalled into the canvas itself so it scales with it.
 */

const COUNTRIES: SelectOption[] = [
  { value: "id", label: "Indonesia", description: "id" },
  { value: "my", label: "Malaysia", description: "my" },
  { value: "sg", label: "Singapore", description: "sg" },
  { value: "th", label: "Thailand", description: "th" },
];

const ITEM_TYPES = ["Default", "Avatar leading", "Dot leading", "Icon leading"] as const;
const ITEM_STATES = ["Default", "Hover", "Disabled"] as const;

const SIZES = ["sm", "md", "lg"] as const;
const TYPES = ["Default", "Search", "Tags", "Avatar leading", "Dot leading", "Icon leading"] as const;
const STATES = ["Default", "Placeholder", "Focused", "Open", "Disabled"] as const;
const MULTI_STATES = [
  "Default",
  "Active",
  "Focused",
  "Disabled",
  "Open default",
  "Open active",
  "Search empty state",
] as const;

type Size = (typeof SIZES)[number];
type Type = (typeof TYPES)[number];
type State = (typeof STATES)[number];

/**
 * The adornment the sheets draw for a type, at that size's own ramp: an avatar
 * is 20 at sm and 24 above, a dot 8 at sm and 10 above, an icon 16 up to md and
 * 20 at lg. Search and Tags lead the trigger with a magnifier on the same ramp.
 */
const leadFor = (type: Type, size: Size): React.ReactNode => {
  if (type === "Avatar leading") {
    return (
      <Avatar
        fallback="ID"
        alt="Indonesia"
        className={size === "sm" ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-[10px]"}
      />
    );
  }
  if (type === "Dot leading") {
    return (
      <span
        className={`rounded-full bg-neutral-400 ${size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"}`}
      />
    );
  }
  if (type === "Search" || type === "Tags" || type === "Icon leading") {
    return <SearchLgIcon size={size === "sm" ? 16 : 20} className="text-neutral-400" />;
  }
  return undefined;
};

/** The sheets give the Tags type a wider field than the others. */
const fieldWidth = (type: Type) => (type === "Tags" ? "w-[400px]" : "w-[320px]");

/** The panel a row is drawn in: the sheet shows menu items on white. */
function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[320px] rounded-md border border-neutral-300 bg-background py-1.5 shadow-md">
      {children}
    </div>
  );
}

/**
 * An Open cell draws its panel beside the field, the way the sheet does, and
 * only while the cell is on screen: floating-ui positions against the viewport,
 * and a trigger left off-screen gets its panel flipped or shifted into the pile
 * of cells that are visible. The panel is held open, so the cell always reads
 * as the sheet's Open state while you are looking at it.
 */
function OpenCell({ reserve, children }: { reserve: number; children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The margin defers opening until the cell is far enough above the bottom
    // edge for its panel to fit below the trigger — otherwise floating-ui
    // flips the panel up over the cells above.
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: `0px 0px -${reserve + 8}px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reserve]);

  return (
    <div ref={ref} style={{ minHeight: reserve }}>
      {cloneElement(children, { open: inView })}
    </div>
  );
}

function Caption({ children }: { children: string }) {
  return <p className="mb-1 text-[11px] font-semibold tracking-wide text-neutral-500">{children}</p>;
}

/** One cell of the sheets' select grid, with the panel really open. */
function SelectCell({
  size,
  type,
  state,
  portalRoot,
}: {
  size: Size;
  type: Type;
  state: State;
  portalRoot: React.RefObject<HTMLElement | null>;
}) {
  const multiple = type === "Tags";
  const props = {
    size,
    options: COUNTRIES,
    leading: leadFor(type, size),
    chips: multiple,
    clearable: type === "Search" || multiple,
    multiple,
    // The sheet's Search trigger filters nothing in its panel; only the
    // multi-select panel carries the search row.
    searchable: multiple,
    placeholder: "Placeholder",
    portalRoot,
    className: fieldWidth(type),
  } as const;

  const withValue = state !== "Placeholder" && state !== "Disabled";
  const chosen = withValue ? { defaultValue: multiple ? undefined : "id", defaultValues: multiple ? ["id", "my"] : undefined } : {};

  if (state === "Open") {
    // The panel hangs from the trigger, so the cell reserves its room — the
    // sheet draws the open panel as part of the cell.
    return (
      <OpenCell reserve={multiple ? 460 : 310}>
        <Select {...props} {...chosen} />
      </OpenCell>
    );
  }
  if (state === "Focused") {
    // Only one element can hold focus, so the cell carries the field's own ring.
    return (
      <div className="[&_[data-slot=select]]:outline [&_[data-slot=select]]:outline-2 [&_[data-slot=select]]:outline-offset-[-2px] [&_[data-slot=select]]:outline-focus">
        <Select {...props} {...chosen} />
      </div>
    );
  }
  return <Select {...props} {...chosen} disabled={state === "Disabled" || undefined} />;
}

function Toolbar({
  scale,
  onScale,
}: {
  scale: number;
  onScale: (scale: number) => void;
}) {
  const button = "rounded-sm border border-neutral-300 bg-background px-2 py-1 text-sm";
  return (
    <div className="fixed bottom-4 left-4 z-10 flex items-center gap-2 rounded-md border border-neutral-300 bg-background p-2 shadow-md">
      <button type="button" className={button} onClick={() => onScale(Math.max(0.25, scale - 0.1))}>
        −
      </button>
      <span className="w-12 text-center text-sm">{Math.round(scale * 100)}%</span>
      <button type="button" className={button} onClick={() => onScale(Math.min(2, scale + 0.1))}>
        +
      </button>
      <button type="button" className={button} onClick={() => onScale(1)}>
        100%
      </button>
      <button type="button" className={button} onClick={() => onScale(0.5)}>
        50%
      </button>
      <span className="ml-2 text-xs text-neutral-500">drag to pan · ⌘/ctrl + wheel to zoom</span>
    </div>
  );
}

/**
 * A press belongs to a control — the trigger, an option, the panel — and to the
 * canvas everywhere else. The selector decides both who pans and where the
 * cursor admits it.
 */
const INTERACTIVE = "button, input, textarea, select, a, [data-slot=select], [data-slot=popover]";

export default function SheetParity() {
  // 1:1 with the sheets — parity is the point, and floating-ui's flip and shift
  // math is exact only unzoomed.
  const [scale, setScale] = useState(1);
  const [pannable, setPannable] = useState(true);
  const canvas = useRef<HTMLDivElement>(null);
  const portalRoot = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: number; x: number; y: number; left: number; top: number } | null>(
    null,
  );

  // React registers wheel as passive, so a handler prop cannot stop the browser
  // from zooming with it. ctrl/⌘ + wheel zooms the canvas and only the canvas.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setScale((current) => Math.min(2, Math.max(0.25, current * (event.deltaY < 0 ? 1.1 : 0.9))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(event: React.PointerEvent) {
    const el = canvas.current;
    if (!el || (event.target as Element).closest(INTERACTIVE)) return;
    dragging.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: el.scrollLeft,
      top: el.scrollTop,
    };
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent) {
    const drag = dragging.current;
    const el = canvas.current;
    if (!el || !drag || event.pointerId !== drag.id) return;
    el.scrollLeft = drag.left - (event.clientX - drag.x);
    el.scrollTop = drag.top - (event.clientY - drag.y);
  }

  return (
    <div className="h-screen overflow-hidden bg-neutral-100">
      <div
        ref={canvas}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          dragging.current = null;
        }}
        onPointerCancel={() => {
          dragging.current = null;
        }}
        onPointerOver={(event) => setPannable(!(event.target as Element).closest(INTERACTIVE))}
        className={`h-full overflow-auto ${
          pannable ? "cursor-grab active:cursor-grabbing" : "cursor-auto"
        }`}
      >
        <div
          ref={portalRoot}
          style={{ zoom: scale }}
          className="relative w-max bg-background p-12"
        >
          <h1 className="text-2xl font-bold">Sheet parity</h1>
          <p className="mb-10 mt-1 max-w-3xl text-sm text-neutral-500">
            Every cell is the real component. An Open cell holds a genuinely open
            panel — portalled into the canvas so it zooms with it — while the cell
            is on screen. The sheet draws the Tags type on a 400-wide field.
          </p>

          {SIZES.map((size) => (
            <section key={size} className="mb-16">
              <h2 className="mb-6 text-lg font-semibold">select — Size={size}</h2>
              <div className="space-y-8">
                {TYPES.map((type) => (
                  <div key={type}>
                    <Caption>Type={type}</Caption>
                    <div className="flex items-start gap-10">
                      {STATES.map((state) => (
                        <div key={state} className={fieldWidth(type)}>
                          <p className="mb-1 text-[11px] text-neutral-400">State={state}</p>
                          <SelectCell size={size} type={type} state={state} portalRoot={portalRoot} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section className="mb-16">
            <h2 className="mb-6 text-lg font-semibold">multi-select</h2>
            {SIZES.map((size) => (
              <div key={size} className="mb-8">
                <Caption>Size={size}</Caption>
                <div className="flex items-start gap-10">
                  {MULTI_STATES.map((state) => {
                    const open = state.startsWith("Open");
                    const cell = (
                      <Select
                        multiple
                        searchable
                        size={size}
                        options={COUNTRIES}
                        placeholder="Placeholder"
                        portalRoot={portalRoot}
                        defaultValues={state === "Active" || open ? ["id", "my"] : undefined}
                        disabled={state === "Disabled" || undefined}
                      />
                    );
                    return (
                      <div key={state} className="w-[320px]">
                        <p className="mb-1 text-[11px] text-neutral-400">State={state}</p>
                        {open ? <OpenCell reserve={460}>{cell}</OpenCell> : cell}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <section className="mb-16">
            <h2 className="mb-6 text-lg font-semibold">select-menu-items</h2>
            {SIZES.map((size) => (
              <div key={size} className="mb-10">
                <Caption>Size={size}</Caption>
                <div className="space-y-6">
                  {[false, true].map((selected) => (
                    <div key={String(selected)}>
                      <p className="mb-2 text-[11px] text-neutral-400">Selected={String(selected)}</p>
                      <div className="flex items-start gap-8">
                        {ITEM_TYPES.map((type) => (
                          <div key={type}>
                            <p className="mb-1 text-[11px] text-neutral-400">Type={type}</p>
                            <div className="flex items-start gap-6">
                              {ITEM_STATES.map((state) => (
                                <div key={state}>
                                  <p className="mb-1 text-[11px] text-neutral-400">State={state}</p>
                                  <PanelShell>
                                    <SelectItem
                                      id={`item-${size}-${type}-${String(selected)}-${state}`}
                                      label="Option"
                                      description="Description"
                                      leading={leadFor(type, size)}
                                      size={size}
                                      selected={selected}
                                      active={state === "Hover"}
                                      disabled={state === "Disabled" || undefined}
                                    />
                                  </PanelShell>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="mb-16">
            <h2 className="mb-6 text-lg font-semibold">multi-select-menu-item</h2>
            {SIZES.map((size) => (
              <div key={size} className="mb-8">
                <Caption>Size={size}</Caption>
                <div className="flex items-start gap-6">
                  {ITEM_STATES.map((state) => (
                    <div key={state}>
                      <p className="mb-1 text-[11px] text-neutral-400">State={state}</p>
                      <PanelShell>
                        <SelectItem
                          id={`multi-item-${size}-${state}`}
                          checkbox
                          label="Option"
                          description="Description"
                          size={size}
                          active={state === "Hover"}
                          disabled={state === "Disabled" || undefined}
                        />
                      </PanelShell>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="mb-16">
            <h2 className="mb-6 text-lg font-semibold">Field usage</h2>
            <div className="flex items-start gap-10">
              <div className="w-[320px]">
                <Caption>label, hint</Caption>
                <Field label="Country" hint="Where the order ships.">
                  <Select options={COUNTRIES} portalRoot={portalRoot} placeholder="Choose one" />
                </Field>
              </div>
              <div className="w-[320px]">
                <Caption>required, error</Caption>
                <Field label="Country" required error="Choose a country">
                  <Select options={COUNTRIES} portalRoot={portalRoot} />
                </Field>
              </div>
              <div className="w-[320px]">
                <Caption>disabled</Caption>
                <Field label="Country">
                  <Select options={COUNTRIES} portalRoot={portalRoot} disabled defaultValue="id" />
                </Field>
              </div>
              <div className="w-[320px]">
                <Caption>multiple, with a hint</Caption>
                <Field label="Countries" hint="Choose as many as you like.">
                  <Select multiple options={COUNTRIES} portalRoot={portalRoot} />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-lg font-semibold">Input casing, side by side</h2>
            <div className="flex items-start gap-16">
              {SIZES.map((size) => (
                <div key={size}>
                  <Caption>Size={size}</Caption>
                  <div className="space-y-2">
                    <Input size={size} placeholder="Input" />
                    <Select
                      size={size}
                      options={COUNTRIES}
                      placeholder="Select"
                      portalRoot={portalRoot}
                      className="w-[320px]"
                    />
                    <Select
                      size={size}
                      options={COUNTRIES}
                      defaultValue="id"
                      portalRoot={portalRoot}
                      className="w-[320px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-[60vh]" />
        </div>
      </div>

      <Toolbar scale={scale} onScale={setScale} />
    </div>
  );
}
