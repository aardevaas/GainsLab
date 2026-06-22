export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4" style={{ background: "var(--color-bg)" }}>
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          mask: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
          WebkitMask: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        }}
      />

      {/* Accent glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "600px",
          height: "300px",
          background: "radial-gradient(ellipse at top, rgba(74,222,128,0.08), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div
              className="size-9 rounded-[var(--radius-md)] flex items-center justify-center font-bold text-[var(--color-bg)] text-base"
              style={{ background: "var(--color-accent)" }}
            >
              G
            </div>
            <span className="text-xl font-bold text-[var(--color-text)]">
              Gains<span style={{ color: "var(--color-accent)" }}>Lab</span>
            </span>
          </a>
        </div>

        {children}
      </div>
    </main>
  );
}
