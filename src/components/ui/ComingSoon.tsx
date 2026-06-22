import type { LucideIcon } from "lucide-react";
import { Zap } from "lucide-react";

type ComingSoonProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
};

export function ComingSoon({ title, description, icon: Icon = Zap }: ComingSoonProps) {
  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-8 py-6 border-b"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
      </div>
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <div
            className="size-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--color-surface-elevated)" }}
          >
            <Icon size={28} style={{ color: "var(--color-text-muted)" }} />
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Coming soon
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {description ?? `${title} is being built. Check back soon.`}
          </p>
        </div>
      </div>
    </div>
  );
}
