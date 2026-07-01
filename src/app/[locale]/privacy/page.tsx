import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GainsLab collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "June 2025";

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text)", minHeight: "100dvh" }}>
      {/* Minimal nav */}
      <header className="border-b px-6 h-16 flex items-center" style={{ borderColor: "var(--color-border-subtle)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div
            className="size-7 rounded-md flex items-center justify-center font-bold text-xs"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)", fontFamily: "var(--font-display)" }}
          >G</div>
          <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Gains<span style={{ color: "var(--color-accent)" }}>Lab</span>
          </span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--color-text-muted)" }}>Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>1. Information We Collect</h2>
            <p>GainsLab collects information you provide directly (name, email, fitness data) and information generated through your use of the platform (workout logs, nutrition entries, community activity). We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>2. How We Use Your Information</h2>
            <p>We use your information to operate the platform, personalize your experience, send account and product updates, and improve GainsLab. Fitness data is used solely to power your tracking and community features — never shared without your consent.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>3. Data Storage and Security</h2>
            <p>Your data is stored securely via Supabase (PostgreSQL) with encryption at rest and in transit. We implement industry-standard security measures and review them regularly. No system is 100% secure — report vulnerabilities to our team immediately.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>4. Cookies and Analytics</h2>
            <p>We use cookies for authentication and session management. We may use analytics tools (such as PostHog) to understand how the platform is used. These tools collect anonymized, aggregated data and do not share your personal information externally.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>5. Your Rights</h2>
            <p>You can access, update, or delete your account and personal data at any time from your profile settings. To request a full data export or account deletion, contact us at the address below. We comply with applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>6. Contact</h2>
            <p>
              Questions about this policy? Contact us at{" "}
              <a href="mailto:privacy@gainslab.app" className="underline" style={{ color: "var(--color-accent)" }}>
                privacy@gainslab.app
              </a>. This policy will be updated as the platform evolves — we&apos;ll notify registered users of material changes.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
          <Link href="/" className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            ← Back to GainsLab
          </Link>
        </div>
      </main>
    </div>
  );
}
