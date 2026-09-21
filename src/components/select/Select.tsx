import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import type { Platform } from "@floating-ui/react";
import { cn } from "../../lib/cn";
import { CheckIcon, ChevronDownIcon, SearchLgIcon, XCircleIcon } from "../icon/icons";
import { fieldBorder, fieldBox, fieldFocus, fieldFocusColour, sizes } from "../input/chrome";
import { PopoverPanel, usePopover } from "../popover";
import { Chip } from "../chip";
import { SelectItem } from "./SelectItem";

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
   * The empty state's title, shown when a search matches nothing
   * @default "No teams found"
   */
  noResultsTitle?: string;

  /**
   * The empty state's hint, under the title
   * @default "Please try a different search term."
   */
  noResultsHint?: string;

  /**
   * The empty state's way out, which clears the search. An empty string hides it
   * @default "Clear search"
   */
  noResultsAction?: string;

  /**
   * The multiple panel's footer button that empties the selection
   * @default "Reset"
   */
  resetLabel?: string;

  /**
   * The multiple panel's footer button that adds every option in the list
   * @default "Select all"
   */
  selectAllLabel?: string;

  /**
   * Replaces the footer the sheets draw — Reset at the left, Select all at the
   * right. `null` renders no footer at all
   * @default undefined
   */
  footer?: ReactNode;

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
   * Open state. Give this and `onOpenChange` to control the panel
   * @default undefined
   */
  open?: boolean;

  /**
   * The initial open state, for uncontrolled use
   * @default undefined
   */
  defaultOpen?: boolean;

  /**
   * Runs with the next open state
   * @default undefined
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Where the panel is portalled. Left out it goes to the body; a layout that
   * must keep the panel beside its field passes the container it belongs in
   * @default undefined
   */
  portalRoot?: RefObject<HTMLElement | null>;

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
  open,
  defaultOpen,
  onOpenChange,
  portalRoot,
  disabled,
  error,
  leading,
  searchable,
  searchPlaceholder = "Search",
  noResultsTitle = "No teams found",
  noResultsHint = "Please try a different search term.",
  noResultsAction = "Clear search",
  resetLabel = "Reset",
  selectAllLabel = "Select all",
  footer,
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
  // floating-ui's virtual navigation writes the active row here; it must not be
  // the search field's own ref, or the field's node is replaced by a row.
  const virtualItemRef = useRef<HTMLElement | null>(null);
  const triggerId = useId();

  const matches = (option: SelectOption, text: string) =>
    `${option.label} ${option.description ?? ""}`.toLowerCase().includes(text.toLowerCase());
  const visible =
    withSearch && query ? options.filter((option) => matches(option, query)) : options;
  // A multiple select starts with no highlight; a single one starts on its value.
  const highlightedIndex = multiple ? -1 : visible.findIndex((option) => option.value === value);

  const popover = usePopover({
    role: "listbox",
    disabled,
    platform,
    open,
    defaultOpen,
    onOpenChange,
    listNavigation: {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
      loop: true,
      selectedIndex: highlightedIndex === -1 ? null : highlightedIndex,
      // With a search field the keys and the letters come from the input, so
      // navigation runs virtually: the highlight moves to the most relevant
      // row, the input announces it through aria-activedescendant, and the
      // caret never leaves the field.
      ...(withSearch
        ? {
            focusItemOnOpen: false,
            focusItemOnHover: false,
            virtual: true,
            virtualItemRef,
          }
        : null),
    },
    // With a search field, the letters belong to it, not to typeahead.
    typeahead: withSearch
      ? undefined
      : { listRef: labelsRef, activeIndex, onMatch: setActiveIndex },
  });

  // A fresh panel starts with no query, the way the sheets draw it.
  useEffect(() => {
    if (!popover.open) setQuery("");
  }, [popover.open]);

  function search(next: string) {
    setQuery(next);
    const nextVisible =
      withSearch && next ? options.filter((option) => matches(option, next)) : options;
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
    : (selected?.label ?? placeholder);
  const hasValue = multiple ? chosenValues.length > 0 : Boolean(value);
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

  // The footer's Reset: back to nothing selected, the search stays as it is.
  function resetValues() {
    if (controlledValues === undefined) setUncontrolledValues([]);
    onValuesChange?.([]);
  }

  // The footer's Select all: every option in the list right now — the filtered
  // matches under a search — joins the selection; chosen rows outside it stay.
  function selectAllVisible() {
    const next = Array.from(
      new Set([
        ...chosenValues,
        ...visible.filter((option) => !option.disabled).map((option) => option.value),
      ]),
    );
    if (controlledValues === undefined) setUncontrolledValues(next);
    onValuesChange?.(next);
  }

  const fieldId = id ?? triggerId;

  // The sheet insets the trigger's text 12 at sm and md and 14 at lg, and sets
  // the trailing mark's frame 10, 12 and 14 from the right edge — measured
  // across every chevron-bearing cell (69, zero variance) and, on the leading
  // side, off the avatar, which has no bearing to confound it.
  const leadingInset = size === "lg" ? "pl-3.5" : "pl-3";
  const trailingInset = { sm: "pr-2.5", md: "pr-3", lg: "pr-3.5" }[size];

  return (
    <div className={cn("relative", className)}>
      {name &&
        (multiple ? (
          chosenValues.map((chosen) => (
            <input key={chosen} type="hidden" name={name} value={chosen} readOnly />
          ))
        ) : (
          <input type="hidden" name={name} value={value ?? ""} readOnly />
        ))}

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
            leadingInset,
            showClear ? sizes[size].trailingPad : trailingInset,
          )}
        >
          {leading}
          {chips && chosenOptions.length > 0 ? (
            <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
              {chosenOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  leading={option.leading}
                  size={size}
                  onRemove={() => choose(option)}
                />
              ))}
            </span>
          ) : multiple ? (
            chosenValues.length > 0 ? (
              <span className="min-w-0 flex-1 truncate">{chosenValues.length} selected</span>
            ) : (
              <span className="min-w-0 flex-1 truncate text-placeholder">{placeholder}</span>
            )
          ) : selected ? (
            <span className="flex min-w-0 flex-1 items-baseline gap-2">
              <span className="truncate">{selected.label}</span>
              {selected.description && (
                <span className={cn("truncate text-neutral-600", sizes[size].supportingText)}>
                  {selected.description}
                </span>
              )}
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-placeholder">{placeholder}</span>
          )}
          {!clearable && (
            <ChevronDownIcon size={size === "lg" ? 20 : 16} className="shrink-0 text-neutral-600" />
          )}
        </span>

        {showClear && (
          <button
            type="button"
            aria-label="Clear"
            data-slot="clear"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              clear();
            }}
            className={cn(
              "absolute inset-y-0 flex items-center text-neutral-400 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              { sm: "right-3", md: "right-4", lg: "right-[18px]" }[size],
            )}
          >
            <XCircleIcon size={size === "sm" ? 10 : 12} />
          </button>
        )}
      </div>

      <PopoverPanel
        popover={popover}
        portalRoot={portalRoot}
        initialFocus={withSearch ? searchRef : undefined}
        aria-multiselectable={multiple || undefined}
        className={cn(
          "flex flex-col overflow-hidden rounded-md border bg-background shadow-md",
          multiple ? "max-h-[408px]" : "max-h-64",
          fieldBorder(error),
        )}
        onKeyDown={(event) => {
          // The search field owns Space — it types one. Enter chooses the
          // highlighted option from the input or the list alike.
          const typing = event.target === searchRef.current;
          if ((event.key === "Enter" || (!typing && event.key === " ")) && activeIndex !== null) {
            const option = visible[activeIndex];
            if (option) {
              event.preventDefault();
              choose(option);
            }
          }
        }}
      >
        {withSearch && (
          <div
            data-slot="search"
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 border-neutral-200",
              size === "lg" ? "px-3.5" : "px-3",
              searchRow[size],
            )}
          >
            <SearchLgIcon size={size === "sm" ? 16 : 20} className="shrink-0 text-neutral-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => search(event.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-placeholder focus:outline-none",
                sizes[size].text,
              )}
            />
          </div>
        )}

        <div data-slot="options" className="min-h-0 flex-1 overflow-auto py-1.5">
          {visible.length === 0
            ? (noResults ?? (
                <NoResults
                  onClear={() => search("")}
                  title={noResultsTitle}
                  hint={noResultsHint}
                  action={noResultsAction}
                />
              ))
            : visible.map((option, index) => (
                <SelectItem
                  key={option.value}
                  {...popover.getItemProps()}
                  ref={(node) => {
                    listRef.current[index] = node;
                    labelsRef.current[index] = option.label;
                  }}
                  id={`${fieldId}-option-${index}`}
                  label={option.label}
                  description={option.description}
                  leading={option.leading}
                  size={size}
                  checkbox={multiple}
                  selected={isChosen(option)}
                  active={activeIndex === index}
                  disabled={option.disabled}
                  onChoose={() => choose(option)}
                />
              ))}
        </div>
        {multiple &&
          // The sheet's footer: Reset at the panel's left edge, Select all at
          // its right, under a 2px divider — 44 tall at sm, 48 above. A
          // consumer's footer replaces it; null removes it.
          (footer === undefined ? (
          <div data-slot="footer" className="shrink-0 border-t-2 border-neutral-200 px-3 py-1.5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={resetValues}
                className={cn(
                  "rounded-md border border-neutral-300 bg-background px-4 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50",
                  size === "sm" ? "h-8" : "h-9",
                )}
              >
                {resetLabel}
              </button>
              <button
                type="button"
                onClick={selectAllVisible}
                className={cn(
                  "rounded-md border border-neutral-300 bg-background px-4 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50",
                  size === "sm" ? "h-8" : "h-9",
                )}
              >
                {selectAllLabel}
              </button>
            </div>
          </div>
          ) : (
            footer
          ))}

      </PopoverPanel>
    </div>
  );
}

/** The sheet's empty state: a boxed mark, a title, a hint, and a way out. */
function NoResults({
  onClear,
  title,
  hint,
  action,
}: {
  onClear: () => void;
  title: string;
  hint: string;
  action?: string;
}) {
  return (
    // Measured off the Search empty state cell: 18 under the search row, the
    // 32px box with 6px corners, the title 12 after it, the hint 4 after that,
    // the link 10 more, and 18 before the footer.
    <div data-slot="no-results" className="flex flex-col items-center px-6 pt-3 pb-3 text-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300">
        <SearchLgIcon size={16} className="text-neutral-400" />
      </span>
      <p className="mt-3 text-sm text-foreground">{title}</p>
      <p className="mt-1 text-sm text-neutral-600">{hint}</p>
      {action && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2.5 rounded-sm text-sm font-semibold text-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {action}
        </button>
      )}
    </div>
  );
}
