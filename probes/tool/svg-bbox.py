#!/usr/bin/env python3
"""Exact SVG path bounding boxes, via Chromium's getBBox.

The sheet exports have no groups, so the only reliable way to read their
geometry is to render them and ask the browser. Pixel scans are confounded by
anti-aliasing and curve control points overstate a path's extent, so prefer
this for anything a tolerance of a pixel would change.

Usage:
    python3 tool/svg-bbox.py <file.svg> [<file.svg> ...]

Prints one line per path: index, bbox, fill, and the start of the path data.
"""
import html
import json
import os
import subprocess
import sys

PAGE = "/tmp/opencode/bbox.html"


def bboxes(svg_path: str):
    svg = open(svg_path, encoding="utf-8").read()
    open(PAGE, "w", encoding="utf-8").write(
        """<!doctype html><meta charset="utf-8"><body>"""
        + svg
        + """
<script>
window.addEventListener('load', () => {
  const out = [...document.querySelectorAll('path')].map((p, i) => {
    const b = p.getBBox();
    return { i, x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2),
             h: +b.height.toFixed(2), fill: p.getAttribute('fill'),
             stroke: p.getAttribute('stroke'), d: (p.getAttribute('d') || '').slice(0, 20) };
  });
  const pre = document.createElement('pre');
  pre.id = 'OUT';
  pre.textContent = JSON.stringify(out);
  document.body.appendChild(pre);
});
</script></body>"""
    )
    dom = subprocess.run(
        ["chromium", "--headless", "--disable-gpu", "--no-sandbox",
         "--virtual-time-budget=3000", "--dump-dom", PAGE],
        capture_output=True, text=True,
    ).stdout
    start = dom.find('<pre id="OUT">')
    if start < 0:
        return None
    raw = dom[start + len('<pre id="OUT">'):dom.find("</pre>", start)]
    return json.loads(html.unescape(raw))


def main(paths, band=None):
    for path in paths:
        rows = bboxes(path)
        print(f"=== {os.path.basename(path)}")
        if rows is None:
            print("   (no output — did chromium run?)")
            continue
        for r in rows:
            # The sheets put the caption below the field, so a band used to hide
            # it — but it also hid the menu items, whose rows sit above y 26.
            # Print everything unless the caller asks for a band.
            if r["w"] <= 0:
                continue
            if band and not (band[0] <= r["y"] <= band[1]):
                continue
            print(f"   [{r['i']:3}] x {r['x']:7.2f}..{r['x'] + r['w']:7.2f}"
                  f"  y {r['y']:6.2f}..{r['y'] + r['h']:6.2f}"
                  f"  {r['w']:7.2f}x{r['h']:6.2f}  fill={r['fill']} stroke={r['stroke']}")


if __name__ == "__main__":
    args = sys.argv[1:]
    band = None
    if args and args[0].startswith("--band="):
        low, high = args[0].split("=", 1)[1].split(",")
        band = (float(low), float(high))
        args = args[1:]
    if not args:
        print(__doc__)
        raise SystemExit(1)
    main(args, band)
