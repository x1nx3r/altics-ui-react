import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

// TODO(colour tokens): the design sheets use neutral-300 (#D4D4D4) for this
// separator. `bg-border` resolves to the shadcn-derived #E1E7EF instead.
// Swap to the border token once the colour revision lands.

/**
 * Vertical separator between an affix and the text.
 * The separator spans the full height of the box.
 */
export function InputDivider({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={cn("mx-2.5 h-full w-px shrink-0 bg-border", className)}
      {...props}
    />
  );
}
InputDivider.displayName = "InputDivider";
