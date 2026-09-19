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
   * Where the panel prefers to sit. It flips and shifts to stay in view. The
   * default is centred: a panel that matches its trigger's width looks the same
   * either way, and an aligned placement is one `flip` pass away from looping
   * when there is no layout to measure
   * @default "bottom"
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
   * Take focus on open and give it back on close, and let the listbox follow:
   * floating-ui focuses the selected option on open unless told otherwise. Left
   * out, the panel is pointer-only and nothing moves focus
   * @default true
   */
  focus?: boolean;

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

  /**
   * Keyboard navigation over the options, wired on the trigger: arrow keys,
   * Home and End, and `aria-activedescendant`. The listbox supplies its
   * `listRef` and active index. Left out, the panel takes clicks only
   * @default undefined
   */
  listNavigation?: Parameters<typeof useListNavigation>[1];

  /**
   * Letter keys jump to the option whose text starts with them
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
   * real focus between items, so every option needs these: they sync the active
   * option, follow the pointer, and return focus to the trigger on leave
   */
  getItemProps: UseInteractionsReturn["getItemProps"];
  /** Whether the panel takes focus, which the navigation follows */
  focus: boolean;
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
  placement = "bottom",
  offset = 4,
  matchTriggerWidth = true,
  disabled,
  role,
  platform,
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

  const click = useClick(context, { enabled: !disabled });
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
