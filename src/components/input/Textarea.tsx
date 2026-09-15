import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const field =
  "flex w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-sm text-foreground placeholder:text-placeholder focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /**
   * If the value is true, the box shows the error border
   * If the values is a string, Field shows the string as the error message
   */
  error?: string | boolean;
};

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
