import { useState } from "react";
import { cn } from "../../lib/cn";
import { EyeIcon, EyeOffIcon } from "../icon/icons";
import { Input, type InputProps } from "./Input";

export type PasswordInputProps = Omit<InputProps, "type" | "trailing"> & {
  /** Initial visibility. Use this for uncontrolled use. */
  defaultVisible?: boolean;
  /** Visibility. Use this for controlled use. */
  visible?: boolean;
  /** Runs when the user changes the visibility. */
  onVisibleChange?: (visible: boolean) => void;
};

/**
 * Password box with a visibility toggle.
 * The toggle occupies the trailing slot.
 * The value is always plain text; only the input type changes.
 */
export function PasswordInput({
  defaultVisible = false,
  visible,
  onVisibleChange,
  disabled,
  ...props
}: PasswordInputProps) {
  const [uncontrolledVisible, setUncontrolledVisible] = useState(defaultVisible);
  const isVisible = visible ?? uncontrolledVisible;

  function toggle() {
    const next = !isVisible;
    if (visible === undefined) setUncontrolledVisible(next);
    onVisibleChange?.(next);
  }

  const ToggleIcon = isVisible ? EyeOffIcon : EyeIcon;

  return (
    <Input
      type={isVisible ? "text" : "password"}
      disabled={disabled}
      trailing={
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          aria-pressed={isVisible}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className={cn(
            "rounded-sm text-muted-foreground transition-colors",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <ToggleIcon size={16} />
        </button>
      }
      {...props}
    />
  );
}
PasswordInput.displayName = "PasswordInput";
