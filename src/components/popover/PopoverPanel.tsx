import { FloatingPortal } from "@floating-ui/react";
import type { HTMLAttributes, ReactNode } from "react";
import type { Popover } from "./usePopover";

export type PopoverPanelProps = Omit<HTMLAttributes<HTMLDivElement>, "popover"> & {
  /**
   * The `usePopover` result the trigger was wired with. The name collides with
   * the DOM's `popover` attribute, which `HTMLAttributes` carries and this
   * panel does not use — it positions with floating-ui instead.
   */
  popover: Popover;

  children: ReactNode;
};

/**
 * The panel itself: a portal, the floating position and the open state.
 *
 * It draws no chrome of its own — the caller passes the sheet's border, radius
 * and shadow through `className` — and renders nothing while closed, so the
 * panel's contents mount only when the trigger opens them. That is what keeps
 * a listbox's focus and key handling out of a closed select.
 */
export function PopoverPanel({ popover, className, children, ...props }: PopoverPanelProps) {
  const { open, refs, floatingStyles, getFloatingProps } = popover;
  if (!open) return null;

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        data-slot="popover"
        data-state="open"
        style={floatingStyles}
        className={className}
        {...getFloatingProps(props)}
      >
        {children}
      </div>
    </FloatingPortal>
  );
}
