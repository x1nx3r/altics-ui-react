import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Platform } from "@floating-ui/react";
import { cn } from "../../lib/cn";
import { CheckIcon, ChevronDownIcon, SearchLgIcon } from "../icon/icons";
import {
  fieldBorder,
  fieldBox,
  fieldFocusSelf,
  fieldFocusSelfColour,
  sizes,
} from "../input/chrome";
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
   * @default false
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
  placeholder = "Select",
  size = "md",
  disabled,
  error,
  leading,
  searchable = false,
  searchPlaceholder = "Search",
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
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex === -1 ? undefined : options[selectedIndex];

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
  const visible = searchable && query ? options.filter((option) => matches(option, query)) : options;
  const visibleSelectedIndex = visible.findIndex((option) => option.value === value);

  const popover = usePopover({
    role: "listbox",
    disabled,
    platform,
    listNavigation: {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
      loop: true,
      selectedIndex: visibleSelectedIndex === -1 ? null : visibleSelectedIndex,
      // With a search field the keys come from it, so focus stays there: the
      // navigation must not take it on open, nor follow the pointer.
      ...(searchable ? { focusItemOnOpen: false, focusItemOnHover: false } : null),
    },
    // With a search field, the letters belong to it, not to typeahead.
    typeahead: searchable ? undefined : { listRef: labelsRef, activeIndex, onMatch: setActiveIndex },
  });

  // A fresh panel starts with no query, the way the sheets draw it.
  useEffect(() => {
    if (!popover.open) setQuery("");
  }, [popover.open]);

  function search(next: string) {
    setQuery(next);
    const nextVisible = searchable && next ? options.filter((option) => matches(option, next)) : options;
    setActiveIndex(nextVisible.length ? 0 : null);
  }

  function choose(option: SelectOption) {
    if (option.disabled) return;
    if (controlledValue === undefined) setUncontrolled(option.value);
    onValueChange?.(option.value);
    popover.setOpen(false);
  }

  const fieldId = id ?? triggerId;

  return (
    <div className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value ?? ""} readOnly />}

      <button
        ref={popover.refs.setReference as never}
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldBox,
          "w-full gap-2 rounded-md border px-3 text-left",
          sizes[size].box,
          fieldBorder(error),
          fieldFocusSelf,
          fieldFocusSelfColour(error),
          disabled && "cursor-not-allowed opacity-50",
        )}
        {...popover.getReferenceProps()}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {leading}
          {selected ? (
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate">{selected.label}</span>
              {selected.description && (
                <span className="truncate text-neutral-600">{selected.description}</span>
              )}
            </span>
          ) : (
            <span className="truncate text-placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDownIcon size={16} className="shrink-0 text-neutral-600" />
      </button>

      <PopoverPanel
        popover={popover}
        initialFocus={searchable ? searchRef : undefined}
        className={cn(
          "flex max-h-64 flex-col overflow-hidden rounded-md border bg-background shadow-md",
          fieldBorder(error),
        )}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && activeIndex !== null) {
            const option = visible[activeIndex];
            if (option) choose(option);
          }
        }}
      >
        {searchable && (
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
                selected={option.value === value}
                disabled={option.disabled}
                className={cn(
                  "mx-1.5 flex cursor-default items-center justify-between rounded-sm text-base text-foreground",
                  rowClass[size],
                  // the sheet fills the chosen row the same grey as a hovered one
                  (activeIndex === index || option.value === value) && "bg-neutral-50",
                  option.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <span className={cn("flex min-w-0 items-baseline", labelGap[size])}>
                  <span className="truncate">{option.label}</span>
                  {option.description && (
                    <span className="truncate text-neutral-600">{option.description}</span>
                  )}
                </span>
                {option.value === value && <CheckIcon size={16} className="shrink-0 text-neutral-600" />}
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
