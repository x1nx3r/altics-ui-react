import { type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { XIcon } from "../icon/icons";

export type ChipSize = "sm" | "md" | "lg";

export type ChipProps = {
  /** What the chip reads */
  label: string;

  /**
   * An adornment before the label. The sheets inset a chip's adornment 4 and
   * its bare label 10, so the padding and the gap follow it
   * @default undefined
   */
  leading?: ReactNode;

  /**
   * Chip size, following the field it sits in: 24 tall, label 12 at sm and 14
   * above
   * @default "md"
   */
  size?: ChipSize;

  /**
   * Runs when the remove is pressed. Left out, the chip draws no remove
   * @default undefined
   */
  onRemove?: () => void;

  /**
   * Fade the chip and block its remove
   * @default undefined
   */
  disabled?: boolean;
};

/**
 * One chip: a tag inside a field.
 *
 * The same chip serves the tags field and a multiple select's trigger. Both
 * sheets draw it 24 tall with a `#D4D4D4` border and the label `#404040`; the
 * tags sheet fixes the numbers this keeps — 10 of left padding, a 2px gap
 * before the close glyph, and a glyph of 12 at sm and 16 above, whose ink lands
 * 8.5 from the chip's right, which is what the select sheet draws too.
 *
 * @example
 * <Chip label="Design" onRemove={remove} />
 *
 * @example
 * // With an adornment, as the select's Tags type draws it
 * <Chip label="Indonesia" leading={<Avatar fallback="ID" className="h-4 w-4" />} />
 */
export function Chip({ label, leading, size = "md", onRemove, disabled }: ChipProps) {
  return (
    <span
      data-slot="tag"
      className={cn(
        "flex h-6 max-w-full shrink-0 select-none items-center rounded-sm border border-neutral-300 bg-background",
        leading ? "gap-1 pl-1" : "gap-0.5 pl-2.5",
        "pr-1",
      )}
    >
      {leading}
      <span
        title={label}
        className={cn("min-w-0 truncate text-neutral-700", size === "sm" ? "text-xs" : "text-sm")}
      >
        {label}
      </span>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            // A chip inside a trigger must not open the field it sits in
            event.stopPropagation();
            onRemove();
          }}
          className="pointer-events-auto flex items-center text-neutral-600 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XIcon size={size === "sm" ? 12 : 16} />
        </button>
      )}
    </span>
  );
}
