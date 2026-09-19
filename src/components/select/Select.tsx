import { useId, useRef, useState, type ReactNode } from "react";
import type { Platform } from "@floating-ui/react";
import { cn } from "../../lib/cn";
import { CheckIcon, ChevronDownIcon } from "../icon/icons";
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
   * The platform floating-ui measures with. Left out in the browser; a test or
   * a non-DOM environment passes a deterministic one, because jsdom has no
   * layout and the DOM platform churns without it
   * @default undefined
   */
  platform?: Platform;

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
};

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

  const [activeIndex, setActiveIndex] = useState<number | null>(selectedIndex === -1 ? null : selectedIndex);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const triggerId = useId();

  const popover = usePopover({
    role: "listbox",
    disabled,
    platform,
    listNavigation: {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
      loop: true,
      selectedIndex: selectedIndex === -1 ? null : selectedIndex,
    },
    typeahead: { listRef: labelsRef, activeIndex, onMatch: setActiveIndex },
  });

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
                <span className="truncate text-neutral-500">{selected.description}</span>
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
        className={cn(
          "max-h-64 overflow-auto rounded-md border bg-background p-1 shadow-md",
          fieldBorder(error),
        )}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && activeIndex !== null) {
            const option = options[activeIndex];
            if (option) choose(option);
          }
        }}
      >
        {options.length === 0 ? (
          <p className="px-3 py-2 text-sm text-neutral-500">No options</p>
        ) : (
          options.map((option, index) => (
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
                "flex cursor-default items-center justify-between gap-3 rounded-sm px-3.5 text-base text-foreground",
                { sm: "h-[38px]", md: "h-[42px]", lg: "h-[46px]" }[size],
                activeIndex === index && "bg-neutral-50",
                option.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="truncate">{option.label}</span>
                {option.description && (
                  <span className="truncate text-neutral-500">{option.description}</span>
                )}
              </span>
              {option.value === value && <CheckIcon size={16} className="shrink-0" />}
            </ListboxOption>
          ))
        )}
      </PopoverPanel>
    </div>
  );
}
