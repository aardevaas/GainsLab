"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-[var(--color-accent)] text-[#0a0c0f] font-semibold",
    "hover:bg-[var(--color-accent-dim)] active:scale-[0.98]",
    "shadow-[0_0_20px_var(--color-accent-glow)]",
    "hover:shadow-[0_0_32px_var(--color-accent-glow)]",
  ].join(" "),
  secondary: [
    "bg-[var(--color-surface-elevated)] text-[var(--color-text)]",
    "border border-[var(--color-border)]",
    "hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)]",
    "hover:text-[var(--color-accent)]",
  ].join(" "),
  ghost: [
    "bg-transparent text-[var(--color-text-secondary)]",
    "hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
  ].join(" "),
  outline: [
    "bg-transparent text-[var(--color-accent)]",
    "border border-[var(--color-accent)]",
    "hover:bg-[var(--color-accent-subtle)]",
  ].join(" "),
  danger: [
    "bg-[var(--color-danger)] text-white font-semibold",
    "hover:opacity-90 active:scale-[0.98]",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-[var(--radius-sm)] gap-1.5",
  md: "h-10 px-4 text-sm rounded-[var(--radius-md)] gap-2",
  lg: "h-12 px-6 text-base rounded-[var(--radius-lg)] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-[var(--duration-normal)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          "cursor-pointer select-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
