import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Platform } from "@floating-ui/react";
import { cn } from "../../lib/cn";
import { CheckIcon, ChevronDownIcon, SearchLgIcon, XCircleIcon, XIcon } from "../icon/icons";
import { fieldBorder, fieldBox, fieldFocus, fieldFocusColour, sizes } from "../input/chrome";
import { ListboxOption } from "../listbox";
import { PopoverPanel, usePopover } from "../popover";

export type SelectOption = {
  /** What a form receives, and what `value` matches against */
  value: string;

  /** The line the trigger shows once chosen */
  label: string;

  /**
   * A quieter line beside the label, the way the sheets draw a subscribed
   * option — an email, a count, anything that tells two similar names apart
   * @default undefined
   */
  description?: string;

  /**
   * An adornment before the label — the sheets' Avatar, Dot and Icon leading
   * types. Size it at the call site: 24 for an avatar, 16 for an icon, 8 for a
   * dot
   * @default undefined
   */
  leading?: ReactNode;

  /**
   * Cannot be highlighted or chosen
   * @default undefined
   */
  disabled?: boolean;
};

export type SelectProps = {
  /**
   * The options, in the order the panel draws them
   * @default undefined
   */
  options: SelectOption[];

  /**
   * The chosen value. Give this and `onValueChange` to control the field
   * @default undefined
   */
  value?: string;

  /**
   * The value to start with, for uncontrolled use
   * @default undefined
   */
  defaultValue?: string;

  /**
   * Runs with the next value whenever one is chosen
   * @default undefined
   */
  onValueChange?: (value: string) => void;

  /**
   * Choose several options. The value props change with it: `values` and
   * `onValuesChange`. The panel keeps a search field, stays open while rows are
   * toggled, and every row carries a checkbox
   * @default false
   */
  multiple?: boolean;

  /**
   * The chosen values, for a multiple select. Give this and `onValuesChange` to
   * control the field
   * @default undefined
   */
  values?: string[];

  /**
   * The values to start with, for an uncontrolled multiple select
   * @default undefined
   */
  defaultValues?: string[];

  /**
   * Runs with the next set of values whenever one is toggled
   * @default undefined
   */
  onValuesChange?: (values: string[]) => void;

  /**
   * What the field shows while nothing is chosen, in the placeholder grey
   * @default "Select"
   */
  placeholder?: string;

  /**
   * Field size, following the input ramp: 36, 40 and 44 tall
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Leave the field inert
   * @default undefined
   */
  disabled?: boolean;

  /**
   * Error state, painted like every other field: red-300 at rest, red-500
   * focused. A string does the same and `Field` prints the string below
   * @default undefined
   */
  error?: string | boolean;

  /**
   * Content before the value: the sheets' types lead with an avatar, a dot or
   * an icon
   * @default undefined
   */
  leading?: ReactNode;

  /**
   * Put a search field at the top of the panel, filtering the options as it is
   * typed. The field takes focus when the panel opens, and the list keeps its
   * keyboard behaviour — arrows step, Enter chooses
   * @default false, and true with `multiple`, as the sheets draw it
   */
  searchable?: boolean;

  /**
   * The search field's placeholder
   * @default "Search"
   */
  searchPlaceholder?: string;

  /**
   * Replace the built-in empty state, which the sheets draw as a circled mark,
   * a title, a hint and a way to clear the search
   * @default undefined
   */
  noResults?: ReactNode;

  /**
   * Name for native form submission. The value is mirrored into a hidden input
   * @default undefined
   */
  name?: string;

  /**
   * Show the chosen options as chips in the trigger, which is the sheets' Tags
   * type: chips 24 tall with the option's own adornment, a label, and a remove
   * that takes that option back out. Only applies to `multiple`
   * @default false
   */
  chips?: boolean;

  /**
   * Clear the field from the trigger. The sheets' Search type is a leading mark
   * plus this: while a value is set it shows a clear mark; empty, it shows
   * nothing rather than a chevron
   * @default false
   */
  clearable?: boolean;

  /**
   * Extra classes for the field
   * @default undefined
   */
  className?: string;

  /**
   * The control's id. `Field` supplies one so its label can point at the field
   * @default undefined
   */
  id?: string;

  /**
   * Points at the hint or the error message. `Field` supplies it
   * @default undefined
   */
  "aria-describedby"?: string;

  /**
   * Marks the field required. `Field` supplies it
   * @default undefined
   */
  required?: boolean;

  /**
   * The platform floating-ui measures with. Left out in the browser; a test or
   * a non-DOM environment passes a deterministic one, because jsdom has no
   * layout and the DOM platform churns without it
   * @default undefined
   */
  platform?: Platform;
};

/** Rows step down at sm, and hover and chosen rows share one fill. */
const rowClass = {
  sm: "h-9 gap-2 pl-1.5 pr-3",
  md: "h-10 gap-3 pl-2 pr-3",
  lg: "h-11 gap-3 pl-2 pr-3",
};

