import type { ReactNode } from "react";

/**
 * The field chrome: the classes `Input` and the rest of the family share, kept
 * in one place so a select's trigger sits at the same heights, insets and
 * colours as the input it stands beside.
 */

/** The box around a field: no border of its own — each region draws one. */
export const fieldBox = "flex items-center rounded-md bg-background transition-colors";

/** The value region, which owns the border the focus ring paints over. */
export const fieldRegion = "relative flex min-w-0 flex-1 self-stretch border";

/** The ring a focused field draws, over the border it owns. */
export const fieldFocus =
  "focus-within:outline focus-within:outline-2 focus-within:outline-offset-[-2px]";

/** Resting and error border colours: the sheets' red-300 at rest, red-500 focused. */
export const fieldBorder = (error?: string | boolean) =>
  error ? "border-red-300" : "border-neutral-300";

export const fieldFocusColour = (error?: string | boolean) =>
  error ? "focus-within:outline-focus-error" : "focus-within:outline-focus";

/**
 * The same ring, for a field that takes focus itself — a select's trigger is
 * one element, not a box around an input.
 */
export const fieldFocusSelf = "focus:outline focus:outline-2 focus:outline-offset-[-2px]";

export const fieldFocusSelfColour = (error?: string | boolean) =>
  error ? "focus:outline-focus-error" : "focus:outline-focus";

/**
 * Horizontal rhythm per size, Figma: text 14px sm, 16px md and lg. The cap
 * height of the sheets' placeholder text settles it: 11.5px at md and lg,
 * 10.1px at sm, so md and lg share a size and sm is one step down.
 * `wrap*` is for content that can take more than one line. Inside, every item
 * is one chip tall, so a row is 24px plus the 6px gap and the box grows in
 * those steps. The padding is the sheet's chip inset, so a single row still
 * measures exactly the size height and the chips keep the same breathing room
 * once the box has grown. The inset is 6, 8 and 10 from the border box and the
 * region's own border accounts for 1px of it, hence 5, 7 and 9.
 * `scroll*` keeps the plain height and reserves a field wide enough to type in
 * while the rest of the line scrolls.
 * `cellBox` is for the verification sheet's display cell: the span that holds
 * it does the sizing, so the box fills rather than fixes its height, and the
 * digit is display-sized — 48px at sm and md, 60 at lg — rather than the
 * field's text size.
 */
export const sizes = {
  sm: {
    box: "h-9 text-sm",
    wrapBox: "min-h-9 text-sm",
    wrapPad: "py-[5px]",
    // The sheets give the textarea two sizes and stop there, so lg borrows md's.
    multilineBox: "text-base",
    // Height and padding sit on the textarea, not the box, so its corner is the
    // field's corner: that is where the sheet draws the resize grip. A min-height
    // on a resizable element also bounds the drag, so the handle can never be
    // pulled inside the sheet's height.
    multilineInput: "h-full min-h-[108px] px-3.5 py-3",
    multilineRows: "h-full px-3.5 py-3",
    multilineInlineBox: "text-base min-h-[110px]",
    multilineInline: "h-full min-h-[84px]",
    // One display digit fills a 64px cell; the font, not the box, carries it.
    cellBox: "h-full text-5xl",
    // With chips sharing the line the region holds the inset and the floor, so
    // the textarea carries neither and stays as short as its content.
    trailingPad: "pr-9",
    input: "h-full min-w-0",
    wrapInput: "h-6 min-w-16",
    scrollInput: "h-full min-w-16",
  },
  md: {
    box: "h-10 text-base",
    wrapBox: "min-h-10 text-base",
    wrapPad: "py-[7px]",
    multilineBox: "text-base",
    multilineInput: "h-full min-h-[126px] px-4 py-3",
    multilineRows: "h-full px-4 py-3",
    multilineInlineBox: "text-base min-h-[128px]",
    multilineInline: "h-full min-h-[102px]",
    cellBox: "h-full text-5xl",
    trailingPad: "pr-10",
    input: "h-full min-w-0",
    wrapInput: "h-6 min-w-16",
    scrollInput: "h-full min-w-16",
  },
  lg: {
    box: "h-11 text-base",
    wrapBox: "min-h-11 text-base",
    wrapPad: "py-[9px]",
    multilineBox: "text-base",
    multilineInput: "min-h-[126px] px-4 py-3",
    multilineRows: "px-4 py-3",
    multilineInlineBox: "text-base min-h-[128px]",
    multilineInline: "min-h-[102px]",
    cellBox: "h-full text-6xl",
    trailingPad: "pr-11",
    input: "h-full min-w-0",
    wrapInput: "h-6 min-w-16",
    scrollInput: "h-full min-w-16",
  },
};
