import { useId, useState, type ChangeEvent } from "react";
import { cn } from "../../lib/cn";
import { HelpCircleIcon } from "../icon/icons";
import { Input, type InputProps } from "./Input";
import { Spinner } from "../display";

export type FileInputProps = Omit<
  InputProps,
  "type" | "value" | "defaultValue" | "onChange" | "trailing" | "attachedTrailing" | "readOnly"
> & {
  /** Accepted file types, passed to the file input. */
  accept?: string;
  /** Permit more than one file. */
  multiple?: boolean;
  /** Runs when the selection changes. */
  onFilesChange?: (files: File[]) => void;
  /** Show progress instead of the file icon and block the action. */
  loading?: boolean;
  /** Runs when the help button is pressed. The button shows only when set. */
  onHelpClick?: () => void;
  /** Text of the action. */
  actionLabel?: string;
};

/**
 * File picker in the shape of a field.
 * The value area shows the selected file names.
 * The action region is attached to the trailing edge, divided from the rest.
 * The file input itself is visually hidden but stays in the tab order, so the
 * label opens the picker and the field shows the focus outline.
 *
 * Focus covers the whole field. The sheet rings only the value area and drops
 * the divider, which would leave the action with no focus indicator of its
 * own; one visible outline for the control is the safer reading.
 */
export function FileInput({
  accept,
  multiple,
  onFilesChange,
  loading = false,
  onHelpClick,
  actionLabel = "Browse",
  disabled,
  placeholder = "No file chosen",
  ...props
}: FileInputProps) {
  const id = useId();
  const [names, setNames] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setNames(files.map((file) => file.name).join(", "));
    onFilesChange?.(files);
  }

  const blocked = disabled || loading;

  return (
    <Input
      readOnly
      disabled={disabled}
      value={names}
      placeholder={placeholder}
      trailing={
        <>
          {/* The sheet shows the spinner beside the file icon while uploading,
              not instead of it. */}
          {loading && <Spinner size={16} className="text-focus" />}
          {onHelpClick ? (
            <button
              type="button"
              aria-label="Help"
              disabled={disabled}
              onClick={onHelpClick}
              className="rounded-sm transition-colors hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HelpCircleIcon size={16} />
            </button>
          ) : (
            <HelpCircleIcon size={16} />
          )}
        </>
      }
      attachedTrailing={
        <>
          <input
            id={id}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={blocked}
            onChange={handleChange}
            className="sr-only"
          />
          <label
            htmlFor={id}
            className={cn(
              "flex h-full w-20 items-center justify-center px-3 text-sm font-medium transition-colors",
              blocked
                ? "cursor-not-allowed text-neutral-400"
                : "cursor-pointer text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {actionLabel}
          </label>
        </>
      }
      {...props}
    />
  );
}
FileInput.displayName = "FileInput";
