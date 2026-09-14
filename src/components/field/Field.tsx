import {
  cloneElement,
  isValidElement,
  useId,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";
import { Label } from "./Label";

export type FieldProps = Omit<HTMLAttributes<HTMLDivElement>, "label"> & {
  /** Text above the box **/
  label?: ReactNode;
  /** If value is true, the label show a required asterisks **/
  required?: boolean;
  /** Help text below the box, The error message replaces it **/
  hint?: ReactNode;
  /** If the value is a string, the box shows the error border.
   * Field shows the string below the box
   **/
  error?: string | false | null;
  /** the input element. Field sets it's id and descriptions **/
  children: ReactNode;
};

export function Field({ label, required, hint, error, children, className, ...props }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const messageId = error ? errorId : hint ? hintId : undefined;

  const childProps = (children as ReactElement<Record<string, unknown>>)?.props;
  const describedBy = [childProps?.["aria-describedby"], messageId].filter(Boolean).join(" ");

  const child =
    isValidElement(children) && typeof children.type !== "string"
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          id: (children as ReactElement<Record<string, unknown>>).props.id ?? id,
          ...(error !== undefined &&
          (children as ReactElement<Record<string, unknown>>).props.error === undefined
            ? { error }
            : null),
          ...(required &&
          (children as ReactElement<Record<string, unknown>>).props.required === undefined
            ? { required: true }
            : null),
          ...(describedBy ? { "aria-describedby": describedBy } : null),
        })
      : children;
  return (
    <div className={cn("flex flex-col gap-md", className)} {...props}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && (
            <span aria-hidden="true" className="text-primary">
              {" *"}
            </span>
          )}
        </Label>
      )}
      {child}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
Field.displayName = "Field";
