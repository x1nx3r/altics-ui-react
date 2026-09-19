import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react";
import { useCallback, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import type { Popover } from "./usePopover";

export type PopoverPanelProps = Omit<HTMLAttributes<HTMLDivElement>, "popover"> & {
  /**
   * The `usePopover` result the trigger was wired with. The name collides with
   * the DOM's `popover` attribute, which `HTMLAttributes` carries and this
   * panel does not use — it positions with floating-ui instead.
   */
  popover: Popover;

  /**
   * Take focus on open, and give it back to the trigger on close. A listbox
   * needs this: floating-ui keeps its key handling on the panel, so the keys
   * only reach it when focus is inside
   * @default true
   */
  focus?: boolean;

  /**
   * What to focus instead of the panel — the search input a searchable select
   * renders inside it
   * @default undefined
   */
  initialFocus?: RefObject<HTMLElement | null>;
};

/**
 * The panel itself: a portal, the floating position, focus, and the open state.
 * It draws no chrome — the caller passes the sheet's border, radius and shadow
 * through `className` — and renders nothing while closed, so the panel's
 * contents mount only when the trigger opens them.
 *
 * The caller's `style` is merged under the position floating-ui computes:
 * passing it straight through would replace `top`/`left` and leave the panel
 * wherever it lands in the document.
 */
export function PopoverPanel({
  popover,
  focus = true,
  initialFocus,
  className,
  children,
  style,
  ...props
}: PopoverPanelProps) {
  const { open, refs, context, floatingStyles, getFloatingProps } = popover;

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

  return (
    <FloatingPortal>
      {focus ? (
        <FloatingFocusManager context={context} modal={false}>
          {panel}
        </FloatingFocusManager>
      ) : (
        panel
      )}
    </FloatingPortal>
  );
}
