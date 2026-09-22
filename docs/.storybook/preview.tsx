import React from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';
import { ThemeProvider, type Theme } from '../../src';
import { AutodocsPage } from './AutodocsPage';
// The library's tokens, fonts and Tailwind directives, compiled by this
// app's tailwind.config so both the source components and the stories' own
// markup style correctly (see docs.css for why this file lives here).
import '../docs.css';

/** Every story renders inside the theme the toolbar picks, light by default —
 * the way the sheets draw it. The canvas ground is painted from the theme's
 * own token, so a dark story sits on a dark field, not on the manager's
 * white. */
const withTheme: Decorator = (Story, context) => {
  React.useEffect(() => {
    document.body.style.background = 'hsl(var(--color-background))';
  }, []);
  return (
    <ThemeProvider defaultTheme={(context.globals.theme as Theme) ?? 'light'}>
      <div style={{ maxWidth: 560, padding: 24 }}>
        <Story />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Which theme the stories render in',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'circlehollow' },
          { value: 'dark', title: 'Dark', icon: 'circle' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    docs: {
      // The autodocs page, with the house JSDoc's example blocks fenced at
      // render time (see AutodocsPage).
      page: AutodocsPage,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
