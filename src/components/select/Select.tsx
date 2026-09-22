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
 * Classes for each part of the select. The keys are the data-slot names that
 * the parts emit. The values merge with the classes from the sheets through
 * `cn()`. You can extend the geometry, but you cannot remove it. For state
 * styling, use the attribute selectors that the slots already have.
 */
export type SelectClassNames = Partial<
  Record<"select" | "search" | "options" | "footer" | "no-results" | "clear" | "loading", string>
>;

export type SelectOption = {
  /** The value that the form receives. The `value` prop matches against it */
  value: string;

  /** The text that the trigger shows after the user selects the option */
  label: string;

  /**
   * A second line beside the label. The sheets show it for a subscribed
   * option, for example an email or a count. It tells two similar names apart
   * @default undefined
   */
  description?: string;

  /**
   * An adornment before the label. The sheets show an avatar, a dot, or an
   * icon. Size it where you use it: 24 for an avatar, 16 for an icon, and 8
   * for a dot
   * @default undefined
   */
  leading?: ReactNode;

  /**
   * The user cannot highlight or select this option
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
   * Reads the identity that a choice is stored under. This is necessary when
   * the options do not have the SelectOption shape
   * @default (option) => option.value
   */
  getOptionValue?: (option: T) => string;

  /**
   * Reads the text that the trigger and the rows show
   * @default (option) => option.label
   */
  getOptionLabel?: (option: T) => string;

  /**
   * The chosen value. To control the field, give this prop and `onValueChange`
   * @default undefined
   */
  value?: string;

  /**
   * The value that the field shows first, for uncontrolled use
   * @default undefined
   */
  defaultValue?: string;

  /**
   * Receives the next value when the user selects an option
   * @default undefined
   */
  onValueChange?: (value: string) => void;

  /**
   * Set this to select more than one option. Then use `values` and
   * `onValuesChange` for the value props. The panel keeps a search field and
   * stays open while the user selects options. Every row shows a checkbox
   * @default false
   */
  multiple?: boolean;

  /**
   * The chosen values of a multiple select. To control the field, give this
   * prop and `onValuesChange`
   * @default undefined
   */
  values?: string[];

  /**
   * The values that the field shows first, for an uncontrolled multiple select
   * @default undefined
   */
  defaultValues?: string[];

  /**
   * Receives the next values when the user selects or deselects an option
   * @default undefined
   */
  onValuesChange?: (values: string[]) => void;

  /**
   * The text that the field shows while nothing is selected. It uses the
   * placeholder color
   * @default "Select"
   */
  placeholder?: string;

  /**
   * The size of the field. It follows the input ramp: 36, 40, and 44 tall
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Disables the field
   * @default undefined
   */
  disabled?: boolean;

  /**
   * The error state. It looks like every other field: red-300 at rest, red-500
   * when focused. A string does the same, and `Field` shows the string below
   * the field
   * @default undefined
   */
  error?: string | boolean;

  /**
   * The field is locked but present. The panel never opens and the clear
   * button disappears. The field still receives focus, and the form still
   * sends the value. Disabled is stronger: you cannot use the field and the
   * form does not send the value
   * @default false
   */
  readOnly?: boolean;

  /**
   * The maximum number of options that a multiple select can hold. The user
   * cannot select more options than this number. Select all fills the
   * selection up to this number
   * @default undefined
   */
  maxSelectedValues?: number;

  /**
   * Content before the value. The sheet types show an avatar, a dot, or an
   * icon
   * @default undefined
   */
  leading?: ReactNode;

  /**
   * The panel shows a search field at the top. The field filters the options
   * as the user types them. The field receives focus when the panel opens.
   * Arrow keys move the highlight, and Enter selects the option
   * @default false, and true with `multiple`, as the sheets draw it
   */
  searchable?: boolean;

  /**
   * The placeholder of the search field
   * @default "Search"
   */
  searchPlaceholder?: string;

  /**
   * The search text, when the caller owns it. If you leave this out, the
   * field keeps its own text and resets it when the panel closes
   * @default undefined
   */
  query?: string;

  /**
   * The search text that the panel shows first
   * @default ""
   */
  defaultQuery?: string;

  /**
   * Receives the next search text when it changes
   * @default undefined
   */
  onQueryChange?: (query: string) => void;

  /**
   * Replaces the built-in matcher. The built-in matcher ignores case in the
   * label and the description. `false` gives filtering to the backend, and
   * the options show as given
   * @default undefined
   */
  filter?: false | ((option: T, query: string) => boolean);

  /**
   * The title of the empty state. The panel shows it when a search finds no
   * options
   * @default "No teams found"
   */
  noResultsTitle?: string;

  /**
   * The hint of the empty state. It shows below the title
   * @default "Please try a different search term."
   */
  noResultsHint?: string;

  /**
   * The control of the empty state. It clears the search. An empty string
   * hides the control
   * @default "Clear search"
   */
  noResultsAction?: string;

  /**
   * The footer button that deletes the selection of the multiple panel
   * @default "Reset"
   */
  resetLabel?: string;

  /**
   * The footer button that selects every option in the list
   * @default "Select all"
   */
  selectAllLabel?: string;

  /**
   * Replaces the Select all button. Use it for a backend trigger that selects
   * every matching row, including rows that the list never shows. If you leave
   * it out, the button selects every option in the list
   * @default undefined
   */
  onSelectAll?: () => void;

  /**
   * Replaces the Reset button. Use it for a backend trigger. If you leave it
   * out, the button deletes the selection
   * @default undefined
   */
  onReset?: () => void;

  /**
   * The options are loading. The panel shows a loading row instead of the list
   * or the empty state
   * @default false
   */
  loading?: boolean;

  /**
   * The text of the loading row
   * @default "Loading…"
   */
  loadingLabel?: string;

  /**
   * Tells the caller to load the next page. This starts when the user scrolls
   * to the bottom of the list, or when the highlighted row gets to the bottom.
   * Set `hasMore` to false to stop more pages from loading
   * @default undefined
   */
  onLoadMore?: () => void;

  /**
   * There are more pages to load. Set this to false when no more pages exist.
   * While loading is true, the list loads no more pages
   * @default undefined
   */
  hasMore?: boolean;

  /**
   * Replaces the footer from the sheets. That footer shows Reset on the left
   * and Select all on the right. `null` shows no footer
   * @default undefined
   */
  footer?: ReactNode;

  /**
   * Replaces the built-in empty state. The sheets draw it with a boxed mark, a
   * title, a hint, and a control that clears the search
   * @default undefined
   */
  noResults?: ReactNode;

  /**
   * The name that the form sends with the value. A hidden input holds a copy
   * of the value
   * @default undefined
   */
  name?: string;

  /**
   * The open state of the panel. To control the panel, give this prop and
   * `onOpenChange`
   * @default undefined
   */
  open?: boolean;

  /**
   * The open state that the panel shows first, for uncontrolled use
   * @default undefined
   */
  defaultOpen?: boolean;

  /**
   * Receives the next open state when the panel opens or closes
   * @default undefined
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * The container that holds the panel. If you leave this out, the panel goes
   * to the body. Some layouts must show the panel close to its field. Those
   * layouts pass the container that the panel belongs in
   * @default undefined
   */
  portalRoot?: RefObject<HTMLElement | null>;

  /**
   * Shows the chosen options as chips in the trigger. This is the Tags type
   * from the sheets. The chips are 24 tall. Each chip shows the adornment of
   * the option, a label, and a remove button that deletes the option. This
   * works on `multiple` only
   * @default false
   */
  chips?: boolean;

  /**
   * Clears the field from the trigger. The Search type from the sheets is a
   * leading mark plus this prop. While a value is set, the trigger shows a
   * clear mark. While empty, the trigger shows nothing instead of a chevron
   * @default false
   */
  clearable?: boolean;

  /**
   * More classes for the field
   * @default undefined
   */
  className?: string;

  /**
   * The id of the control. `Field` supplies one, so its label points at the
   * field
   * @default undefined
   */
  id?: string;

  /**
   * Points at the hint or the error message. `Field` supplies it
   * @default undefined
   */
  "aria-describedby"?: string;

  /**
   * Shows that the field is required. `Field` supplies it
   * @default undefined
   */
  required?: boolean;

  /**
   * Receives the focus event when the trigger receives focus
   * @default undefined
   */
  onFocus?: FocusEventHandler<HTMLButtonElement>;

  /**
   * Receives the blur event when focus moves away from the trigger
   * @default undefined
   */
  onBlur?: FocusEventHandler<HTMLButtonElement>;

  /**
   * The trigger receives focus on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Selecting the selected option again clears a single select. Set this to
   * false, and the value stays
   * @default true
   */
  allowDeselect?: boolean;

  /**
   * Removes chosen options from the list. A multiple select then shows only
   * unselected options
   * @default false
   */
  hideSelectedOptions?: boolean;

  /**
   * Selects the highlighted option when focus moves from the search field to a
   * place outside the panel. This works on single selects only
   * @default false
   */
  autoSelectOnBlur?: boolean;

  /**
   * Selects the highlighted option on Tab, before focus moves on
   * @default false
   */
  tabSelectsValue?: boolean;

  /**
   * Set this, and the panel opens when the trigger receives focus
   * @default false
   */
  openOnFocus?: boolean;

  /**
   * A click on the trigger opens and closes the panel. Set this to false to
   * control the panel through `open` only
   * @default true
   */
  openMenuOnClick?: boolean;

  /**
   * The panel closes when the user selects an option. On single selects the
   * panel closes. On multiple selects the panel stays open. Set this prop to
   * change that behavior
   * @default !multiple
   */
  closeOnSelect?: boolean;

  /**
   * Receives the highlighted option when the highlight moves by keyboard or
   * pointer. It receives null when nothing is highlighted. Use this prop for a
   * preview pane
   * @default undefined
   */
  onHighlightChange?: (option: T | null) => void;

  /**
   * Replaces the mark of the clear button
   * @default an XCircle on the size ramp
   */
  clearIcon?: ReactNode;

  /**
   * Sets the name of the clear button for assistive technology
   * @default "Clear"
   */
  clearLabel?: string;

  /**
   * Sets classes for the parts of the panel. The classes merge with the
   * classes from the sheets through `cn()`. The keys are the data-slot names
   * of the parts. These are plain strings, not functions of state. For state,
   * use the attribute selectors that the slots already have, for example
   * `data-selected` and `aria-expanded`
   * @default undefined
   */
  classNames?: SelectClassNames;

  /**
   * The platform that floating-ui uses. Leave this out in the browser. A test
   * passes a deterministic platform because jsdom has no layout
   * @default undefined
   */
  platform?: Platform;
};

/** The search row's height, as the sheets draw it: 44, then 48 at lg. */
const searchRow = { sm: "h-11", md: "h-11", lg: "h-12" };

/**
 * Select one option from a list.
 *
 * The trigger has the same heights, insets, border, and ring as the input. It
 * shows the value where the input shows text. The panel is a listbox. The
 * floating element has `role="listbox"`. The options can receive
 * focus but are not tab stops. The panel supplies the keys, the typeahead,
 * the dismissal, and the focus return.
 *
 * @example
 * <Select options={[{ value: "id", label: "Indonesia" }]} placeholder="Country" />
 *
 * @example
 * // Searchable: the list filters as the user types
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

/** The empty state from the sheet: a boxed mark, a title, a hint, and a control that clears the search. */
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
