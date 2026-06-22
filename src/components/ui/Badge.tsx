import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger" | "info";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
  accent: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/30",
  success: "bg-[rgba(74,222,128,0.1)] text-[var(--color-success)] border border-[var(--color-success)]/30",
  warning: "bg-[rgba(251,191,36,0.1)] text-[var(--color-warning)] border border-[var(--color-warning)]/30",
  danger: "bg-[rgba(248,113,113,0.1)] text-[var(--color-danger)] border border-[var(--color-danger)]/30",
  info: "bg-[rgba(96,165,250,0.1)] text-[var(--color-info)] border border-[var(--color-info)]/30",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
