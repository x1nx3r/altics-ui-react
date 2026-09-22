import { FloatingPortal } from "@floating-ui/react";
import { useCallback, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import type { Popover } from "./usePopover";

export type PopoverPanelProps = Omit<HTMLAttributes<HTMLDivElement>, "popover"> & {
  /**
   * The `usePopover` result that the trigger uses. The name is the same as the
   * `popover` attribute of the DOM. `HTMLAttributes` has that attribute, but
   * this panel does not use it. floating-ui sets the position of the panel
   */
  popover: Popover;

  /**
   * The element to focus instead of the panel: the search input that a
   * searchable select shows inside the panel
   * @default undefined
   */
  initialFocus?: RefObject<HTMLElement | null>;

  /**
   * The container that holds the panel. If you leave this out, the panel goes
   * to the body. Some layouts must show the panel close to its field, for
   * example a grid of open fields or a dialog. Those layouts pass the
   * container that the panel belongs in.
   *
   * Position that container (`relative`) when it sits in a scrolled or zoomed
   * surface. An absolutely positioned panel takes its containing block from
   * the nearest positioned ancestor. A static container leaves the panel
   * anchored to the document. The panel then does not move with the scroll or
   * the zoom of the surface
   * @default undefined
   */
  portalRoot?: RefObject<HTMLElement | null>;
};

/**
 * The panel is a portal at the floating position. It receives focus and it
 * shows only when open. It has no chrome. The caller passes the border,
 * radius, and shadow of the sheet through `className`. The contents mount
 * only when the trigger opens the panel.
 *
 * The `style` of the caller merges under the position that floating-ui
 * computes. Passing `style` straight through would replace `top` and `left`.
 * The panel would then show wherever it lands in the document.
 *
 * @see usePopover, which moves focus back to the trigger when the panel closes.
 */
export function PopoverPanel({
  popover,
  initialFocus,
  portalRoot,
  className,
  children,
  style,
  ...props
}: PopoverPanelProps) {
  const { open, refs, floatingStyles, getFloatingProps, focus } = popover;

  // A stable callback: the position ref, then focus. floating-ui's
  // `initialFocus={-1}` means "leave focus alone", which is not what a listbox
  // wants, so the panel takes focus here.
  const setPanel = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setFloating(node);
      if (!node || !focus) return;
      const target = initialFocus?.current ?? node;
      if (!target.contains(document.activeElement)) target.focus({ preventScroll: true });
    },
    [refs, focus, initialFocus],
  );

  if (!open) return null;

  const panel = (
    <div
      ref={setPanel}
      tabIndex={focus ? -1 : undefined}
      data-slot="popover"
      data-state="open"
      style={{ ...floatingStyles, ...style }}
      className={className}
      {...getFloatingProps(props)}
    >
      {children}
    </div>
  );

  // A FloatingFocusManager would be the obvious way to do this, but it marks
  // everything outside the panel inert — the trigger included — which hides the
  // control from announcers and swallows clicks while the panel is open. A
  // select needs neither, so the panel only takes focus, and `usePopover`
  // gives it back to the trigger on close.
  return <FloatingPortal root={portalRoot}>{panel}</FloatingPortal>;
}
