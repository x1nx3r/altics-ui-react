import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      colors: {
        background: "hsl(var(--color-background) / <alpha-value>)",
        foreground: "hsl(var(--color-foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--color-primary) / <alpha-value>)",
          foreground: "hsl(var(--color-primary-foreground) / <alpha-value>)",
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary) / <alpha-value>)",
          foreground: "hsl(var(--color-secondary-foreground) / <alpha-value>)",
          50: "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
          950: "var(--color-secondary-950)",
        },
        success: {
          primary: "var(--color-text-success-primary)",
          light: "var(--color-bg-success-light)",
        },
        warning: {
          primary: "var(--color-text-warning-primary)",
          light: "var(--color-bg-warning-light)",
        },
        error: {
          primary: "var(--color-text-error-primary)",
          light: "var(--color-bg-error-light)",
        },
        muted: {
          DEFAULT: "hsl(var(--color-muted) / <alpha-value>)",
          foreground: "hsl(var(--color-muted-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--color-border) / <alpha-value>)",
        input: "hsl(var(--color-input) / <alpha-value>)",
        ring: "hsl(var(--color-ring) / <alpha-value>)",
        placeholder: "--color-placeholder / <alpha-value>)",
        destructive: {
          DEFAULT: "hsl(var(--color-destructive) / <alpha-value>)",
          foreground:
            "hsl(var(--color-destructive-foreground) / <alpha-value>)",
        },
      },
      textColor: {
        // Brand text colors
        "brand-primary": "var(--color-text-brand-primary)",
        "brand-secondary": "var(--color-text-brand-secondary)",
        "brand-secondary-hover": "var(--color-text-brand-secondary-hover)",
        "brand-tertiary": "var(--color-text-brand-tertiary)",
        "brand-tertiary-alt": "var(--color-text-brand-tertiary-alt)",

        // Semantic text colors
        "error": "var(--color-text-error-primary)",
        "warning": "var(--color-text-warning-primary)",
        "success": "var(--color-text-success-primary)",

        // General text colors
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        tertiary: "var(--color-text-tertiary)",
        quaternary: "var(--color-text-quaternary)",
        disabled: "var(--color-text-disabled)",
        white: "var(--color-text-white)",
        inverse: "var(--color-text-inverse)",
        link: "var(--color-text-link)",
        "link-hover": "var(--color-text-link-hover)",
        placeholder: "var(--color-placeholder)",
      },
      spacing: {
        none: "var(--spacing-none)",
        xxs: "var(--spacing-xxs)",
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
        "4xl": "var(--spacing-4xl)",
        "5xl": "var(--spacing-5xl)",
        "6xl": "var(--spacing-6xl)",
        "7xl": "var(--spacing-7xl)",
        "8xl": "var(--spacing-8xl)",
        "9xl": "var(--spacing-9xl)",
        "10xl": "var(--spacing-10xl)",
        "11xl": "var(--spacing-11xl)",
      },
      width: {
        xxs: "var(--width-xxs)",
        xs: "var(--width-xs)",
        sm: "var(--width-sm)",
        md: "var(--width-md)",
        lg: "var(--width-lg)",
        xl: "var(--width-xl)",
        "2xl": "var(--width-2xl)",
        "3xl": "var(--width-3xl)",
        "4xl": "var(--width-4xl)",
        "5xl": "var(--width-5xl)",
        "6xl": "var(--width-6xl)",
      },
      maxWidth: {
        "container-desktop": "var(--container-max-width-desktop)",
        "paragraph": "var(--paragraph-max-width)",
      },
      padding: {
        "container-mobile": "var(--container-padding-mobile)",
        "container-desktop": "var(--container-padding-desktop)",
      },
      radius: {
        none: "var(--radius-none)",
        xxs: "var(--radius-xxs)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        "4xl": "var(--radius-4xl)",
        full: "var(--radius-full)",
      },
      borderRadius: {
        none: "var(--radius-none)",
        xxs: "var(--radius-xxs)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        "4xl": "var(--radius-4xl)",
        full: "var(--radius-full)",
      },
    },
  },
  plugins: [
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

        '.ds-glass': {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', // Safari support
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },

        '.ds-focus': {
          outline: 'none',
        },
        '.ds-focus:focus-visible': {
          boxShadow: `0 0 0 2px ${theme('colors.white')}, 0 0 0 4px ${theme('colors.brand.500')}`,
        }
      })
    })
  ],
} satisfies Config;
