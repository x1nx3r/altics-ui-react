import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export type ListboxOptionProps = HTMLAttributes<HTMLDivElement> & {
  /** Ties this option to the trigger's `aria-activedescendant` */
  id: string;

  /**
   * Whether this option is the chosen one — what the sheets draw a check for
   * @default false
   */
  selected?: boolean;

  /**
   * Whether the caret is on this option. Left out, the option tracks hover
   * @default false
   */
  active?: boolean;

  /**
   * Skips the option in navigation and marks it `aria-disabled`
   * @default undefined
   */
  disabled?: boolean;

  /**
   * Runs when the option is chosen. Named for choosing rather than the DOM's
   * `onSelect` event, which stays available
   * @default undefined
   */
  onChoose?: () => void;

  /**
   * Runs when the pointer moves onto the option, so a caller can follow the
   * pointer with its active index
   * @default undefined
   */
  onActivate?: () => void;

  children: ReactNode;
};

/**
 * One option: `role="option"`, its selected and disabled state for announcers,
 * and `data-active` / `data-selected` / `data-disabled` for styling.
 *
 * The panel itself carries `role="listbox"` — floating-ui points the trigger's
 * `aria-controls` at the floating element, so a nested container would break
 * the wiring. Options are the panel's children.
 *
 * An option is focusable but not a tab stop: floating-ui's navigation moves
 * real focus between options, which is how the highlight is announced.
 *
 * The row's chrome — height, insets, hover fill, check — stays with the family
 * that draws it, so the same primitive serves menus and lists.
 */
export const ListboxOption = forwardRef<HTMLDivElement, ListboxOptionProps>(
  (
    {
      id,
      selected = false,
      active = false,
      disabled,
      onChoose,
      onActivate,
      className,
      children,
      onClick,
      onMouseMove,
      tabIndex = -1,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      id={id}
      role="option"
      tabIndex={tabIndex}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-slot="listbox-option"
      data-active={active || undefined}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!disabled) onChoose?.();
      }}
      onMouseMove={(event) => {
        onMouseMove?.(event);
        if (!disabled && !active) onActivate?.();
      }}
      {...props}
    >
      {children}
    </div>
  ),
);
ListboxOption.displayName = "ListboxOption";
