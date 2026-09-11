import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-3 text-sm",
  lg: "h-11 px-4 text-base",
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
          sizes[size],
          error ? "border-destructive" : "border-input",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {leading && (
          <span className="flex shrink-0 items-center text-muted-foreground">{leading}</span>
        )}
        {leading && showLeadingDivider && (
          <span aria-hidden="true" className="mx-2 h-5 w-px shrink-0 bg-border" />
        )}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={invalidState}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
          {...props}
        />
        {trailing && showTrailingDivider && (
          <span aria-hidden="true" className="mx-2 h-5 w-px shrink-0 bg-border" />
        )}
        {trailing && (
          <span className="flex shrink-0 items-center text-muted-foreground">{trailing}</span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
