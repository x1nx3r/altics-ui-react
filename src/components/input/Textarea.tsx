import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const field =
  "flex w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-sm text-foreground placeholder:text-placeholder focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /**
   * Error state. `true` paints the error border; a string does the same and
   * `Field` prints the string below the box
   * @default undefined
   */
  error?: string | boolean;
};

/**
 * Multi-line text box.
 *
 * The same chrome as `Input` without the slots: a rounded border, 12px of
 * side inset, and the sheets' focus outline drawn in place over the border.
 * `Field` supplies the label, the hint and the error message.
 *
 * @example
 * <Textarea placeholder="Notes" />
 *
 * @example
 * <Field label="Notes" hint="Markdown is fine">
 *   <Textarea rows={4} />
 * </Field>
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, "aria-invalid": invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid ?? !!error}
      className={cn(field, "min-h-24", error && "border-destructive", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
