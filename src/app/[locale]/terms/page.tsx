import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of GainsLab.",
};

const LAST_UPDATED = "June 2025";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--color-text-muted)" }}>Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>1. Acceptance of Terms</h2>
            <p>By creating an account or using GainsLab, you agree to these Terms of Service. If you do not agree, do not use the platform. We may update these terms — continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>2. Use of the Platform</h2>
            <p>GainsLab is for personal fitness tracking and creator-led community building. You agree not to misuse the platform, post harmful content, impersonate others, or engage in activities that violate applicable laws. We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>3. Creator Content and Revenue</h2>
            <p>Creators retain ownership of the content they upload (workout programs, nutrition plans, articles). By publishing on GainsLab, you grant us a non-exclusive license to display your content on the platform. Creators receive 90% of gross program sales revenue, paid out monthly after fees. Revenue sharing terms may be updated with 30 days notice.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>4. Health Disclaimer</h2>
            <p>GainsLab provides fitness and nutrition information for educational purposes only. Nothing on this platform constitutes medical advice. Always consult a qualified healthcare professional before starting any fitness or nutrition program. We are not responsible for injuries or health outcomes resulting from use of the platform.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>5. Limitation of Liability</h2>
            <p>GainsLab is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you paid us in the 12 months preceding any claim.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text)" }}>6. Contact</h2>
            <p>
              Questions about these terms? Contact us at{" "}
              <a href="mailto:legal@gainslab.app" className="underline" style={{ color: "var(--color-accent)" }}>
                legal@gainslab.app
              </a>.
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
