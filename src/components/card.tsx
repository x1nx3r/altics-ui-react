import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/cn";
type Props = HTMLAttributes<HTMLDivElement>;
const Root = forwardRef<HTMLDivElement, Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border shadow-sm",
        className,
      )}
      {...props}
    />
  ),
);
Root.displayName = "Card";
const Header = forwardRef<HTMLDivElement, Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  ),
);
Header.displayName = "Card.Header";
const Content = forwardRef<HTMLDivElement, Props>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
  ),
);
Content.displayName = "Card.Content";
const Footer = forwardRef<HTMLDivElement, Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6", className)}
      {...props}
    />
  ),
);
Footer.displayName = "Card.Footer";
export const Card = Object.assign(Root, { Header, Content, Footer });
