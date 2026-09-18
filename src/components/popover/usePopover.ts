import { useCallback, useMemo, useState, type CSSProperties } from "react";
import {
  autoUpdate,
  flip,
  offset as offsetMiddleware,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  type Placement,
  type Platform,
  type UseFloatingReturn,
  type UseInteractionsReturn,
} from "@floating-ui/react";

/** The roles a floating panel can announce. A plain panel leaves it out. */
export type PopoverRole = "listbox" | "menu" | "dialog" | "tree" | "grid";

export type UsePopoverOptions = {
  /**
   * Open state. Give this and `onOpenChange` to control the panel yourself
   * @default undefined
   */
  open?: boolean;

  /**
   * The initial open state, for uncontrolled use
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Runs with the next open state
   * @default undefined
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Where the panel prefers to sit. It flips and shifts to stay in view
   * @default "bottom-start"
   */
  placement?: Placement;

  /**
   * Distance from the trigger, in pixels
   * @default 4
   */
  offset?: number;

  /**
   * Make the panel as wide as the trigger, which is how the sheets draw the
   * select menu
   * @default true
   */
  matchTriggerWidth?: boolean;

  /**
   * Leave the trigger inert — no click, no keyboard
   * @default undefined
   */
  disabled?: boolean;

  /**
   * Announce the panel as this role. `useRole` then sets `aria-haspopup`,
   * `aria-expanded` and `aria-controls` on the trigger
   * @default undefined
   */
  role?: PopoverRole;

  /**
   * The platform floating-ui measures with. Left out in the browser; tests
   * pass a deterministic one, because jsdom has no layout and an aligned
   * placement with no size never settles
   * @default undefined
   */
  platform?: Platform;
};

/** Everything the trigger and the panel need from `usePopover`. */
export type Popover = {
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: UseFloatingReturn["refs"];
  context: UseFloatingReturn["context"];
  floatingStyles: CSSProperties;
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
};

/**
 * An anchored panel's state and wiring, on floating-ui.
 *
 * floating-ui composes interaction handlers in one call, so the interactions
 * live here rather than in a provider component: a consumer that needs more of
 * them (the listbox's navigation and typeahead) adds them to this hook, where
 * `useInteractions` can still compose them safely.
 *
 * The hook only wires behaviour: no styles, no DOM of its own. `PopoverPanel`
 * renders the portal; the caller brings the chrome.
 *
 * @example
 * const popover = usePopover({ role: "listbox" });
 * <button ref={popover.refs.setReference} {...popover.getReferenceProps()} />
 * <PopoverPanel popover={popover} className="...">{options}</PopoverPanel>
 */
export function usePopover({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom-start",
  offset = 4,
  matchTriggerWidth = true,
  disabled,
  role,
  platform,
}: UsePopoverOptions = {}): Popover {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolled;

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    platform,
    whileElementsMounted: autoUpdate,
    // Memoised: a new array each render re-runs useFloating's effect, which
    // updates state, which renders again — the loop floating-ui warns about.
    middleware: useMemo(
      () => [
        offsetMiddleware(offset),
        // Keep 8px from the viewport edges when the panel has to move.
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        ...(matchTriggerWidth
          ? [
              size({
                apply({ rects, elements }) {
                  elements.floating.style.width = `${rects.reference.width}px`;
                },
              }),
            ]
          : []),
      ],
      [offset, matchTriggerWidth],
    ),
  });

  const click = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context);
  const floatingRole = useRole(context, role ? { role } : {});
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    floatingRole,
  ]);

  return useMemo(
    () => ({
      open,
      setOpen,
      refs,
      context,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
    }),
    [open, setOpen, refs, context, floatingStyles, getReferenceProps, getFloatingProps],
  );
}
