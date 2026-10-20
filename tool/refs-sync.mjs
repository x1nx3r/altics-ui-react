#!/usr/bin/env node
// Initialise the reference submodules with full history and cut each worktree
// down to the paths the plans actually read. Safe to re-run.
//
//   node tool/refs-sync.mjs            all refs, sparse worktrees
//   node tool/refs-sync.mjs --full     all refs, full worktrees
//   node tool/refs-sync.mjs mui ark    named refs only
//
// The history is always complete. A shallow ref is a snapshot; the commit that
// changed a behavior is part of the reference.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "tool/refs.json"), "utf8"));

const args = process.argv.slice(2);
const full = args.includes("--full");
const only = args.filter((arg) => !arg.startsWith("-"));

const superproject = (argv) =>
  execFileSync("git", argv, { cwd: root, stdio: "inherit" });

const inRef = (path, argv, quiet = false) =>
  execFileSync("git", ["-C", join(root, path), ...argv], {
    encoding: "utf8",
    stdio: quiet ? "pipe" : "inherit",
  });

const refs = manifest.refs.filter((ref) => !only.length || only.includes(ref.name));
if (!refs.length) {
  console.error(`No ref matched: ${only.join(", ")}`);
  process.exit(1);
}

for (const ref of refs) {
  console.log(`\n### ${ref.name} (${ref.sha.slice(0, 8)})`);
  const worktree = join(root, ref.path);

  if (!existsSync(join(worktree, ".git"))) {
    console.log(`  clone ${ref.url}`);
    superproject([
      "submodule",
      "update",
      "--init",
      "--",
      ref.path,
    ]);
  }

  const shallow =
    inRef(ref.path, ["rev-parse", "--is-shallow-repository"], true).trim() === "true";
  if (shallow) {
    console.log("  fetch full history");
    inRef(ref.path, ["fetch", "--unshallow", "origin"], true);
  }

  const head = inRef(ref.path, ["rev-parse", "HEAD"], true).trim();
  const onBranch = (() => {
    try {
      inRef(ref.path, ["symbolic-ref", "-q", "HEAD"], true);
      return true;
    } catch {
      return false;
    }
  })();

  if (head !== ref.sha) {
    console.log(`  pin ${head.slice(0, 8)} -> ${ref.sha.slice(0, 8)}`);
    try {
      inRef(ref.path, ["cat-file", "-e", `${ref.sha}^{commit}`], true);
    } catch {
      inRef(ref.path, ["fetch", "origin", ref.sha]);
    }
    inRef(ref.path, ["checkout", "--detach", ref.sha]);
  } else if (onBranch) {
    // A submodule is a pin, not a branch: detach so a stray pull cannot drift it.
    inRef(ref.path, ["checkout", "--detach", ref.sha], true);
  }

  if (full) {
    try {
      inRef(ref.path, ["sparse-checkout", "disable"], true);
    } catch {
      // sparse checkout was never enabled
    }
    console.log("  full worktree");
  } else {
    inRef(ref.path, ["sparse-checkout", "init", "--cone"], true);
    inRef(ref.path, ["sparse-checkout", "set", ...ref.sparse], true);
    console.log(`  ${ref.sparse.length} path(s)`);
  }
}

console.log("\nrefs ready");
