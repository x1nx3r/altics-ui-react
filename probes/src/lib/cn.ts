import { createCn } from "@altics/ui";

/**
 * The app's own merge, defined once and imported wherever a className is
 * composed — the way an app keeps its `cn`. The design system's scales come
 * with it; this only adds the app's own token names, which live in this app's
 * tailwind.config (spacing.brand).
 */
export const cn = createCn({ spacing: { brand: "3.5rem" } });
