import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { themeExtend } from "../theme/theme-extend";

export type { ClassValue };

/** A scale as a theme writes it: a map of names, or the names alone. */
export type Scale = Record<string, unknown> | readonly string[];

function names(scale: Scale | undefined): string[] {
  if (!scale) return [];
  return Array.isArray(scale) ? [...(scale as readonly string[])] : Object.keys(scale);
}

/**
 * Joins conditional class names and resolves conflicts: when two classes set
 * the same property, the last one wins, so a consumer's `className` overrides
 * a component's deterministically. An inline `style` still wins over any class.
 *
 * The merge scales are derived from the theme. tailwind-merge's defaults only
 * know Tailwind's own names, so a token class (`gap-md`, `rounded-xxs`) would
 * never merge with a class of the same property. Spacing covers padding,
 * margin, gap, space, inset and the size families; radius has its own key.
 */
export const cn = createCn();

/**
 * The same merge, with a consumer's own token names added to the design
 * system's scales — for use in the consumer's own components.
 *
 * The library's components merge with the library's own instance, so a
 * className carrying a consumer token (`gap-brand`) still cannot replace one
 * of the library's classes: that instance has never seen the name. For an
 * override on a library component, use a default-scale or arbitrary-value
 * class (`gap-[3.5rem]`), which the instance does know.
 *
 * @example
 * const c = createCn({ spacing: myTheme.extend.spacing });
 * c("gap-2", "gap-brand") // "gap-brand"
 */
export function createCn(extra?: { spacing?: Scale; borderRadius?: Scale }) {
  const merge = extendTailwindMerge({
    extend: {
      theme: {
        spacing: [...Object.keys(themeExtend.spacing), ...names(extra?.spacing)],
        borderRadius: [...Object.keys(themeExtend.borderRadius), ...names(extra?.borderRadius)],
      },
    },
  });
  return (...values: ClassValue[]) => merge(clsx(values));
}
