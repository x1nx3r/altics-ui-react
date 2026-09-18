# Altics UI

An accessible React component library with TypeScript types and a token-based theme. The packaged CSS includes all component styles, so consuming Tailwind projects do not need to scan this package.

## Install and use

```bash
npm install @altics/ui
```

```tsx
import "@altics/ui/styles.css";
import { Button, Card, Input } from "@altics/ui";

export function SignIn() {
  return <Card className="p-6"><Input placeholder="Email" /><Button className="mt-4">Continue</Button></Card>;
}
```

## Theming

The stylesheet follows the system preference by default. Add `light` or `dark` to the document root to explicitly choose a theme, or use `ThemeProvider` with `defaultTheme="light"`, `"dark"`, or `"system"`. Override semantic CSS variables such as `--color-primary` in your application stylesheet.

Available components: Button, IconButton, LinkButton, Text, Input, Textarea, TagsInput, PinInput, OtpInput, NumberInput, PasswordInput, FileInput, Field, Label, Card, Badge, Avatar, Alert, Separator, Skeleton, Spinner, Icon, Stack, Container, and Grid.

## Tailwind preset

Component styles ship compiled, but custom design tokens (`p-xxs`, `rounded-4xl`, `max-w-container-desktop`, …) only exist in your markup if your Tailwind build knows the theme. Add the preset:

```ts
// tailwind.config.ts (ESM-only)
import preset from "@altics/ui/tailwind-preset";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [preset],
};
```

Works from ESM configs (CJS `require()` is not supported — the preset ships as pure ESM). Your own `content` globs and `extend` additions compose on top — the preset deliberately ships no `content` of its own. Raw values stay available as CSS variables regardless (e.g. `style={{ padding: "var(--spacing-xxs)" }}`).

## Class overrides and your own tokens

`cn` merges Tailwind classes, so the last class of a property wins: a `className` passed to a component reliably overrides that component's own class, the same way `style` always wins over a class. It knows the design system's token scales (`gap-md`, `p-lg`, `w-5xl`, `rounded-xxs`, …).

Three routes to change something:

- **A different token value** — override the CSS variable (`--spacing-md`, `--radius-sm`) in your stylesheet. Every class that uses it follows, with no JavaScript involved.
- **A one-off value** — `style` for a raw value, or an arbitrary class (`gap-[3.5rem]`). Both merge like any other class.
- **Your own tokens, in your own components** — build your merge once, where you keep your `cn`:

```ts
// src/lib/cn.ts
import { createCn } from "@altics/ui";

// A theme-shaped map, or the names alone: createCn({ spacing: ["brand"] })
export const cn = createCn({ spacing: { brand: "3.5rem" } });
```

The library's components merge with the library's own scales, so a `className` carrying one of your token names cannot replace one of their classes — that instance has never seen the name. Use your merge in your own components; on a library component, use the default scale, an arbitrary value, or a CSS variable.

## Development and publishing

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm pack --dry-run
```

The playground is development-only and is excluded from npm through the `files` allowlist. `prepublishOnly` builds the package before `npm publish`.
