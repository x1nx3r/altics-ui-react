import { describe, expect, it } from "vitest";
import { cn } from "../src/lib/cn";

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

  it("leaves the named spacing tokens unresolved", () => {
    // tailwind-merge's default scale does not know our token names
    // (spacing: xxs..11xl). One component uses one of them; if that grows,
    // add an extendTailwindMerge for the scale and update this test.
    expect(cn("gap-md", "gap-2")).toBe("gap-md gap-2");
  });
});
