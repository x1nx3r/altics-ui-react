import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { TagsInput, Input, Field, Textarea, OtpInput, PinInput, ThemeProvider, cn } from "@altics/ui";
import { cn as appCn } from "./lib/cn";
import "@altics/ui/styles.css";
import "../src/index.css";

const LONG =
  "https://example.com/a/really/long/path/that/nobody/would/ever/type/by/hand/but/a/paste/puts/it/here/verbatim?with=query&and=more&more=params";
const MID = "a genuinely enormous tag label that keeps going and going and going";

const r = (n: number) => Math.round(n * 10) / 10;

/** Layout: the long-label cap and the wrap rhythm. */
function layout() {
  const rows: Record<string, unknown>[] = [];
  for (const field of document.querySelectorAll('[data-slot="value"]')) {
    const chips = [...field.querySelectorAll('[data-slot="tag"]')] as HTMLElement[];
    if (!chips.length) continue;
    const fb = field.getBoundingClientRect();
    const chip = chips[0];
    const cb = chip.getBoundingClientRect();
    const label = chip.querySelector("span") as HTMLElement;
    rows.push({
      mode: field.className.includes("flex-wrap") ? "wrap" : "scroll",
      fieldW: r(fb.width),
      chipW: r(cb.width),
      spill: r(cb.right - fb.right),
      chipH: r(cb.height),
      labelOverflow: getComputedStyle(label).overflow,
      ellipsised: label.scrollWidth > label.clientWidth + 1,
      title: label.getAttribute("title") === label.textContent,
    });
  }
  return rows;
}

/** Focus: pressing the field, a chip, and the text itself. */
function focus() {
  const out: Record<string, unknown> = {};
  const region = document.querySelector('[data-slot="value"]') as HTMLElement;
  const input = region.querySelector("input") as HTMLInputElement;
  const chip = region.querySelector('[data-slot="tag"]') as HTMLElement;
  const press = (el: Element) => {
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    return event;
  };

  input.blur();
  const onRegion = press(region);
  out.fromRegion = document.activeElement === input;
  out.regionPrevented = onRegion.defaultPrevented;
  out.regionSelectable = getComputedStyle(chip).userSelect;

  input.blur();
  const onChip = press(chip);
  out.fromChip = document.activeElement === input;
  out.chipPrevented = onChip.defaultPrevented;

  const onText = press(input);
  out.textPrevented = onText.defaultPrevented; // must stay false: caret + drag-select
  return out;
}

/** Trailing marker inset per field shape: plain, with trailing, tags. */
function markers() {
  const rows: Record<string, unknown>[] = [];
  for (const field of document.querySelectorAll('[data-slot="value"]')) {
    const fb = field.getBoundingClientRect();
    const marker = [...field.querySelectorAll("svg")].find((s) => !s.closest('[data-slot="tag"]'));
    // The leading slot is a plain box in every non-overflow case, so its left
    // edge is the affix inset the sheets fix at 13.1 for Leading text md.
    const leadingSlot = [...field.children].find(
      (el) => el.tagName === "SPAN" && el.className !== "contents" && !el.hasAttribute("data-slot"),
    );
    if (!marker && !leadingSlot) continue;
    const mb = marker ? marker.getBoundingClientRect() : null;
    rows.push({
      label: field.closest("[data-case]")?.getAttribute("data-case") ?? "?",
      boxH: r(field.closest('[data-slot="box"]').getBoundingClientRect().height),
      fieldW: r(fb.width),
      markerRightInset: mb ? r(fb.right - mb.right) : null,
      leadingLeftInset: leadingSlot ? r(leadingSlot.getBoundingClientRect().left - fb.left) : null,
      markerVCentre: mb ? r(mb.top - fb.top + mb.height / 2) : null,
    });
  }
  return rows;
}

/** The error border and the error message should be the same colour. */
function errorColours() {
  const region = document.querySelector('[data-case="error"] [data-slot="value"]') as HTMLElement;
  const message = document.querySelector('[data-case="error"] p') as HTMLElement;
  return {
    border: getComputedStyle(region).borderTopColor,
    message: getComputedStyle(message).color,
    match: getComputedStyle(region).borderTopColor === getComputedStyle(message).color,
  };
}

/** With a divider the region must stop at the rule, so the ring does too. */
function divided() {
  const r = (n: number) => Math.round(n * 10) / 10;
  const rows: Record<string, unknown>[] = [];
  for (const box of document.querySelectorAll('[data-case^="divide"]')) {
    const b = box.getBoundingClientRect();
    const el = box.querySelector('[data-slot="value"]') as HTMLElement;
    const region = el.getBoundingClientRect();
    const affix = box.querySelector('[data-slot="affix"]');
    const a = affix ? affix.getBoundingClientRect() : null;
    rows.push({
      label: box.getAttribute("data-case"),
      regionLeftInset: r(region.left - b.left),
      regionRightInset: r(b.right - region.right),
      regionMeetsAffix: a
        ? r(Math.min(Math.abs(region.left - a.right), Math.abs(a.left - region.right)))
        : null,
    });
  }
  return rows;
}

