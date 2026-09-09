import React, { forwardRef, HTMLAttributes, JSX, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type TextVariant = "body" | "caption" | "label";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "txl" | "tlg" | "tsm" | "txs" | "txxs";
export type TextWeight = "regular" | "medium" | "semibold" | "bold";
export type TextColor = "primary" | "secondary" | "tertiary" | "quaternary" | "disabled" | "white" | "inverse" | "link" | "link-hover" | "error" | "warning" | "success" | "brand-primary" | "brand-secondary" | "brand-tertiary";

interface TextProps extends HTMLAttributes<HTMLElement> {
  /**
   * Visual style variant
   * @default "body"
   * @option "body"
   * @option "caption"
   * @option "label"
   */
  variant?: TextVariant;

  /**
   * Text size
   * @default "md"
   * @option "xs"
   * @option "sm"
   * @option "md"
   * @option "lg"
   * @option "xl"
   * @option "2xl"
   * @option "txl"
   * @option "tlg"
   * @option "tsm"
   * @option "txs"
   * @option "txxs"
   */
  size?: TextSize;

  /**
   * Font weight
   * @default "regular"
   * @option "regular"
   * @option "medium"
   * @option "semibold"
   * @option "bold"
   */
  weight?: TextWeight;

  /**
   * Text color from design system
   * @default "primary"
   * @option "primary"
   * @option "secondary"
   * @option "tertiary"
   * @option "quaternary"
   * @option "disabled"
   * @option "white"
   * @option "inverse"
   * @option "link"
   * @option "link-hover"
   * @option "error"
   * @option "warning"
   * @option "success"
   * @option "brand-primary"
   * @option "brand-secondary"
   * @option "brand-tertiary"
   */
  color?: TextColor;

  /**
   * Whether text is truncated with ellipsis
   * @default false
   */
  truncate?: boolean;

  /**
   * Number of lines before truncation
   * @option 1
   * @option 2
   * @option 3
   * @option 4
   * @option 5
   * @option 6
   */
  lines?: number;

  /**
   * Make text uppercase
   * @default false
   */
  uppercase?: boolean;

  /**
   * Make text lowercase
   * @default false
   */
  lowercase?: boolean;

  /**
   * Make text capitalize
   * @default false
   */
  capitalize?: boolean;

  /**
   * Content to render
   */
  children?: ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  body: "text-base leading-normal",
  caption: "text-sm leading-normal",
  label: "text-sm font-medium leading-normal",
};

const sizeStyles: Record<TextSize, string> = {
  txxs: "!text-[10px] leading-[16px]",
  txs: "!text-[12px] leading-[18px]",
  tsm: "!text-[14px] leading-[20px]",
  tlg: "!text-[16px] leading-[24px]",
  txl: "!text-[18px] leading-[28px]",
  xs: "!text-[24px] leading-[32px]",
  sm: "!text-[30px] leading-[38px]",
  md: "!text-[36px] leading-[44px] tracking-[-2%]",
  lg: "!text-[48px] leading-[60px] tracking-[-2%]",
  xl: "!text-[60px] leading-[72px] tracking-[-2%]",
  "2xl": "!text-[72px] leading-[90px] tracking-[-2%]",
};

const weightStyles: Record<TextWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorStyles: Record<TextColor, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  quaternary: "text-quaternary",
  disabled: "text-disabled",
  white: "text-white",
  inverse: "text-inverse",
  link: "text-link",
  "link-hover": "text-link-hover",
  error: "text-error",
  warning: "text-warning",
  success: "text-success",
  "brand-primary": "text-brand-primary",
  "brand-secondary": "text-brand-secondary",
  "brand-tertiary": "text-brand-tertiary",
};

/**
 * Text Component
 * 
 * A flexible, accessible text component with support for multiple variants,
 * sizes, weights, and colors from the design system.
 * 
 * @example
 * <Text variant="h1">Main Heading</Text>
 * <Text variant="body" color="secondary">Body text</Text>
 * <Text variant="label" weight="bold">Label</Text>
 */
export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      variant = "body",
      size,
      weight = "regular",
      color = "primary",
      truncate = false,
      lines,
      uppercase = false,
      lowercase = false,
      capitalize = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Determine HTML element based on variant
    const Element = variant.startsWith("h") ? (variant as keyof JSX.IntrinsicElements) : "p";

    // Map lines to specific line-clamp classes
    const lineClampClass = lines ? {
      1: "line-clamp-1",
      2: "line-clamp-2",
      3: "line-clamp-3",
      4: "line-clamp-4",
      5: "line-clamp-5",
      6: "line-clamp-6",
    }[lines] : undefined;

    const baseStyles = cn(
      variantStyles[variant],
      size && sizeStyles[size],
      weightStyles[weight],
      colorStyles[color],
      truncate && !lines && "truncate",
      lineClampClass,
      uppercase && "uppercase",
      lowercase && "lowercase",
      capitalize && "capitalize"
    );

    return React.createElement(Element, {
      ref: ref as React.Ref<any>,
      className: cn(baseStyles, className),
      ...props,
      children,
    });
  }
);

Text.displayName = "Text";
