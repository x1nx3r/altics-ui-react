import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "../../lib/cn";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon, PlusIcon } from "../icon/icons";
import { Input, type InputProps } from "./Input";

export type NumberInputProps = Omit<
  InputProps,
  "type" | "value" | "defaultValue" | "onChange" | "leading" | "trailing" | "inputMode" | "role"
> & {
  /** The value. Use this for controlled use. */
  value?: number | null;
  /** The initial value. Use this for uncontrolled use. */
  defaultValue?: number | null;
  /** Runs when the value changes. */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /**
   * "horizontal" puts the steppers at each end of the box.
   * "vertical" puts a stacked stepper column at the trailing edge.
   */
  orientation?: "horizontal" | "vertical";
};

function toText(value: number | null | undefined): string {
  return value === null || value === undefined || Number.isNaN(value) ? "" : String(value);
}

/** Decimal places in a step, so 0.1 does not drift to 0.30000000000000004. */
function precisionOf(step: number): number {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

export function NumberInput({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step = 1,
  orientation = "horizontal",
  disabled,
  size = "md",
  onBlur,
  ...props
}: NumberInputProps) {
  const [uncontrolled, setUncontrolled] = useState<number | null>(defaultValue);
  const current = value !== undefined ? value : uncontrolled;
  const [draft, setDraft] = useState(() => toText(defaultValue));

  // Steps must build on the previous step, not on the value from the last
  // render. Without this, clicking fast (or holding) drops steps, because
  // every click in the same batch reads the same stale value.
  const latest = useRef<number | null>(current);
  useEffect(() => {
    latest.current = current;
  }, [current]);

  // Follow the value when it is controlled from outside.
  useEffect(() => {
    if (value !== undefined) setDraft(toText(value));
  }, [value]);

  function clamp(next: number): number {
    let result = next;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
  }

  function commit(next: number | null) {
    latest.current = next;
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }

  function parse(text: string): number | null {
    const trimmed = text.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? current : parsed;
  }

  function stepBy(direction: 1 | -1) {
    const base = latest.current ?? min ?? 0;
    const next = Number((base + direction * step).toFixed(precisionOf(step)));
    const clamped = clamp(next);
    // In controlled use the value prop drives the text; only an uncontrolled
    // field writes its own draft.
    if (value === undefined) setDraft(toText(clamped));
    commit(clamped);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    setDraft(text);
    const parsed = parse(text);
    if (parsed !== null) commit(parsed);
    if (text.trim() === "") commit(null);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const parsed = parse(draft);
    const next = parsed === null ? null : clamp(parsed);
    if (value === undefined) setDraft(toText(next));
    commit(next);
    onBlur?.(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepBy(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(-1);
    }
  }

  const stepperProps = {
    type: "button" as const,
    disabled,
    tabIndex: -1,
  };

  const stepperButton =
    "flex flex-1 items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50";

  const input = (
    <Input
      type="text"
      size={size}
      disabled={disabled}
      inputMode="decimal"
      role="spinbutton"
      aria-valuenow={current ?? undefined}
      aria-valuemin={min}
      aria-valuemax={max}
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      leading={
        orientation === "horizontal" ? (
          <button
            {...stepperProps}
            aria-label="Decrease"
            className={cn("rounded-sm px-0.5", stepperButton)}
            onClick={() => stepBy(-1)}
          >
            <MinusIcon size={16} />
          </button>
        ) : undefined
      }
      trailing={
        orientation === "horizontal" ? (
          <button
            {...stepperProps}
            aria-label="Increase"
            className={cn("rounded-sm px-0.5", stepperButton)}
            onClick={() => stepBy(1)}
          >
            <PlusIcon size={16} />
          </button>
        ) : undefined
      }
      attachedTrailing={
        orientation === "vertical" ? (
          <span className="flex w-7 flex-col">
            <button
              {...stepperProps}
              aria-label="Increase"
              className={stepperButton}
              onClick={() => stepBy(1)}
            >
              <ChevronUpIcon size={16} />
            </button>
            <button
              {...stepperProps}
              aria-label="Decrease"
              className={cn(stepperButton, "border-t border-neutral-300")}
              onClick={() => stepBy(-1)}
            >
              <ChevronDownIcon size={16} />
            </button>
          </span>
        ) : undefined
      }
      {...props}
    />
  );

  return input;
}
NumberInput.displayName = "NumberInput";
