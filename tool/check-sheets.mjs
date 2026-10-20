#!/usr/bin/env node
// Validate the tracked sheet cells. Run with `npm run sheets:check`.
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../sheets/", import.meta.url));
const NAME = /^Size=[^,]+(?:, [A-Za-z](?:[A-Za-z ]*[A-Za-z])?=[^,]+)*\.svg$/;
const errors = [];
const counts = new Map();
const seen = new Map();

function rel(path) {
  return relative(ROOT, path);
}

function fail(path, message) {
  errors.push(`${rel(path)}: ${message}`);
}

function checkName(path, name) {
  if (!NAME.test(name)) {
    fail(path, 'expected "Size=..., Key=Value.svg"');
    return;
  }

  const keys = new Set();
  for (const pair of name.slice(0, -4).split(", ")) {
    const at = pair.indexOf("=");
    const key = pair.slice(0, at);
    const value = pair.slice(at + 1);

    if (!/^[A-Za-z](?:[A-Za-z ]*[A-Za-z])?$/.test(key)) {
      fail(path, `bad key "${key}"`);
    }
    if (value === "" || value !== value.trim()) {
      fail(path, `bad value "${value}"`);
    }
    if (keys.has(key)) {
      fail(path, `duplicate key "${key}"`);
    }
    keys.add(key);
  }

  if (/(\(\d+\)|\bcopy\b)/i.test(name)) {
    fail(path, "looks like a duplicate export");
  }

  const key = rel(path).toLowerCase();
  if (seen.has(key)) {
    fail(path, `collides with ${seen.get(key)}`);
  } else {
    seen.set(key, rel(path));
  }
}

async function checkSvg(path) {
  const head = (await readFile(path, "utf8")).slice(0, 1024);
  if (!/<svg\b/.test(head)) fail(path, "no <svg> root");
  if (!/\bviewBox=/.test(head)) fail(path, "no viewBox");
}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.name === "reference") continue;
    if (entry.name.startsWith(".")) {
      fail(path, "hidden file");
      continue;
    }
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (entry.name === "README.md") continue;
    if (!entry.name.endsWith(".svg")) {
      fail(path, "only SVG cells and README.md belong here");
      continue;
    }

    checkName(path, entry.name);
    await checkSvg(path);
    const folder = relative(ROOT, dir) || ".";
    counts.set(folder, (counts.get(folder) ?? 0) + 1);
  }
}

try {
  await readFile(join(ROOT, "README.md"), "utf8");
} catch {
  errors.push("README.md: missing");
}

await walk(ROOT);

if (errors.length > 0) {
  for (const error of errors) console.error(`  ${error}`);
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}

const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
console.log(`OK: ${total} SVG cells in ${counts.size} folders`);
for (const [folder, count] of [...counts].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`  ${String(count).padStart(4)}  ${folder}`);
}
