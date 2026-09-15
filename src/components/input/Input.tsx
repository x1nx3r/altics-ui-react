import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { InputDivider } from "./InputDivider";

/** Horizontal rhythm per size, Figma: text 14px sm/md, 16px lg. */
const sizes = {
  sm: { box: "h-9 text-sm", input: "text-sm" },
  md: { box: "h-10 text-sm", input: "text-sm" },
  lg: { box: "h-11 text-base", input: "text-base" },
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
    const boxPaddingLeft = attachedLeading
      ? "pl-0"
      : leading
        ? showLeadingDivider
          ? "pl-3"
          : "pl-2.5"
        : "pl-3";
    const boxPaddingRight = attachedTrailing
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

    return (
      <div
        className={cn(
          "flex w-full items-center rounded-md border bg-background transition-colors",
          // Sheets: focus is the border edge thickening to 2px in place, not a
          // ring around the box. An outline with a negative offset paints over
          // the 1px border without participating in layout, so nothing shifts.
          "focus-within:outline focus-within:outline-2 focus-within:outline-offset-[-2px]",
          error ? "focus-within:outline-focus-error" : "focus-within:outline-focus",
          sizes[size].box,
          boxPaddingLeft,
          boxPaddingRight,
          // Sheets: rest border is neutral-300, error border red-300.
          error ? "border-red-300" : "border-neutral-300",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {attachedLeading && (
          <span className="flex shrink-0 self-stretch border-r border-neutral-300">
            {attachedLeading}
          </span>
        )}
        {leading && (
          <span
            className={cn(
              "flex shrink-0 items-center gap-2 text-neutral-600",
              // The sheets put 12px between a panel and the content beside it,
              // and 4px between a slot and the text.
              attachedLeading ? "ml-3" : "ml-1",
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
            "h-full min-w-0 flex-1 bg-transparent text-foreground placeholder:text-placeholder focus:outline-none disabled:cursor-not-allowed",
            sizes[size].input,
            inputPaddingLeft,
            inputPaddingRight,
            textAlign === "center" && "text-center",
            textAlign === "right" && "text-right",
          )}
          {...props}
        />
        {trailing && showTrailingDivider && <InputDivider />}
        {trailing && (
          <span
            className={cn(
              "flex shrink-0 items-center gap-2 text-neutral-400",
              attachedTrailing ? "mr-3" : "mr-1",
            )}
          >
            {trailing}
          </span>
        )}
        {attachedTrailing && (
          <span className="flex shrink-0 self-stretch border-l border-neutral-300">
            {attachedTrailing}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
