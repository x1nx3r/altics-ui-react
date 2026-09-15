import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { AlertCircleIcon, HelpCircleIcon } from "../icon/icons";
import { InputDivider } from "./InputDivider";

/**
 * Horizontal rhythm per size, Figma: text 14px sm, 16px md and lg. The cap
 * height of the sheets' placeholder text settles it: 11.5px at md and lg,
 * 10.1px at sm, so md and lg share a size and sm is one step down.
 * `grow*` swaps the fixed height for a minimum, so content can wrap onto more
 * lines and the box grows. The field keeps its own height in that mode and
 * needs a floor, or it would squeeze to nothing on a full line. That height is
 * the size minus the region's two 1px borders, so a single row still measures
 * exactly the size height.
 */
const sizes = {
  sm: {
    box: "h-9 text-sm",
    growBox: "min-h-9 text-sm",
    input: "h-full min-w-0",
    growInput: "h-[34px] min-w-16",
  },
  md: {
    box: "h-10 text-base",
    growBox: "min-h-10 text-base",
    input: "h-full min-w-0",
    growInput: "h-[38px] min-w-16",
  },
  lg: {
    box: "h-11 text-base",
    growBox: "min-h-11 text-base",
    input: "h-full min-w-0",
    growInput: "h-[42px] min-w-16",
  },
};

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Box height and padding. */
  size?: "sm" | "md" | "lg";
  /**
   * If the value is true, the box shows the error border.
   * If the value is a string, Field shows the string as the error message.
   */
  error?: string | boolean;
  /** Content before the text (icon, affix, dropdown, or stepper). */
  leading?: ReactNode;
  /** Content after the text (icon, affix, dropdown, or stepper). */
  trailing?: ReactNode;
  /**
   * Control attached to an edge. It spans the full height and sits flush with
   * the border, so it carries its own divider. Used by steppers and by the
   * file upload action region.
   */
  attachedLeading?: ReactNode;
  attachedTrailing?: ReactNode;
  /** Dividers between affixes and the text. `true` draws both sides,
   * an object controls each side (e.g. money `"Rp"` without divider vs
   * website `"https://"` with one). Defaults to none. */
  divider?: boolean | { leading?: boolean; trailing?: boolean };
  /**
   * Alignment of the value and the placeholder inside the box.
   * The sheets centre the horizontal number counter and leave every other
   * type left-aligned.
   */
  textAlign?: "left" | "center" | "right";
  /**
   * Let the box grow past its size height when content wraps onto more lines.
   * Fields are fixed height by the sheets; tag lists are the exception.
   */
  grow?: boolean;
  /**
   * Show the trailing help marker. The sheets draw a question mark for a
   * normal field and the same circle with an exclamation mark in red-600 when
   * the field is in error. Types whose trailing slot is taken (password,
   * steppers) leave it out; the tags sheet draws one.
   */
  helpIcon?: boolean;
  /** Runs when the help marker is pressed. Without this the marker is only a
   * visual affordance and is hidden from assistive technology. */
  onHelpClick?: () => void;
};

