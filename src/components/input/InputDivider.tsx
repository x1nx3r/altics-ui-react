import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

/**
 * Vertical separator between an affix and the text.
 * The separator spans the full height of the box.
 */
export function InputDivider({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={cn("mx-2.5 h-full w-px shrink-0 bg-neutral-300", className)}
      {...props}
    />
  );
}
InputDivider.displayName = "InputDivider";
