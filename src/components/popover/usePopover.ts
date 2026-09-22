import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
  useListNavigation,
  useRole,
  useTypeahead,
  type Placement,
  type Platform,
  type UseFloatingReturn,
  type UseInteractionsReturn,
} from "@floating-ui/react";

/** The roles a floating panel can announce. A plain panel leaves it out. */
export type PopoverRole = "listbox" | "menu" | "dialog" | "tree" | "grid";

export type UsePopoverOptions = {
  /**
   * The open state of the panel. To control the panel, give this prop and
   * `onOpenChange`
   * @default undefined
   */
  open?: boolean;

  /**
   * The open state that the panel shows first, for uncontrolled use
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Receives the next open state
   * @default undefined
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * The side of the trigger where the panel prefers to sit. The panel flips
   * and shifts to stay in view. The default is centered: a panel that matches
   * the width of its trigger looks the same either way. An aligned placement
   * can loop after one flip pass when there is no layout to measure
   * @default "bottom"
   */
  placement?: Placement;

  /**
   * The distance from the trigger, in pixels
   * @default 4
   */
  offset?: number;

  /**
   * The panel becomes as wide as the trigger. The sheets draw the select menu
   * this way
   * @default true
   */
  matchTriggerWidth?: boolean;

  /**
   * Disables the trigger. Clicks and keys do nothing
   * @default undefined
   */
  disabled?: boolean;

  /**
   * A click on the trigger opens and closes the panel. Set this to false to
   * control the panel through `open` only
   * @default true
   */
  openOnTriggerClick?: boolean;

  /**
   * The panel receives focus when it opens and moves focus back to the trigger
   * when it closes. The listbox follows: floating-ui focuses the selected
   * option on open unless told otherwise. If you leave this out, the panel is
   * pointer-only and nothing moves focus
   * @default true
   */
  focus?: boolean;

  /**
   * The role of the panel for assistive technology. `useRole` then sets
   * `aria-haspopup`, `aria-expanded` and `aria-controls` on the trigger
   * @default undefined
   */
  role?: PopoverRole;

  /**
   * The platform that floating-ui uses. Leave this out in the browser. A test
   * passes a deterministic platform because jsdom has no layout
   * @default undefined
   */
  platform?: Platform;

  /**
   * Keyboard navigation over the options. The trigger wires arrow keys, Home
   * and End, and `aria-activedescendant`. The listbox supplies its `listRef`
   * and active index. If you leave this out, the panel takes clicks only
   * @default undefined
   */
  listNavigation?: Parameters<typeof useListNavigation>[1];

  /**
   * Letter keys move to the option whose text starts with them
   * @default undefined
   */
  typeahead?: Parameters<typeof useTypeahead>[1];
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
  /**
   * Props for each option. floating-ui keeps navigation on the panel and moves
   * real focus between items. Every option needs these props. They sync the
   * active option and follow the pointer. When the pointer moves away, they
   * move focus back to the trigger
   */
  getItemProps: UseInteractionsReturn["getItemProps"];
  /** Whether the panel receives focus, which the navigation follows */
  focus: boolean;
};

/**
 * State and wiring for an anchored panel, built on floating-ui.
 *
 * floating-ui composes interaction handlers in one call. The interactions live
 * here, not in a provider component. A consumer that needs more of them (the
 * navigation and typeahead of the listbox) adds them to this hook. In this
 * hook `useInteractions` still composes them safely.
 *
 * The hook only wires behavior. It has no styles and no DOM of its own.
 * `PopoverPanel` renders the portal. The caller supplies the chrome.
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
  placement = "bottom",
  offset = 4,
  matchTriggerWidth = true,
  disabled,
  role,
  platform,
  openOnTriggerClick = true,
  focus = true,
  listNavigation,
  typeahead,
}: UsePopoverOptions = {}): Popover {
  // Stable empties for the hooks' required refs.
  const emptyElementList = useRef<Array<HTMLElement | null>>([]);
  const emptyLabelList = useRef<Array<string | null>>([]);
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

  // Focus goes back to the trigger when the panel closes, so the caret does
  // not fall to the document — the panel took it on open (see PopoverPanel).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const reference = refs.reference.current as HTMLElement | null;
    reference?.focus?.({ preventScroll: true });
  }, [open, refs]);

  const click = useClick(context, { enabled: !disabled && openOnTriggerClick });
  const dismiss = useDismiss(context);
  const floatingRole = useRole(context, role ? { role } : {});
  // Both stay inert until a listbox passes its options. Passing the options
  // turns them on; `enabled` in those options still wins over that. The empty
  // lists satisfy floating-ui's required refs when there are no options yet.
  const listNav = useListNavigation(context, {
    enabled: listNavigation != null,
    listRef: listNavigation?.listRef ?? emptyElementList,
    activeIndex: listNavigation?.activeIndex ?? null,
    // With focus off, the navigation must not focus the selected option either.
    focusItemOnOpen: focus,
    focusItemOnHover: focus,
    ...listNavigation,
  });
  const typeaheadNav = useTypeahead(context, {
    enabled: typeahead != null,
    listRef: typeahead?.listRef ?? emptyLabelList,
    activeIndex: typeahead?.activeIndex ?? null,
    ...typeahead,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    floatingRole,
    listNav,
    typeaheadNav,
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
      getItemProps,
      focus,
    }),
    [
      open,
      setOpen,
      refs,
      context,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      focus,
    ],
  );
}