/** The textarea's two sheet metrics: height per size, and the 16px inset. */
function textareas() {
  const r = (n: number) => Math.round(n * 10) / 10;
  return ["textarea md", "textarea sm", "textarea stretched"].map((label) => {
    const box = document.querySelector(`[data-case="${label}"]`) as HTMLElement;
    const b = box.getBoundingClientRect();
    const el = box.querySelector("textarea") as HTMLTextAreaElement;
    const eb = el.getBoundingClientRect();
    return {
      label,
      boxHeight: r(b.height),
      insetLeft: r(eb.left - b.left),
      insetTop: r(eb.top - b.top),
      insetBottom: r(b.bottom - eb.bottom),
      fontSize: getComputedStyle(el).fontSize,
      padding: `${getComputedStyle(el).paddingTop} ${getComputedStyle(el).paddingLeft}`,
      resize: getComputedStyle(el).resize,
      // the UA's own grip: its size is the draggable area, not ours to set
      resizer: (() => {
        const r = getComputedStyle(el, "::-webkit-resizer");
        return `${r.width} x ${r.height}`;
      })(),
    };
  });
}

/** The sheets' textarea-with-chips cell: chips on the field's padding line. */
function tagsTextarea() {
  const r = (n: number) => Math.round(n * 10) / 10;
  const box = document.querySelector('[data-case="tags textarea"]') as HTMLElement;
  const b = box.getBoundingClientRect();
  const chips = [...box.querySelectorAll('[data-slot="tag"]')].map((c) => c.getBoundingClientRect());
  const area = box.querySelector("textarea") as HTMLTextAreaElement;
  return {
    fieldHeight: r(b.height),
    chipLeft: r(Math.min(...chips.map((c) => c.left)) - b.left),
    chipTop: r(Math.min(...chips.map((c) => c.top)) - b.top),
    textareaReaches: r(b.right - area.getBoundingClientRect().right),
    textareaMinH: getComputedStyle(area).minHeight,
  };
}

/** The verification cell (PinInput): square, one step per size, display digit,
 * no inset. OtpInput stays on the field ramp, so it rides along as a control. */
function cells() {
  const r = (n: number) => Math.round(n * 10) / 10;
  return ["pin sm", "pin md", "pin lg", "otp md"].map((label) => {
    const box = document.querySelector(`[data-case="${label}"]`) as HTMLElement;
    const cellSlot = label.startsWith("pin") ? "pin-cell" : "otp-cell";
    const cells = [...box.querySelectorAll(`[data-slot="${cellSlot}"]`)] as HTMLElement[];
    const first = cells[0].getBoundingClientRect();
    const second = cells[1].getBoundingClientRect();
    const region = cells[0].querySelector('[data-slot="value"]') as HTMLElement;
    const mirror = cells[0].querySelector("input") as HTMLInputElement;
    return {
      label,
      cellW: r(first.width),
      cellH: r(first.height),
      gap: r(second.left - first.right),
      digitFont: getComputedStyle(mirror).fontSize,
      regionInset: r(region.getBoundingClientRect().left - first.left),
      placeholder: mirror.placeholder,
      placeholderColour: getComputedStyle(mirror, "::placeholder").color,
    };
  });
}

/** cn merges: a consumer's className replaces the component's own class for
 * that property, and the theme's token scales resolve like any other. */
function merges() {
  const r = (n: number) => Math.round(n * 10) / 10;
  const boxHeight = (label: string) =>
    r(
      (
        document.querySelector(`[data-case="${label}"] [data-slot="box"]`) as HTMLElement
      ).getBoundingClientRect().height,
    );
  const inputFont = (label: string) =>
    getComputedStyle(
      document.querySelector(`[data-case="${label}"] input`) as HTMLInputElement,
    ).fontSize;
  const fieldGap = (label: string) =>
    getComputedStyle(
      document.querySelector(`[data-case="${label}"] > div`) as HTMLElement,
    ).rowGap;
  return {
    defaultHeight: boxHeight("merge default"),
    overriddenHeightUp: boxHeight("merge height up"),
    overriddenHeightDown: boxHeight("merge height down"),
    defaultFont: inputFont("merge default"),
    overriddenFont: inputFont("merge font"),
    defaultFieldGap: fieldGap("merge gap default"),
    tokenFieldGap: fieldGap("merge gap token"),
    defaultTextareaHeight: boxHeight("merge textarea default"),
    overriddenTextareaHeight: boxHeight("merge textarea height"),
  };
}

