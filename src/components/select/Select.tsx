import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEventHandler,
  type ReactNode,
  type RefObject,
} from "react";
import type { Platform } from "@floating-ui/react";
import { cn } from "../../lib/cn";
import { Spinner } from "../display";
import { CheckIcon, ChevronDownIcon, SearchLgIcon, XCircleIcon } from "../icon/icons";
import { fieldBorder, fieldBox, fieldFocus, fieldFocusColour, sizes } from "../input/chrome";
import { PopoverPanel, usePopover } from "../popover";
import { Chip } from "../chip";
import { SelectItem } from "./SelectItem";

/**
 * Per-part classes for the select, keyed by the data-slot each part emits.
 * Values merge over the sheet's classes through `cn()` — geometry cannot be
 * removed, only extended. State styling stays on the attribute selectors the
 * slots already carry.
 */
export type SelectClassNames = Partial<
  Record<"select" | "search" | "options" | "footer" | "no-results" | "clear" | "loading", string>
>;

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

export type SelectProps<T = SelectOption> = {
  /**
   * The options, in the order the panel draws them
   * @default undefined
   */
  options: readonly T[];

  /**
   * Reads the identity a choice is stored under. Required when the options
   * aren't SelectOption-shaped
   * @default (option) => option.value
   */
  getOptionValue?: (option: T) => string;

  /**
   * Reads the text the trigger and the rows render
   * @default (option) => option.label
   */
  getOptionLabel?: (option: T) => string;

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
   * Locked but present: the panel never opens and the clear disappears, yet
   * the field stays focusable and the value still submits — unlike disabled,
   * which fades the field and blocks submission
   * @default false
   */
  readOnly?: boolean;

  /**
   * Caps how many options a multiple select may hold. Choosing past the cap
   * does nothing, and Select all fills up to it
   * @default undefined
   */
  maxSelectedValues?: number;

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
   * The search text, when the caller owns it. Left out, the field keeps its
   * own and resets when the panel closes
   * @default undefined
   */
  query?: string;

  /**
   * The search text the panel starts with
   * @default ""
   */
  defaultQuery?: string;

  /**
   * Runs with the next search text as it changes
   * @default undefined
   */
  onQueryChange?: (query: string) => void;

  /**
   * Replaces the built-in matcher — case-insensitive over the label and the
   * description. `false` hands filtering to the backend: the options render
   * as given, whatever the field contains
   * @default undefined
   */
  filter?: false | ((option: T, query: string) => boolean);

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
   * Replaces Select all's behaviour — a backend trigger selecting every
   * matching row, most of them never fetched. Left out, the button selects
   * every option in the list
   * @default undefined
   */
  onSelectAll?: () => void;

  /**
   * Replaces Reset's behaviour — a backend trigger. Left out, the button
   * empties the selection
   * @default undefined
   */
  onReset?: () => void;

  /**
   * The options are on their way — the panel shows a loading row instead of
   * the list or the empty state
   * @default false
   */
  loading?: boolean;

  /**
   * The loading row's text
   * @default "Loading…"
   */
  loadingLabel?: string;

  /**
   * Runs when the bottom of the list comes into view — by scroll, or by the
   * highlighted row reaching it — so the next page can be fetched. Stop the
   * asks with `hasMore`
   * @default undefined
   */
  onLoadMore?: () => void;

  /**
   * Whether more pages exist. When false, or while loading, the sentinel
   * stops asking
   * @default undefined
   */
  hasMore?: boolean;

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
   * Runs when the trigger gains focus
   * @default undefined
   */
  onFocus?: FocusEventHandler<HTMLButtonElement>;

  /**
   * Runs when the trigger loses focus
   * @default undefined
   */
  onBlur?: FocusEventHandler<HTMLButtonElement>;

  /**
   * Focuses the trigger on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Choosing the already-chosen option on a single select clears it. Disable
   * to keep the value on re-choose
   * @default true
   */
  allowDeselect?: boolean;

  /**
   * Hides chosen options from the list, so a multiple select only offers what
   * is not yet picked
   * @default false
   */
  hideSelectedOptions?: boolean;

  /**
   * Commits the highlighted option when the search field loses focus to
   * somewhere outside the panel. Single select only
   * @default false
   */
  autoSelectOnBlur?: boolean;

  /**
   * Commits the highlighted option on Tab, before focus moves on
   * @default false
   */
  tabSelectsValue?: boolean;

  /**
   * Opens the panel when the trigger gains focus
   * @default false
   */
  openOnFocus?: boolean;

  /**
   * Opens and closes the panel on trigger click. Disable to drive the panel
   * from `open` alone
   * @default true
   */
  openMenuOnClick?: boolean;

  /**
   * Closes the panel when an option is chosen. Defaults to closing on single
   * and staying open on multiple; set explicitly to override either way
   * @default !multiple
   */
  closeOnSelect?: boolean;

  /**
   * Runs with the highlighted option — or null when nothing is — as the
   * highlight moves by keyboard or pointer. A preview pane's hook
   * @default undefined
   */
  onHighlightChange?: (option: T | null) => void;

  /**
   * Replaces the clear button's mark
   * @default an XCircle on the size ramp
   */
  clearIcon?: ReactNode;

  /**
   * Names the clear button for assistive technology
   * @default "Clear"
   */
  clearLabel?: string;

  /**
   * Classes for the panel's parts, merged over the sheet's own — the typed
   * front door to the data-slots. State stays on the attributes the slots
   * already carry (`data-selected`, `aria-expanded`), so these are plain
   * strings, never state callbacks
   * @default undefined
   */
  classNames?: SelectClassNames;

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
export function Select<T = SelectOption>({
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
  readOnly,
  maxSelectedValues,
  error,
  leading,
  searchable,
  searchPlaceholder = "Search",
  query: queryProp,
  defaultQuery,
  onQueryChange,
  noResultsTitle = "No teams found",
  noResultsHint = "Please try a different search term.",
  noResultsAction = "Clear search",
  resetLabel = "Reset",
  selectAllLabel = "Select all",
  loading = false,
  loadingLabel = "Loading…",
  onLoadMore,
  hasMore,
  filter,
  onSelectAll,
  onReset,
  footer,
  getOptionValue,
  getOptionLabel,
  chips = false,
  clearable = false,
  noResults,
  name,
  className,
  platform,
  id,
  "aria-describedby": describedBy,
  required,
  onFocus,
  onBlur,
  autoFocus,
  allowDeselect = true,
  hideSelectedOptions = false,
  autoSelectOnBlur = false,
  tabSelectsValue = false,
  openOnFocus = false,
  openMenuOnClick = true,
  closeOnSelect = !multiple,
  onHighlightChange,
  clearIcon,
  clearLabel = "Clear",
  classNames = {},
}: SelectProps<T>) {
  // The identity and label resolvers. With the default SelectOption shape they
  // read the fields; with domain-shaped options the caller supplies them, and
  // the remaining fields are read through the same shape.
  const valueOf = getOptionValue ?? ((option: T) => (option as SelectOption).value);
  const labelOf = getOptionLabel ?? ((option: T) => (option as SelectOption).label);
  const asOption = (option: T) => option as SelectOption;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlledValue ?? uncontrolled;
  const [uncontrolledValues, setUncontrolledValues] = useState<string[]>(defaultValues ?? []);
  const chosenValues = controlledValues ?? uncontrolledValues;
  const isChosen = (option: T) =>
    multiple ? chosenValues.includes(valueOf(option)) : valueOf(option) === value;
  const withSearch = searchable ?? multiple;

  // The options belong to the backend. Guard the shape, then warn on the two
  // contracts a malformed list would quietly break: string values (the
  // selection compares strictly) and unique values (duplicate keys and an
  // ambiguous selection).
  const list = Array.isArray(options) ? options : [];
  if (process.env.NODE_ENV !== "production") {
    if (!Array.isArray(options)) {
      console.error("[altics-ui] Select: options must be an array.");
    }
    const seen = new Set<string>();
    for (const option of list) {
      const value = valueOf(option);
      if (typeof value !== "string") {
        console.error(
          `[altics-ui] Select: option values must be strings; got ${typeof value}. The selection compares values strictly.`,
        );
      }
      if (seen.has(value)) {
        console.error(
          `[altics-ui] Select: two options share the value ${JSON.stringify(String(value))}. The selection is ambiguous.`,
        );
      }
      seen.add(value);
    }
  }

  const selectedIndex = list.findIndex((option) => valueOf(option) === value);
  const selected = multiple || selectedIndex === -1 ? undefined : list[selectedIndex];

  // Chosen values the list doesn't contain — a deleted record, or a fetch still
  // in flight — stay visible as themselves instead of hiding behind the
  // placeholder, because the form is about to submit them.
  const knownValues = new Set(list.map((option) => valueOf(option)));
  const unknownChosen = chosenValues.filter((chosen) => !knownValues.has(chosen));

  const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultQuery ?? "");
  const query = queryProp ?? uncontrolledQuery;
  const [activeIndex, setActiveIndex] = useState<number | null>(
    selectedIndex === -1 ? null : selectedIndex,
  );
  // The options belong to the backend: when the list changes under an open
  // panel, the highlight restarts at the top rather than pointing at a stale
  // row. Guarded by the previous length, so the mount keeps its chosen
  // highlight. Same reset a search performs.
  const previousLength = useRef(list.length);
  useEffect(() => {
    if (popover.open && previousLength.current !== list.length) {
      setHighlight(visible.length ? 0 : null);
    }
    previousLength.current = list.length;
  });
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  // Set on an Escape that closes the panel, so the blur it causes does not
  // commit through autoSelectOnBlur. Consumed and cleared on every blur.
  const escapeDismissed = useRef(false);
  const optionsRegionRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // floating-ui's virtual navigation writes the active row here; it must not be
  // the search field's own ref, or the field's node is replaced by a row.
  const virtualItemRef = useRef<HTMLElement | null>(null);
  const triggerId = useId();

  const matches = (option: T, text: string) => {
    if (filter === false) return true;
    if (filter) return filter(option, text);
    const o = asOption(option);
    return `${labelOf(option)} ${o.description ?? ""}`.toLowerCase().includes(text.toLowerCase());
  };
  const visible = (withSearch && query ? list.filter((option) => matches(option, query)) : list).filter(
    (option) => !hideSelectedOptions || !isChosen(option),
  );
  // A multiple select starts with no highlight; a single one starts on its value.
  const highlightedIndex = multiple ? -1 : visible.findIndex((option) => valueOf(option) === value);
  // The highlight's single exit: state plus the observer, so a preview pane
  // can follow the caret by keyboard or pointer alike.
  const setHighlight = (index: number | null) => {
    setActiveIndex(index);
    onHighlightChange?.(index === null ? null : (visible[index] ?? null));
  };

  const popover = usePopover({
    role: "listbox",
    disabled: disabled || readOnly,
    platform,
    open,
    defaultOpen,
    onOpenChange,
    openOnTriggerClick: openMenuOnClick,
    listNavigation: {
      listRef,
      activeIndex,
      onNavigate: setHighlight,
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
      : { listRef: labelsRef, activeIndex, onMatch: setHighlight },
  });

  // A fresh panel starts with no query, the way the sheets draw it.
  useEffect(() => {
    if (!popover.open && queryProp === undefined) setUncontrolledQuery(defaultQuery ?? "");
  }, [popover.open]);

  // The sentinel asks for the next page when the bottom of the list comes into
  // view — by scroll, or by the highlighted row scrolling it into view, which
  // covers keyboard users with the same mechanism. No dependency list: every
  // render reconnects against the latest nodes, and while a page is loading the
  // sentinel is gone, so the asks cannot double-fire.
  useEffect(() => {
    const region = optionsRegionRef.current;
    const sentinel = sentinelRef.current;
    if (!onLoadMore || !hasMore || loading || !region || !sentinel) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root: region, rootMargin: "0px 0px 40px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  });

  function search(next: string) {
    if (queryProp === undefined) setUncontrolledQuery(next);
    onQueryChange?.(next);
    const nextVisible = (withSearch && next ? list.filter((option) => matches(option, next)) : list).filter(
      (option) => !hideSelectedOptions || !isChosen(option),
    );
    setHighlight(nextVisible.length ? 0 : null);
  }

  function choose(option: T) {
    if (asOption(option).disabled) return;
    if (multiple) {      // Toggling leaves the panel open, as the sheets draw it. The cap refuses
      // additions silently — the count keeps telling the truth.
      const chosen = valueOf(option);
      const already = chosenValues.includes(chosen);
      if (!already && maxSelectedValues !== undefined && chosenValues.length >= maxSelectedValues) {
        return;
      }
      const next = already
        ? chosenValues.filter((value) => value !== chosen)
        : [...chosenValues, chosen];
      if (controlledValues === undefined) setUncontrolledValues(next);
      onValuesChange?.(next);
      if (closeOnSelect) popover.setOpen(false);
      return;
    }
    if (controlledValue === undefined) {
      // Re-choosing the chosen value clears a single select, unless the
      // caller keeps it.
      setUncontrolled(allowDeselect && valueOf(option) === value ? "" : valueOf(option));
    }
    onValueChange?.(allowDeselect && valueOf(option) === value ? "" : valueOf(option));
    if (closeOnSelect) popover.setOpen(false);
  }

  const chosenOptions = list.filter((option) => chosenValues.includes(valueOf(option)));
  const accessibleValue = multiple
    ? [...chosenOptions.map((option) => labelOf(option)), ...unknownChosen.map(String)].join(
        ", ",
      ) || placeholder
    : selected !== undefined
      ? labelOf(selected)
      : value
        ? String(value)
        : placeholder;
  const hasValue = multiple ? chosenValues.length > 0 : Boolean(value);
  const showClear = clearable && hasValue && !disabled && !readOnly;

  function clear() {
    if (multiple) {
      if (controlledValues === undefined) setUncontrolledValues([]);
      onValuesChange?.([]);
      return;
    }
    if (controlledValue === undefined) setUncontrolled("");
    onValueChange?.("");
  }

  // Drops one value by identity — how a fallback chip for an unknown chosen
  // value removes itself, without an option object to choose.
  function removeValue(value: string) {
    const next = chosenValues.filter((chosen) => chosen !== value);
    if (controlledValues === undefined) setUncontrolledValues(next);
    onValuesChange?.(next);
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
        ...visible
          .filter((option) => !asOption(option).disabled)
          .map((option) => valueOf(option))
          .filter((value) => !chosenValues.includes(value))
          .slice(0, Math.max(0, (maxSelectedValues ?? Infinity) - chosenValues.length)),
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
        data-readonly={readOnly || undefined}
        data-invalid={error ? true : undefined}
        className={cn(
          fieldBox,
          "relative w-full rounded-md border",
          sizes[size].box,
          fieldBorder(error),
          fieldFocus,
          fieldFocusColour(error),
          disabled && "cursor-not-allowed opacity-50",
          classNames.select,
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
          {...popover.getReferenceProps({
            onFocus: (event) => {
              onFocus?.(event as React.FocusEvent<HTMLButtonElement>);
              if (openOnFocus && !popover.open && !disabled && !readOnly) popover.setOpen(true);
            },
            onBlur,
            onKeyDown: (event) => {
              if (event.key === "Backspace" && multiple && chosenValues.length > 0) {
                removeValue(chosenValues[chosenValues.length - 1]);
              }
            },
            ...(autoFocus ? { autoFocus: true } : null),
          })}
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
          {chips && chosenValues.length > 0 ? (
            <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
              {chosenOptions.map((option) => (
                <Chip
                  key={valueOf(option)}
                  label={labelOf(option)}
                  leading={asOption(option).leading}
                  size={size}
                  onRemove={() => choose(option)}
                />
              ))}
              {unknownChosen.map((value) => (
                <Chip
                  key={value}
                  label={String(value)}
                  size={size}
                  onRemove={() => removeValue(value)}
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
              <span className="truncate">{labelOf(selected)}</span>
              {asOption(selected).description && (
                <span className={cn("truncate text-neutral-600", sizes[size].supportingText)}>
                  {asOption(selected).description}
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
            aria-label={clearLabel}
            data-slot="clear"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              clear();
            }}
            className={cn(
              "absolute inset-y-0 flex items-center text-neutral-400 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              { sm: "right-3", md: "right-4", lg: "right-[18px]" }[size],
              classNames.clear,
            )}
          >
            {clearIcon ?? <XCircleIcon size={size === "sm" ? 10 : 12} />}
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
              classNames.search,
            )}
          >
            <SearchLgIcon size={size === "sm" ? 16 : 20} className="shrink-0 text-neutral-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => search(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && multiple && !query && chosenValues.length > 0) {
                  // An empty field hands Backspace to the chips: drop the last.
                  removeValue(chosenValues[chosenValues.length - 1]);
                  return;
                }
                if (event.key === "Tab" && tabSelectsValue && activeIndex !== null) {
                  // Commit the highlight, then let focus move on naturally.
                  const option = visible[activeIndex];
                  if (option) choose(option);
                  return;
                }
                if (event.key === "Escape") {
                  if (query) {
                    // Clear the search and hold the panel — the dismissal
                    // listener never sees the key.
                    event.stopPropagation();
                    search("");
                  } else {
                    // A closing Escape must not commit through autoSelectOnBlur.
                    escapeDismissed.current = true;
                  }
                }
              }}
              onBlur={(event) => {
                const wasEscape = escapeDismissed.current;
                escapeDismissed.current = false;
                if (wasEscape) return;
                if (!autoSelectOnBlur || multiple || activeIndex === null) return;
                // Commit only when focus truly leaves the panel — a pointer
                // moving to a row still chooses through the click.
                const panel = (event.target as HTMLElement).closest('[data-slot="popover"]');
                const to = event.relatedTarget as Node | null;
                if (panel && to && panel.contains(to)) return;
                const option = visible[activeIndex];
                if (option) choose(option);
              }}
              placeholder={searchPlaceholder}
              className={cn(
                "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-placeholder focus:outline-none",
                sizes[size].text,
              )}
            />
          </div>
        )}

        <div
          ref={optionsRegionRef}
          data-slot="options"
          className={cn(
            "min-h-0 flex-1 overflow-auto py-1.5 motion-safe:scroll-smooth",
            classNames.options,
          )}
        >
          {visible.length === 0 && loading ? (
            // The sheets never draw this state — a designed row: centred, quiet.
            // With pages already loaded, loading becomes a sentinel row at the
            // bottom instead: the list stays up while the next page fetches.
            <div
              data-slot="loading"
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-3 text-sm text-neutral-600",
                classNames.loading,
              )}
            >
              <Spinner size={16} />
              {loadingLabel}
            </div>
          ) : visible.length === 0 ? (
            (noResults ?? (
              <NoResults
                onClear={() => search("")}
                title={noResultsTitle}
                hint={noResultsHint}
                action={query ? noResultsAction : undefined}
                className={classNames["no-results"]}
              />
            ))
          ) : (
            <>
              {visible.map((option, index) => (
                <SelectItem
                  key={valueOf(option)}
                  {...popover.getItemProps()}
                  ref={(node) => {
                    listRef.current[index] = node;
                    labelsRef.current[index] = labelOf(option);
                  }}
                  id={`${fieldId}-option-${index}`}
                  label={labelOf(option)}
                  description={asOption(option).description}
                  leading={asOption(option).leading}
                  size={size}
                  checkbox={multiple}
                  selected={isChosen(option)}
                  active={activeIndex === index}
                  disabled={asOption(option).disabled}
                  onChoose={() => choose(option)}
                />
              ))}
              {loading && (
                // A page is on its way: the row sits at the bottom, under the
                // list, so the loaded options stay up while it fetches.
                <div
                  data-slot="loading"
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-3 text-sm text-neutral-600",
                    classNames.loading,
                  )}
                >
                  <Spinner size={16} />
                  {loadingLabel}
                </div>
              )}
            </>
          )}
          {onLoadMore && hasMore && !loading && (
            <div ref={sentinelRef} data-slot="load-more" aria-hidden="true" className="h-px" />
          )}
        </div>
        {multiple &&
          // The sheet's footer: Reset at the panel's left edge, Select all at
          // its right, under a 2px divider — 44 tall at sm, 48 above. A
          // consumer's footer replaces it; null removes it.
          (footer === undefined ? (
            <div
            data-slot="footer"
            className={cn("shrink-0 border-t-2 border-neutral-200 px-3 py-1.5", classNames.footer)}
          >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onReset ?? resetValues}
                  className={cn(
                    "rounded-md border border-neutral-300 bg-background px-4 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50",
                    size === "sm" ? "h-8" : "h-9",
                  )}
                >
                  {resetLabel}
                </button>
                <button
                  type="button"
                  onClick={onSelectAll ?? selectAllVisible}
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
  className,
}: {
  onClear: () => void;
  title: string;
  hint: string;
  action?: string;
  className?: string;
}) {
  return (
    // Measured off the Search empty state cell: 18 under the search row, the
    // 32px box with 6px corners, the title 12 after it, the hint 4 after that,
    // the link 10 more, and 18 before the footer.
    <div
      data-slot="no-results"
      className={cn("flex flex-col items-center px-6 pt-3 pb-3 text-center", className)}
    >
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
