import { describe, expect, it } from "vitest";
import { cn, createCn } from "../src/lib/cn";

describe("cn", () => {
  it("joins conditional class names and drops the falsy ones", () => {
    const hidden: string | false = false;
    expect(cn("a", hidden && "b", undefined, null, "c")).toBe("a c");
    // clsx also flattens arrays, which the old join did not accept.
    expect(cn("a", ["b", hidden && "c"])).toBe("a b");
  });

  it("lets the last class win when two set the same property", () => {
    expect(cn("pl-3", "pl-0")).toBe("pl-0");
    expect(cn("h-9", "h-16")).toBe("h-16");
    expect(cn("w-full", "w-20")).toBe("w-20");
    expect(cn("ring-2", "ring-0")).toBe("ring-0");
    expect(cn("rounded-sm", "rounded-xs")).toBe("rounded-xs");
  });

  it("resolves the theme's colour classes", () => {
    expect(cn("text-foreground", "text-primary")).toBe("text-primary");
    expect(cn("bg-background", "bg-primary")).toBe("bg-primary");
    expect(cn("border-neutral-300", "border-red-300")).toBe("border-red-300");
  });

  it("keeps classes that set different properties", () => {
    // The active OTP cell relies on this: in Tailwind 3, outline (style) and
    // outline-2 (width) are separate properties. tailwind-merge v3, which
    // targets Tailwind 4, drops the style class here — hence v2.
    expect(cn("outline", "outline-2", "outline-offset-[-2px]", "outline-focus")).toBe(
      "outline outline-2 outline-offset-[-2px] outline-focus",
    );
    expect(cn("min-h-10", "h-11")).toBe("min-h-10 h-11");
  });

  it("resolves within a variant and keeps variants apart", () => {
    expect(cn("hover:p-2", "hover:p-4")).toBe("hover:p-4");
    expect(cn("p-2", "hover:p-4")).toBe("p-2 hover:p-4");
    expect(cn("focus-within:outline", "focus-within:outline-2")).toBe(
      "focus-within:outline focus-within:outline-2",
    );
  });

  it("resolves arbitrary values", () => {
    expect(cn("text-[10px]", "text-sm")).toBe("text-sm");
  });

  it("keeps an important class alongside its normal counterpart", () => {
    // Text's size map uses `!`, so its size wins by specificity rather than
    // by order — a consumer's text-* class cannot override it.
    expect(cn("!text-[10px]", "text-sm")).toBe("!text-[10px] text-sm");
  });

  it("resolves the theme's own token scales", () => {
    // The merge scales are derived from the theme, so a token class merges
    // with any other class of the same property. Spacing covers padding,
    // margin, gap, space, inset and the size families; the padding and radius
    // namespaces carry keys of their own; maxWidth is taught as a class group.
    expect(cn("p-2", "p-md")).toBe("p-md");
    expect(cn("px-2", "px-lg")).toBe("px-lg");
    expect(cn("gap-2", "gap-3xl")).toBe("gap-3xl");
    expect(cn("space-y-2", "space-y-sm")).toBe("space-y-sm");
    expect(cn("w-full", "w-5xl")).toBe("w-5xl");
    expect(cn("min-h-10", "min-h-4xl")).toBe("min-h-4xl");
    expect(cn("rounded-sm", "rounded-xxs")).toBe("rounded-xxs");
    // the container namespaces: real classes, generated from the theme
    expect(cn("p-2", "p-container-mobile")).toBe("p-container-mobile");
    expect(cn("px-2", "px-container-desktop")).toBe("px-container-desktop");
    expect(cn("max-w-full", "max-w-paragraph")).toBe("max-w-paragraph");
    expect(cn("max-w-full", "max-w-container-desktop")).toBe("max-w-container-desktop");
  });

  it("lets a consumer add their own scales through createCn", () => {
    // A theme-shaped map, as a consumer's tailwind config would write it.
    const brand = createCn({ spacing: { brand: "3.5rem" } });
    expect(brand("gap-2", "gap-brand")).toBe("gap-brand");
    expect(brand("p-2", "p-brand")).toBe("p-brand");
    // the names alone work too, and the library's scales still merge
    expect(createCn({ spacing: ["brand"] })("gap-2", "gap-brand")).toBe("gap-brand");
    expect(brand("gap-2", "gap-3xl")).toBe("gap-3xl");
    // every scale the library covers is open to the consumer's names too
    expect(createCn({ padding: { gutter: "1.5rem" } })("p-2", "p-gutter")).toBe("p-gutter");
    expect(createCn({ maxWidth: { prose: "65ch" } })("max-w-full", "max-w-prose")).toBe(
      "max-w-prose",
    );

    // The library's own instance has never seen the consumer's name, which is
    // why an override on a library component should use the default scale or
    // an arbitrary value instead.
    expect(cn("gap-2", "gap-brand")).toBe("gap-2 gap-brand");
    expect(cn("gap-2", "gap-[3.5rem]")).toBe("gap-[3.5rem]");
  });
});
