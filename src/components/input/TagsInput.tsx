import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "../../lib/cn";
import { XIcon } from "../icon/icons";
import { Input, type InputProps } from "./Input";

export type TagsInputProps = Omit<
  InputProps,
  "value" | "defaultValue" | "onChange" | "leading" | "trailing"
> & {
  /** The tags. Use this for controlled use. */
  value?: string[];
  /** The initial tags. Use this for uncontrolled use. */
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  /** Where the tags render: inside the field, or in a row below it. */
  chips?: "inside" | "below";
  /** Stop accepting tags after this many. */
  maxTags?: number;
};

/**
 * One tag. Figma at md: 78px wide for "Design", 24px tall at every size, 6px
 * radius, 1px neutral-300 border, 10px left padding, 2px between the label and
 * the close glyph, and the glyph's centre 12px from the right edge. The label
 * and the glyph step down one size on sm.
 */
function Chip({
  label,
  size,
  disabled,
  onRemove,
}: {
  label: string;
  size: "sm" | "md" | "lg";
  disabled?: boolean;
  onRemove: () => void;
}) {
  return (
    <span
      data-slot="tag"
      className="flex h-6 shrink-0 items-center gap-0.5 rounded-sm border border-neutral-300 bg-background pr-1 pl-2.5"
    >
      <span className={cn("text-neutral-700", size === "sm" ? "text-xs" : "text-sm")}>{label}</span>
      <button
        type="button"
        aria-label={`Remove ${label}`}
        disabled={disabled}
        onClick={onRemove}
        className="flex items-center text-neutral-600 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
      >
        <XIcon size={size === "sm" ? 12 : 16} />
      </button>
    </span>
  );
}

/**
 * Field that collects tags.
 *
 * Enter or comma commits the typed text, Backspace on an empty field removes the
 * last tag, and a paste splits on commas and newlines. Empty and duplicate tags
 * are dropped. The chips render inside the field or in a row below it.
 */
export function TagsInput({
  value,
  defaultValue = [],
  onValueChange,
  chips = "inside",
  maxTags,
  size = "md",
  disabled,
  placeholder,
  className,
  ...props
}: TagsInputProps) {
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultValue);
  const tags = value ?? uncontrolled;
  const [draft, setDraft] = useState("");

  function commit(candidates: string[]) {
    const next = [...tags];
    for (const candidate of candidates) {
      const tag = candidate.trim();
      if (!tag || next.includes(tag)) continue;
      if (maxTags !== undefined && next.length >= maxTags) break;
      next.push(tag);
    }
    if (next.length === tags.length) return;
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }

  function remove(tag: string) {
    const next = tags.filter((item) => item !== tag);
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit([draft]);
      setDraft("");
      return;
    }
    if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      event.preventDefault();
      remove(tags[tags.length - 1]);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (!/[\n,]/.test(text)) return;
    event.preventDefault();
    commit(text.split(/[\n,]+/));
    setDraft("");
  }

  const chipNodes = tags.map((tag) => (
    <Chip key={tag} label={tag} size={size} disabled={disabled} onRemove={() => remove(tag)} />
  ));

  const field = (
    <Input
      disabled={disabled}
      size={size}
      // Chips inside can wrap, so the box grows past its size height.
      grow={chips === "inside"}
      placeholder={tags.length === 0 ? placeholder : undefined}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      leading={chips === "inside" ? chipNodes : undefined}
      {...props}
    />
  );

  if (chips === "below") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {field}
        {/* Sheet: the chips start flush with the field's border, 6px apart. */}
        {tags.length > 0 && <div className="flex flex-wrap items-center gap-1.5">{chipNodes}</div>}
      </div>
    );
  }

  return <div className={className}>{field}</div>;
}
TagsInput.displayName = "TagsInput";
