// Drive the sheet canvas with real input events over CDP, to answer whether
// the components on it are interactable and how the canvas behaves around them.
const PORT = Number(process.env.CDP_PORT ?? 9223);
const PAGE_URL = process.env.PAGE_URL ?? "http://localhost:5173/?page=sheet";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let page;
for (let i = 0; i < 40; i++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    page = targets.find((t) => t.type === "page");
    if (page) break;
  } catch {}
  await sleep(250);
}
if (!page) throw new Error("no page target");

const ws = new WebSocket(page.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const res = await send("Runtime.evaluate", { expression, returnByValue: true });
  if (res.result?.exceptionDetails) {
    throw new Error(JSON.stringify(res.result.exceptionDetails));
  }
  return res.result?.result?.value;
};

const click = async (x, y) => {
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
};

const report = {};
await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: PAGE_URL });
await sleep(7000);

report.overlay = await evaluate(`!!document.querySelector("vite-error-overlay")`);
const canvasEl = `document.querySelector(".h-screen > div")`;

// --- A. cursor: what does the canvas show over a control, and over itself? ---
await evaluate(`${canvasEl}.scrollTo(0, 0)`);
await sleep(150);
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 30, y: 30 });
await sleep(250);
report.cursorOverCanvas = await evaluate(`getComputedStyle(${canvasEl}).cursor`);

const trig = await evaluate(`(() => {
  const t = [...document.querySelectorAll('[role="combobox"]')].find(
    (b) => b.getAttribute('aria-expanded') === 'false' && !b.disabled,
  );
  t.scrollIntoView({ block: "center", inline: "center" });
  const r = t.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), id: t.id };
})()`);
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: trig.x, y: trig.y });
await sleep(250);
report.cursorOverControl = await evaluate(`getComputedStyle(${canvasEl}).cursor`);

// --- B. a press on a trigger opens its own panel ---
await click(trig.x, trig.y);
await sleep(450);
const opened = await evaluate(`(() => {
  const t = document.getElementById(${JSON.stringify(trig.id)});
  const panel = document.getElementById(t.getAttribute("aria-controls") ?? "");
  return { open: !!panel, options: panel ? panel.querySelectorAll('[role="option"]').length : 0 };
})()`);
report.openedOnPress = opened;

// --- C. choosing an option updates the value and closes ---
if (opened.open) {
  const opt = await evaluate(`(() => {
    const t = document.getElementById(${JSON.stringify(trig.id)});
    const panel = document.getElementById(t.getAttribute("aria-controls"));
    const rows = [...panel.querySelectorAll('[role="option"]')];
    const o = rows.filter((r) => !r.getAttribute("aria-disabled"))[1] ?? rows[0];
    const r = o.getBoundingClientRect();
    return {
      x: Math.round(r.x + r.width / 2),
      y: Math.round(r.y + r.height / 2),
      label: o.textContent.slice(0, 24),
      panelId: panel.id,
    };
  })()`);
  await click(opt.x, opt.y);
  await sleep(450);
  report.chooseOption = await evaluate(`(() => {
    const t = document.getElementById(${JSON.stringify(trig.id)});
    return {
      chose: ${JSON.stringify(opt.label)},
      value: t.closest('[data-slot=select]').textContent.replace(/\\s+/g, " ").slice(0, 60),
      panelClosed: !document.getElementById(${JSON.stringify(opt.panelId)}),
    };
  })()`);
}

// --- D. a multiple select: search filters, the panel stays open ---
const multi = await evaluate(`(() => {
  const t = [...document.querySelectorAll('[role="combobox"]')].find(
    (b) =>
      b.getAttribute('aria-expanded') === 'false' &&
      !b.disabled &&
      b.closest('[data-slot=select]').textContent.includes('selected'),
  );
  if (!t) return null;
  t.scrollIntoView({ block: "center", inline: "center" });
  const r = t.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), id: t.id };
})()`);
if (multi) {
  await click(multi.x, multi.y);
  await sleep(450);
  const search = await evaluate(`(() => {
    const t = document.getElementById(${JSON.stringify(multi.id)});
    const panel = document.getElementById(t.getAttribute("aria-controls"));
    if (!panel) return null;
    const input = panel.querySelector("input");
    if (!input) return { noSearchRow: true };
    const r = input.getBoundingClientRect();
    return {
      x: Math.round(r.x + r.width / 2),
      y: Math.round(r.y + r.height / 2),
      before: panel.querySelectorAll('[role="option"]').length,
    };
  })()`);
  if (search && !search.noSearchRow) {
    await click(search.x, search.y);
    await sleep(250);
    await send("Input.insertText", { text: "si" });
    await sleep(500);
    report.multiSearch = await evaluate(`(() => {
      const t = document.getElementById(${JSON.stringify(multi.id)});
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      return {
        before: ${search.before},
        after: panel ? panel.querySelectorAll('[role="option"]').length : 0,
        stillOpen: !!panel,
      };
    })()`);
  } else {
    report.multiSearch = search;
  }
}

// --- E. dragging the background pans ---
await evaluate(`${canvasEl}.scrollTo(300, 200)`);
await sleep(200);
const spot = await evaluate(`(() => {
  const cells = [...document.querySelectorAll('[data-slot="select"]')].map((c) => c.getBoundingClientRect());
  // the gutter to the left of a visible cell: not a control, so it pans
  const r = cells.find((r) => r.x > 80 && r.x < innerWidth - 420 && r.y > 60 && r.y < innerHeight - 200);
  return { x: Math.round(r.x - 20), y: Math.round(r.y + r.height / 2) };
})()`);
const beforePan = await evaluate(`JSON.stringify({ l: ${canvasEl}.scrollLeft, t: ${canvasEl}.scrollTop })`);
await send("Input.dispatchMouseEvent", { type: "mousePressed", x: spot.x, y: spot.y, button: "left", clickCount: 1 });
for (let i = 1; i <= 4; i++) {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: spot.x + i * 30, y: spot.y + i * 15, button: "left" });
  await sleep(60);
}
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: spot.x + 120, y: spot.y + 60, button: "left", clickCount: 1 });
await sleep(250);
report.pan = await evaluate(`(() => {
  const el = ${canvasEl};
  return { before: ${beforePan}, after: { scrollLeft: el.scrollLeft, scrollTop: el.scrollTop } };
})()`);

// --- F. ctrl + wheel zooms the canvas, not the browser ---
const beforeZoom = await evaluate(`document.querySelector(".bottom-4").textContent.match(/\\d+%/)[0]`);
await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 900, y: 500, deltaX: 0, deltaY: -240, modifiers: 2 });
await sleep(400);
report.zoom = await evaluate(`(() => ({
  before: ${JSON.stringify(beforeZoom)},
  after: document.querySelector(".bottom-4").textContent.match(/\\d+%/)[0],
  browserZoom: window.visualViewport.scale,
}))()`);

console.log(JSON.stringify(report, null, 2));
ws.close();
process.exit(0);
