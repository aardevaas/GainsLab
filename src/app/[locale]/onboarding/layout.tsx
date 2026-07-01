import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started | GainsLab",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      {children}
    </div>
  );
}