const labelGap = { sm: "gap-1.5", md: "gap-2", lg: "gap-2" };

/** The search row's height, as the sheets draw it: 44, then 48 at lg. */
const searchRow = { sm: "h-11", md: "h-11", lg: "h-12" };

/**
 * Choose one option from a list.
 *
 * The trigger is the input's chassis without an input: same heights, insets,
 * border and ring, with the value in place of the text. The panel is the
 * listbox base — `role="listbox"` on the floating element, options focusable
 * but not tab stops — so the keys, typeahead, dismissal and focus return come
 * from there.
 *
 * @example
 * <Select options={[{ value: "id", label: "Indonesia" }]} placeholder="Country" />
 *
 * @example
 * // Searchable, filtered as it is typed
 * <Select searchable options={countries} />
 *
 * @example
 * // Inside a Field, which supplies the label, the hint and the error message
 * <Field label="Country" error="Required">
 *   <Select options={countries} />
 * </Field>
 */
export function Select({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  multiple = false,
  values: controlledValues,
  defaultValues,
  onValuesChange,
  placeholder = "Select",
  size = "md",
  disabled,
  error,
  leading,
  searchable,
  searchPlaceholder = "Search",
  chips = false,
  clearable = false,
  noResults,
  name,
  className,
  platform,
  id,
  "aria-describedby": describedBy,
  required,
}: SelectProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlledValue ?? uncontrolled;
  const [uncontrolledValues, setUncontrolledValues] = useState<string[]>(defaultValues ?? []);
  const chosenValues = controlledValues ?? uncontrolledValues;
  const isChosen = (option: SelectOption) =>
    multiple ? chosenValues.includes(option.value) : option.value === value;
  const withSearch = searchable ?? multiple;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = multiple || selectedIndex === -1 ? undefined : options[selectedIndex];

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(
    selectedIndex === -1 ? null : selectedIndex,
  );
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerId = useId();

  const matches = (option: SelectOption, text: string) =>
    `${option.label} ${option.description ?? ""}`.toLowerCase().includes(text.toLowerCase());
  const visible = withSearch && query ? options.filter((option) => matches(option, query)) : options;
  // A multiple select starts with no highlight; a single one starts on its value.
  const highlightedIndex = multiple ? -1 : visible.findIndex((option) => option.value === value);

  const popover = usePopover({
    role: "listbox",
    disabled,
    platform,
    listNavigation: {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
      loop: true,
      selectedIndex: highlightedIndex === -1 ? null : highlightedIndex,
      // With a search field the keys come from it, so focus stays there: the
      // navigation must not take it on open, nor follow the pointer.
      ...(withSearch ? { focusItemOnOpen: false, focusItemOnHover: false } : null),
    },
    // With a search field, the letters belong to it, not to typeahead.
    typeahead: withSearch ? undefined : { listRef: labelsRef, activeIndex, onMatch: setActiveIndex },
  });

  // A fresh panel starts with no query, the way the sheets draw it.
  useEffect(() => {
    if (!popover.open) setQuery("");
  }, [popover.open]);

  function search(next: string) {
    setQuery(next);
    const nextVisible = withSearch && next ? options.filter((option) => matches(option, next)) : options;
    setActiveIndex(nextVisible.length ? 0 : null);
  }

  function choose(option: SelectOption) {
    if (option.disabled) return;
    if (multiple) {
      // Toggling leaves the panel open, as the sheets draw it.
      const next = chosenValues.includes(option.value)
        ? chosenValues.filter((chosen) => chosen !== option.value)
        : [...chosenValues, option.value];
      if (controlledValues === undefined) setUncontrolledValues(next);
      onValuesChange?.(next);
      return;
    }
    if (controlledValue === undefined) setUncontrolled(option.value);
    onValueChange?.(option.value);
    popover.setOpen(false);
  }

  const chosenOptions = options.filter((option) => chosenValues.includes(option.value));
  const accessibleValue = multiple
    ? chosenOptions.map((option) => option.label).join(", ") || placeholder
    : selected?.label ?? placeholder;
  const hasValue = multiple ? chosenValues.length > 0 : Boolean(value);

  /** One chosen option in the trigger: adornment, label, and a remove. */
  const chipFor = (option: SelectOption) => (
    <span
      key={option.value}
      data-slot="select-chip"
      className="flex h-6 max-w-full shrink-0 select-none items-center gap-1 rounded-sm border border-neutral-300 bg-background pr-1.5 pl-1"
    >
      {option.leading}
      <span className="min-w-0 truncate text-sm text-neutral-700">{option.label}</span>
      <button
        type="button"
        aria-label={`Remove ${option.label}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.stopPropagation();
          choose(option);
        }}
        className="pointer-events-auto flex items-center text-neutral-600 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <XIcon size={12} />
      </button>
    </span>
  );
  const showClear = clearable && hasValue && !disabled;

  function clear() {
    if (multiple) {
      if (controlledValues === undefined) setUncontrolledValues([]);
      onValuesChange?.([]);
      return;
    }
    if (controlledValue === undefined) setUncontrolled("");
    onValueChange?.("");
  }

  const fieldId = id ?? triggerId;

  return (
    <div className={cn("relative", className)}>
      {name &&
        (multiple
          ? chosenValues.map((chosen) => (
              <input key={chosen} type="hidden" name={name} value={chosen} readOnly />
            ))
          : <input type="hidden" name={name} value={value ?? ""} readOnly />)}

      <div
        data-slot="select"
        data-disabled={disabled || undefined}
        data-invalid={error ? true : undefined}
        className={cn(
          fieldBox,
          "relative w-full rounded-md border",
          sizes[size].box,
          fieldBorder(error),
          fieldFocus,
          fieldFocusColour(error),
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {/* The button is bare and sits under the layer: the layer cannot hold
            the trigger's own controls, and a button cannot hold buttons. */}
        <button
          ref={popover.refs.setReference as never}
          id={fieldId}
          type="button"
          disabled={disabled}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="absolute inset-0 w-full rounded-md focus:outline-none"
          {...popover.getReferenceProps()}
        >
          <span className="sr-only">{accessibleValue}</span>
        </button>

        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center gap-2",
            showClear ? "pr-9 pl-3" : "px-3",
          )}
        >
          {leading}
          {chips && chosenOptions.length > 0 ? (
            <span className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              {chosenOptions.map(chipFor)}
            </span>
          ) : multiple ? (
            chosenValues.length > 0 ? (
              <span className="truncate">{chosenValues.length} selected</span>
            ) : (
              <span className="truncate text-placeholder">{placeholder}</span>
            )
          ) : selected ? (
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate">{selected.label}</span>
              {selected.description && (
                <span className="truncate text-neutral-600">{selected.description}</span>
              )}
            </span>
          ) : (
            <span className="truncate text-placeholder">{placeholder}</span>
          )}
          {!clearable && <ChevronDownIcon size={16} className="shrink-0 text-neutral-600" />}
        </span>

        {showClear && (
          <button
            type="button"
            aria-label="Clear"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              clear();
            }}
            className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <XCircleIcon size={16} />
          </button>
        )}
      </div>

      <PopoverPanel
        popover={popover}
        initialFocus={withSearch ? searchRef : undefined}
        aria-multiselectable={multiple || undefined}
        className={cn(
          "flex flex-col overflow-hidden rounded-md border bg-background shadow-md",
          multiple ? "max-h-[408px]" : "max-h-64",
          fieldBorder(error),
        )}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && activeIndex !== null) {
            const option = visible[activeIndex];
            if (option) choose(option);
          }
        }}
      >
        {withSearch && (
          <div
            className={cn(
              "flex shrink-0 items-center gap-2 border-b border-neutral-200 px-3.5",
              searchRow[size],
            )}
          >
            <SearchLgIcon size={16} className="shrink-0 text-neutral-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => search(event.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-placeholder focus:outline-none"
            />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-auto py-1.5">
          {visible.length === 0 ? (
            noResults ?? <NoResults onClear={() => search("")} />
          ) : (
            visible.map((option, index) => (
              <ListboxOption
                key={option.value}
                {...popover.getItemProps({ onClick: () => choose(option) })}
                ref={(node) => {
                  listRef.current[index] = node;
                  labelsRef.current[index] = option.label;
                }}
                id={`${fieldId}-option-${index}`}
                active={activeIndex === index}
                selected={isChosen(option)}
                disabled={option.disabled}
                className={cn(
                  "mx-1.5 flex cursor-default items-center rounded-sm text-base text-foreground",
                  multiple ? "gap-2" : "justify-between",
                  rowClass[size],
                  // the sheet fills the chosen row the same grey as a hovered one
                  ((!multiple && option.value === value) || (multiple && activeIndex === index)) &&
                    "bg-neutral-50",
                  option.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                {multiple && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-xs border",
                      isChosen(option)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-neutral-300",
                    )}
                  >
                    {isChosen(option) && <CheckIcon size={10} />}
                  </span>
                )}
                {option.leading}
                <span className={cn("flex min-w-0 items-baseline", labelGap[size])}>
                  <span className="truncate">{option.label}</span>
                  {option.description && (
                    <span className="truncate text-neutral-600">{option.description}</span>
                  )}
                </span>
                {!multiple && option.value === value && (
                  <CheckIcon size={16} className="shrink-0 text-neutral-600" />
                )}
              </ListboxOption>
            ))
          )}
        </div>
      </PopoverPanel>
    </div>
  );
}

/** The sheet's empty state: a circled mark, a title, a hint, and a way out. */
function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-7 text-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300">
        <SearchLgIcon size={16} className="text-neutral-400" />
      </span>
      <p className="mt-4 text-sm text-foreground">No results</p>
      <p className="mt-1 text-sm text-neutral-600">Try a different search.</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 rounded-sm text-sm text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Clear search
      </button>
    </div>
  );
}
