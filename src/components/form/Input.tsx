import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";

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
  /** Dividers between affixes and the text. `true` draws both sides,
   * an object controls each side (e.g. money `"Rp"` without divider vs
   * website `"https://"` with one). Defaults to none. */
  divider?: boolean | { leading?: boolean; trailing?: boolean };
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

    return (
      <div
        className={cn(
          "flex w-full items-center rounded-md border bg-background transition-colors",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
          sizes[size].box,
          // Each side is independent: an affix insets its own edge, and the
          // opposite edge keeps the plain text inset. Without this, a
          // trailing-only input loses its left padding entirely.
          leading
            ? showLeadingDivider
              ? "pl-3"
              : "pl-2.5"
            : "pl-3",
          trailing
            ? showTrailingDivider
              ? "pr-3"
              : "pr-2.5"
            : "pr-3",
          error ? "border-destructive" : "border-input",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {leading && (
          <span className="ml-1 flex shrink-0 items-center text-muted-foreground">{leading}</span>
        )}
        {leading && showLeadingDivider && (
          <span aria-hidden="true" className="mx-2.5 h-full w-px shrink-0 bg-border" />
        )}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={invalidState}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed",
            sizes[size].input,
            Boolean(leading) && !showLeadingDivider && "pl-2",
            Boolean(trailing) && !showTrailingDivider && "pr-2",
          )}
          {...props}
        />
        {trailing && showTrailingDivider && (
          <span aria-hidden="true" className="mx-2.5 h-full w-px shrink-0 bg-border" />
        )}
        {trailing && (
          <span className="mr-1 flex shrink-0 items-center text-muted-foreground">{trailing}</span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