function consumer() {
  const gapOf = (label: string) =>
    getComputedStyle(
      document.querySelector(`[data-case="${label}"] > div`) as HTMLElement,
    ).rowGap;
  return {
    libraryDefault: cn("gap-2", "gap-brand"),
    consumerMerge: appCn("gap-2", "gap-brand"),
    plainGap: gapOf("consumer plain"),
    brandGap: gapOf("consumer brand"),
  };
}

function measure() {
  const out = document.getElementById("out")!;
  out.textContent = JSON.stringify({
    layout: layout(),
    markers: markers(),
    focus: focus(),
    errors: errorColours(),
    divided: divided(),
    textareas: textareas(),
    tagsTextarea: tagsTextarea(),
    cells: cells(),
    merges: merges(),
    consumer: consumer(),
  });
}

function Probe() {
  useEffect(measure, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 667, padding: 16 }}>
      <div data-case="tags wrap long">
        <TagsInput defaultValue={[LONG, "ok"]} />
      </div>
      <div data-case="tags wrap mid">
        <TagsInput defaultValue={[MID, "ok"]} />
      </div>
      <div data-case="tags scroll long">
        <TagsInput overflow="scroll" defaultValue={[LONG, "ok"]} />
      </div>
      <div data-case="textarea stretched" style={{ display: "grid", height: 170, width: 360 }}>
        <Textarea size="sm" placeholder="In a stretched row" />
      </div>
      <div data-case="tags textarea" style={{ width: 360 }}>
        <TagsInput multiline defaultValue={["Design", "Marketing"]} />
      </div>
      <div data-case="textarea md" style={{ width: 360 }}>
        <Textarea placeholder="Notes" />
      </div>
      <div data-case="textarea sm" style={{ width: 360 }}>
        <Textarea size="sm" placeholder="Notes" />
      </div>
      <div data-case="pin sm">
        <PinInput size="sm" />
      </div>
      <div data-case="pin md">
        <PinInput />
      </div>
      <div data-case="pin lg">
        <PinInput size="lg" />
      </div>
      <div data-case="otp md">
        <OtpInput />
      </div>
      <div data-case="consumer plain">
        <div className={cn("flex flex-col gap-2")}>
          <span className="rounded-sm border border-border p-1 text-xs">one</span>
          <span className="rounded-sm border border-border p-1 text-xs">two</span>
        </div>
      </div>
      <div data-case="consumer brand">
        <div className={appCn("flex flex-col gap-2", "gap-brand")}>
          <span className="rounded-sm border border-border p-1 text-xs">one</span>
          <span className="rounded-sm border border-border p-1 text-xs">two</span>
        </div>
      </div>
      <div data-case="merge default">
        <Input placeholder="Default" />
      </div>
      <div data-case="merge height up">
        <Input className="h-16" placeholder="h-16" />
      </div>
      <div data-case="merge height down">
        <Input className="h-8" placeholder="h-8" />
      </div>
      <div data-case="merge font">
        <Input className="text-lg" placeholder="text-lg" />
      </div>
      <div data-case="merge gap default">
        <Field label="Email">
          <Input />
        </Field>
      </div>
      <div data-case="merge gap token">
        <Field label="Email" className="gap-3xl">
          <Input />
        </Field>
      </div>
      <div data-case="merge textarea default">
        <Textarea placeholder="Default 128" />
      </div>
      <div data-case="merge textarea height">
        <Textarea className="h-64" placeholder="h-64" />
      </div>
      <div data-case="divide leading" style={{ width: 300 }}>
        <Input leading="https://" divider={{ leading: true }} defaultValue="example.com" />
      </div>
      <div data-case="divide trailing" style={{ width: 300 }}>
        <Input trailing="kg" divider={{ trailing: true }} helpIcon={false} defaultValue="70" />
      </div>
      <div data-case="divide undivided" style={{ width: 300 }}>
        <Input leading="Rp" defaultValue="1000" />
      </div>
      <div data-case="error" style={{ width: 300 }}>
        <Field label="Email" error="Required">
          <Input defaultValue="nope" />
        </Field>
      </div>
      <div data-case="plain" style={{ width: 300 }}>
        <Input defaultValue="1000" />
      </div>
      <div data-case="leading+trailing" style={{ width: 300 }}>
        <Input leading="Rp" trailing="kg" defaultValue="1000" />
      </div>
      <div data-case="leading only" style={{ width: 300 }}>
        <Input leading="Rp" defaultValue="1000" />
      </div>
    </div>
  );
}

// Wrap the way an app would: without a theme class the tokens fall back
// to their dark values.
createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <Probe />
  </ThemeProvider>,
);
