import React from 'react';
import {
  DocsContainer,
  DocsContext,
  Markdown,
  Primary,
  Controls,
  Stories,
  Title,
  useOf,
} from '@storybook/addon-docs/blocks';
import { themes } from 'storybook/theming';

/**
 * The house JSDoc style writes `@example` bodies as bare JSX, which the docs
 * markdown would strip as unknown HTML. This wraps each example body in a tsx
 * fence at render time, so the source docstrings stay exactly as written.
 */
export function fenceExamples(markdown: string): string {
  const lines = markdown.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    out.push(lines[i]);
    const isExample = /^@example\b/.test(lines[i]);
    i += 1;
    if (!isExample) continue;
    const body: string[] = [];
    // An example body runs to the next JSDoc tag or the end of the comment.
    while (i < lines.length && !/^@\w/.test(lines[i])) {
      body.push(lines[i]);
      i += 1;
    }
    while (body.length && body[0].trim() === '') body.shift();
    while (body.length && body[body.length - 1].trim() === '') body.pop();
    if (body.length) out.push('```tsx', ...body, '```');
  }
  return out.join('\n');
}

/** Loosely typed on purpose: the docs context shape is Storybook's to own. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AutodocsPage(): React.ReactElement {
  const meta = useOf('meta') as any;
  // Preview hooks (useGlobals) are illegal here — a docs page is neither a
  // decorator nor a story — so the toolbar global reads off the ambient docs
  // context, which re-renders this page when the global flips. The docs chrome
  // follows the same global the stories use: without this, a dark field would
  // sit on a white page.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ambient = React.useContext(DocsContext) as any;
  const dark = (ambient?.userGlobals?.theme as string) === 'dark';
  const prepared = meta?.preparedMeta;
  const extract = prepared?.parameters?.docs?.extractComponentDescription as
    | ((component?: unknown, extra?: { csfFile?: unknown }) => string)
    | undefined;
  const description: string =
    extract?.(prepared?.component, { csfFile: meta?.csfFile }) ?? '';
  return (
    <DocsContainer context={ambient} theme={dark ? themes.dark : themes.light}>
      <Title />
      <Markdown>{fenceExamples(description)}</Markdown>
      <Primary />
      <Controls />
      <Stories />
    </DocsContainer>
  );
}
