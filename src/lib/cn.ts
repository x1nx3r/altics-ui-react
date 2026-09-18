import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type { ClassValue };

/**
 * Joins conditional class names and resolves conflicts: when two classes set
 * the same property, the last one wins. A consumer's `className` therefore
 * overrides a component's, deterministically — before this, which class
 * applied was left to Tailwind's stylesheet order. An inline `style` still
 * wins over any class.
 *
 * The same helper the admin portal uses, so both codebases read the same way.
 * Custom named spacing tokens (`gap-md`) are not in tailwind-merge's default
 * scale and stay unresolved; tests/cn.test.ts pins what does merge.
 */
export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}
