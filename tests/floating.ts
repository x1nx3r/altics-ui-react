import type { Platform } from "@floating-ui/react";

/**
 * A deterministic platform for tests, in the spirit of floating-ui's own.
 *
 * jsdom performs no layout, so every rect is 0x0 — and with an aligned
 * placement (`bottom-start`) and a reference that has no size, `flip` never
 * settles. Real rects keep the middleware honest and finite, so tests exercise
 * the same configuration the browser gets.
 */
export const testPlatform: Platform = {
  getElementRects: () => ({
    reference: { x: 0, y: 0, width: 320, height: 40 },
    floating: { x: 0, y: 44, width: 320, height: 256 },
  }),
  getClippingRect: () => ({ x: 0, y: 0, width: 1024, height: 768 }),
  getDimensions: () => ({ width: 320, height: 256 }),
  convertOffsetParentRelativeRectToViewportRelativeRect: ({ rect }) => rect,
  getOffsetParent: () => document.body,
  isElement: (value) => value instanceof Element,
  getDocumentElement: () => document.documentElement,
  getClientRects: (element: Element) => [element.getBoundingClientRect()],
  isRTL: (element: Element) => getComputedStyle(element).direction === "rtl",
  getScale: () => ({ x: 1, y: 1 }),
};
