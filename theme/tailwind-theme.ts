import plugin from "tailwindcss/plugin";
import { themeExtend } from "../src/theme/theme-extend";

// The Tailwind theme for @altics/ui: the shared scales plus the plugins.
// Imported by tailwind.config.ts (this repo's dev/build) and re-exported into
// the bundled preset for consumers.
export { themeExtend };
export const plugins = [
  plugin(function ({ addUtilities, theme }) {
    addUtilities({
      '.shadow-xs': {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        '.shadow-sm': {
          boxShadow: '0 1px 2px -1px rgba(0, 0, 0, 0.10), 0 1px 3px 0 rgba(0, 0, 0, 0.06)',
        },
        '.shadow-md': {
          boxShadow: '0 2px 4px -2px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.10)',
        },
        '.shadow-lg': {
          boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.03), 0 12px 16px -4px rgba(0, 0, 0, 0.08)',
        },
        '.shadow-xl': {
          boxShadow: '0 3px 3px -1.5px rgba(0, 0, 0, 0.04), 0 8px 8px -4px rgba(0, 0, 0, 0.03), 0 20px 24px -4px rgba(0, 0, 0, 0.08)',
        },
        '.radius-xxs': {
          borderRadius: '2px',
        },
        '.radius-xs': {
          borderRadius: '4px',
        },
        '.radius-sm': {
          borderRadius: '6px',
        },
        '.radius-md': {
          borderRadius: '8px',
        },
        '.radius-lg': {
          borderRadius: '10px',
        },
        '.radius-xl': {
          borderRadius: '12px',
        },
        '.radius-2xl': {
          borderRadius: '16px',
        },
        '.radius-3xl': {
          borderRadius: '20px',
        },
        '.radius-4xl': {
          borderRadius: '24px',
        },
        '.radius-full': {
          borderRadius: '9999px',
        },
        '.backdrop-blur-sm': {
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        },
        '.backdrop-blur-md': {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        },
        '.backdrop-blur-lg': {
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        },
        '.backdrop-blur-xl': {
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        },
    })
  })
];

