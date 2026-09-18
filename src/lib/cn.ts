import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { themeExtend } from "../theme/theme-extend";

export type { ClassValue };

/**
 * Joins conditional class names and resolves conflicts: when two classes set
 * the same property, the last one wins. A consumer's `className` therefore
 * overrides a component's, deterministically — before this, which class
 * applied was left to Tailwind's stylesheet order. An inline `style` still
 * wins over any class.
 *
 * The merge scales are derived from the theme. tailwind-merge's defaults only
 * know Tailwind's own names, so a token class (`gap-md`, `rounded-xxs`) would
 * never merge with a class of the same property. Adding a token to the theme
 * teaches this merge too — spacing covers padding, margin, gap, space, inset
 * and the size families, which is where the token names appear.
 */
const merge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: Object.keys(themeExtend.spacing),
      borderRadius: Object.keys(themeExtend.borderRadius),
    },
  },
});

export function cn(...values: ClassValue[]) {
  return merge(clsx(values));
}
