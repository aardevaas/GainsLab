import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  glow?: boolean;
};

export function Card({ hover, glow, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-surface)] border border-[var(--color-border)]",
        "rounded-[var(--radius-lg)] p-6",
        hover && [
          "transition-all duration-[var(--duration-normal)] cursor-pointer",
          "hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-elevated)]",
          "hover:shadow-[0_0_24px_var(--color-accent-glow)]",
        ],
        glow && "shadow-[0_0_32px_var(--color-accent-glow)] border-[var(--color-accent)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-[var(--color-text)]", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
