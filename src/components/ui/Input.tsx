"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 bg-[var(--color-surface)] text-[var(--color-text)]",
              "border border-[var(--color-border)] rounded-[var(--radius-md)]",
              "px-3 text-sm placeholder:text-[var(--color-text-muted)]",
              "transition-colors duration-[var(--duration-fast)]",
              "focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]",
              "hover:border-[var(--color-text-muted)]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]",
              leftIcon && "pl-9",
              rightElement && "pr-10",
              className,
            )}
            {...props}
          />

          {rightElement && (
            <span className="absolute right-3 text-[var(--color-text-muted)]">
              {rightElement}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
