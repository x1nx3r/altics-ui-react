import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CheckIcon } from "../icon/icons";
import { ListboxOption } from "../listbox";

export type SelectItemSize = "sm" | "md" | "lg";

export type SelectItemProps = HTMLAttributes<HTMLDivElement> & {
  /** Ties this row to the trigger's `aria-activedescendant` */
  id: string;

  /** The line the row reads */
  label: string;

  /**
   * A quieter line beside the label — an email, a count, anything that tells
   * two similar names apart
   * @default undefined
   */
  description?: string;

  /**
   * An adornment before the label. Size it at the call site: the sheets use 24
   * for an avatar, 16 for an icon and 8 for a dot
   * @default undefined
   */
  leading?: ReactNode;

  /**
   * Row height, on the field ramp: 36, 40 and 44
   * @default "md"
   */
  size?: SelectItemSize;

  /**
   * The chosen row. A listbox marks it `aria-selected`
   * @default false
   */
  selected?: boolean;

  /**
   * The row the caret is on
   * @default false
   */
  active?: boolean;

  /**
   * Cannot be chosen, and navigation steps over it
   * @default undefined
   */
  disabled?: boolean;

  /**
   * Lead the row with a checkbox rather than trailing a check, which is what a
   * multiple select draws. A row is filled when it is active, and when it is
   * chosen only without a checkbox — the sheets fill a chosen single row, and a
   * toggled one only while it is hovered
   * @default false
   */
  checkbox?: boolean;

  /**
   * Runs when the row is chosen
   * @default undefined
   */
  onChoose?: () => void;

  /**
   * Runs when the pointer moves onto the row
   * @default undefined
   */
  onActivate?: () => void;
};

/**
 * One option of a select: the row the sheets draw, on the listbox base.
 *
 * The base carries the roles, the state attributes and the focus; this adds the
 * chrome — the heights, the insets, the hover and chosen fills, the check and
 * the checkbox — so a select and a standalone menu draw the same row.
 *
 * @example
 * <SelectItem id="fruit-0" label="Apple" description="id" onChoose={choose} />
 */
export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (
    {
      id,
      label,
      description,
      leading,
      size = "md",
      selected = false,
      active = false,
      disabled,
      checkbox = false,
      onChoose,
      onActivate,
      className,
      ...props
    },
    ref,
  ) => (
    <ListboxOption
      {...props}
      ref={ref}
      id={id}
      selected={selected}
      active={active}
      disabled={disabled}
      onChoose={onChoose}
      onActivate={onActivate}
      className={cn(
        "mx-1.5 flex cursor-default items-center rounded-sm text-base text-foreground",
        checkbox ? "gap-2" : "justify-between",
        {
          sm: "h-9 gap-2 pl-1.5 pr-3",
          md: "h-10 gap-3 pl-2 pr-3",
          lg: "h-11 gap-3 pl-2 pr-3",
        }[size],
        (active || (selected && !checkbox)) && "bg-neutral-50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {checkbox && (
        <span
          aria-hidden="true"
          className={cn(
            "flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-xs border",
            selected ? "border-primary bg-primary text-primary-foreground" : "border-neutral-300",
          )}
        >
          {selected && <CheckIcon size={10} />}
        </span>
      )}
      {leading}
      <span className={cn("flex min-w-0 items-baseline", size === "sm" ? "gap-1.5" : "gap-2")}>
        <span className="truncate">{label}</span>
        {description && <span className="truncate text-neutral-600">{description}</span>}
      </span>
      {!checkbox && selected && <CheckIcon size={16} className="shrink-0 text-neutral-600" />}
    </ListboxOption>
  ),
);
SelectItem.displayName = "SelectItem";
