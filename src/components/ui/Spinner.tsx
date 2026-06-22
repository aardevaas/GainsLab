import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-10 border-[3px]",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "block rounded-full border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin",
        sizeClasses[size],
        className,
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-dvh">
      <Spinner size="lg" />
    </div>
  );
}