/**
 * Text box with optional affix slots.
 * The empty state and the filled state come from the value.
 * The focus ring comes from :focus-within.
 * Use Field for the label, the hint, and the error message.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size = "md",
      error,
      disabled,
      leading,
      trailing,
      attachedLeading,
      attachedTrailing,
      textAlign = "left",
      grow = false,
      helpIcon = true,
      onHelpClick,
      divider = false,
      "aria-invalid": invalid,
      ...props
    },
    ref,
  ) => {
    const invalidState = invalid ?? !!error;
    const showLeadingDivider =
      divider === true || (typeof divider === "object" && !!divider.leading);
    const showTrailingDivider =
      divider === true || (typeof divider === "object" && !!divider.trailing);

    // Exactly one class per side. cn is a plain join and Tailwind decides by
    // source order, so emitting both `pr-3` and `pr-0` silently kept `pr-3`.
    const regionPaddingLeft = attachedLeading
      ? "pl-0"
      : leading
        ? showLeadingDivider
          ? "pl-3"
          : "pl-2.5"
        : "pl-3";
    const regionPaddingRight = attachedTrailing
      ? "pr-0"
      : trailing
        ? showTrailingDivider
          ? "pr-3"
          : "pr-2.5"
        : "pr-3";
    // With a panel on an edge the field keeps the text inset from the panel.
    const inputPaddingLeft = attachedLeading
      ? "pl-3"
      : leading && !showLeadingDivider
        ? "pl-2"
        : undefined;
    const inputPaddingRight = attachedTrailing
      ? "pr-3"
      : trailing && !showTrailingDivider
        ? "pr-2"
        : undefined;
    // Borders belong to the regions, not the box. The value region then owns
    // the border its focus outline paints over, which is how the sheets make
    // focus replace the border instead of sitting beside it. With a panel, the
    // region's inner edge is the divider.
    const borderColour = error ? "border-red-300" : "border-neutral-300";
    // The focus outline follows the rounding of whichever corner the value
    // region owns. With a panel on a side, that side stays square.
    const regionRounding =
      attachedLeading && attachedTrailing
        ? "rounded-none"
        : attachedLeading
          ? "rounded-r-md"
          : attachedTrailing
            ? "rounded-l-md"
            : "rounded-md";

    return (
      <div
        className={cn(
          // No border here: each region draws its own, so focus can paint over
          // the one it owns.
          "flex w-full items-center rounded-md bg-background transition-colors",
          grow ? sizes[size].growBox : sizes[size].box,
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {attachedLeading && (
          <span
            data-slot="panel"
            className={cn(
              "flex shrink-0 self-stretch rounded-l-md border-y border-l",
              borderColour,
            )}
          >
            {attachedLeading}
          </span>
        )}
        {/* The value region carries the focus decoration, not the box: the
            sheets ring only the value area and drop the divider on focus.
            self-stretch is what makes the region fill the box: without it the
            region is only as tall as its text, and the outline becomes a thin
            band around the line instead of the whole input block. */}
        <span
          data-slot="value"
          className={cn(
            "flex min-w-0 flex-1 items-center self-stretch border",
            // Sheet, in px from the field's edge: a chip sits 8 in, the text
            // 12, chips are 6 apart and 8 from the text. Chips and text share
            // one wrapping row, so the chips switch the region to their own
            // inset and the text's extra 2px rides on the input below.
            grow && "flex-wrap gap-x-1.5 gap-y-1.5 has-[[data-slot=tag]]:pl-2",
            borderColour,
            regionRounding,
            regionPaddingLeft,
            regionPaddingRight,
            "focus-within:outline focus-within:outline-2 focus-within:outline-offset-[-2px]",
            error ? "focus-within:outline-focus-error" : "focus-within:outline-focus",
          )}
        >
          {leading && (
            <span
              className={cn(
                // A slot is one un-wrappable box, so when the region wraps it
                // would overflow whole. In grow mode it dissolves and its
                // children wrap with the text instead.
                grow
                  ? "contents"
                  : cn(
                      "flex shrink-0 items-center gap-2 text-neutral-600",
                      // The sheets put 12px between a panel and the content
                      // beside it, and 4px between a slot and the text.
                      attachedLeading ? "ml-3" : "ml-1",
                    ),
              )}
            >
              {leading}
            </span>
          )}
          {leading && showLeadingDivider && <InputDivider />}
          <input
            ref={ref}
            disabled={disabled}
            aria-invalid={invalidState}
            className={cn(
              "flex-1 bg-transparent text-foreground placeholder:text-placeholder focus:outline-none disabled:cursor-not-allowed",
              grow ? sizes[size].growInput : sizes[size].input,
              // Sheet: 8px from the last chip to the text, against a 6px chip
              // gap, so the text carries the extra 2px.
              grow && "ml-0.5",
              inputPaddingLeft,
              inputPaddingRight,
              textAlign === "center" && "text-center",
              textAlign === "right" && "text-right",
            )}
            {...props}
          />
          {trailing && showTrailingDivider && <InputDivider />}
          {(trailing || helpIcon) && (
            <span
              className={cn(
                grow
                  ? "contents"
                  : cn(
                      "flex shrink-0 items-center gap-2",
                      error ? "text-red-600" : "text-neutral-400",
                      attachedTrailing ? "mr-3" : "mr-1",
                    ),
              )}
            >
              {trailing}
              {helpIcon && <HelpMarker error={!!error} disabled={disabled} onClick={onHelpClick} />}
            </span>
          )}
        </span>
        {attachedTrailing && (
          <span
            data-slot="panel"
            className={cn(
              "flex shrink-0 self-stretch rounded-r-md border-y border-r",
              borderColour,
            )}
          >
            {attachedTrailing}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

/**
 * Trailing marker: a question mark at rest, the same circle with an
 * exclamation mark when the field is in error. Decorative unless a handler is
 * given, in which case it becomes a button.
 */
function HelpMarker({
  error,
  disabled,
  onClick,
}: {
  error: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const Glyph = error ? AlertCircleIcon : HelpCircleIcon;
  const colour = error ? "text-red-600" : "text-neutral-400";

  if (!onClick) return <Glyph size={16} className={cn("shrink-0", colour)} />;

  return (
    <button
      type="button"
      aria-label="Help"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-sm transition-colors hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50",
        colour,
      )}
    >
      <Glyph size={16} />
    </button>
  );
}
