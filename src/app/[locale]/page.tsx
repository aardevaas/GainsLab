import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
  ArrowRight,
  Activity,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Dumbbell,
  ShoppingBag,
  TrendingUp,
  Trophy,
  Users,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

// ── Types ────────────────────────────────────────────────────────────────────

type AccentColor = "orange" | "blue" | "purple" | "green";

const ACCENT: Record<AccentColor, { fg: string; bg: string }> = {
  orange: { fg: "var(--color-accent)", bg: "var(--color-accent-subtle)" },
  blue: { fg: "var(--color-secondary)", bg: "var(--color-secondary-subtle)" },
  purple: { fg: "var(--color-tertiary)", bg: "var(--color-tertiary-subtle)" },
  green: { fg: "var(--color-success)", bg: "var(--color-success-subtle)" },
};

// ── Data ─────────────────────────────────────────────────────────────────────

const CREATOR_TYPES = [
  "Fitness Coaches",
  "Nutritionists",
  "Personal Trainers",
  "Yoga & Pilates",
  "Hyrox Athletes",
  "Sports Coaches",
  "Wellness Coaches",
  "Dietitians",
];

type CreatorFeature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
  color: AccentColor;
  wide?: boolean;
};

const CREATOR_FEATURES: CreatorFeature[] = [
  {
    icon: Users,
    title: "Build your community",
    desc: "Launch a space where your followers train together. Communities are always free to join — keeping the door open for every new follower.",
    tag: "Community",
    color: "orange",
    wide: true,
  },
  {
    icon: ShoppingBag,
    title: "Sell your programs",
    desc: "Workouts, nutrition plans, or full coaching packages. You keep 90% of every sale.",
    tag: "Revenue",
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Creator analytics",
    desc: "See who completes your programs, where members drop off, and how your community is growing week over week.",
    tag: "Insights",
    color: "purple",
  },
  {
    icon: BadgeCheck,
    title: "Verified Creator badge",
    desc: "Build credibility fast. Go from Verified → Pro Creator → Elite Creator as your community grows.",
    tag: "Credibility",
    color: "orange",
  },
  {
    icon: BookOpen,
    title: "Publish science-backed content",
    desc: "Share workout breakdowns, nutrition guides, and recipe collections directly to your community — backed by the same research database your members use.",
    tag: "Content",
    color: "green",
    wide: true,
  },
];

type MemberFeature = { icon: LucideIcon; title: string; desc: string };

const MEMBER_FEATURES: MemberFeature[] = [
  { icon: UtensilsCrossed, title: "400k+ Foods", desc: "Log any meal with full macro and micronutrient breakdown from USDA, Open Food Facts, and FatSecret." },
  { icon: Dumbbell, title: "800+ Exercises", desc: "Video guides, muscle activation maps, and complementary exercise recommendations." },
  { icon: TrendingUp, title: "Body composition", desc: "Weight, body fat %, and lean mass tracked over time. See your transformation in data." },
  { icon: Trophy, title: "Monthly competitions", desc: "Compete for real prizes. Leaderboards reset monthly, giving everyone a fresh start." },
  { icon: Activity, title: "Wearable sync", desc: "Google Fit, Fitbit, and Oura — synced automatically every day. Pro feature." },
  { icon: Zap, title: "AI food logging", desc: "Say what you ate. GainsLab parses it into a structured log in seconds. Pro feature." },
];

type PricingTier = {
  name: string;
  price: string;
  period: string;
  highlight: boolean;
  description: string;
  features: string[];
  cta: string;
  href: string;
};

const PRICING: PricingTier[] = [
  {
    name: "Member",
    price: "Free",
    period: "forever",
    highlight: false,
    description: "Join coached communities and track everything.",
    features: [
      "Join unlimited creator communities",
      "Basic food logging (macros)",
      "Workout tracker",
      "Monthly competitions",
      "400k+ food database",
      "800+ exercise library",
    ],
    cta: "Start free",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "Bs. 50",
    period: "/ month",
    highlight: true,
    description: "Serious athletes who want every advantage.",
    features: [
      "Everything in Member",
      "AI natural language food logging",
      "Full micronutrient tracking",
      "Body Age test (unlimited)",
      "Wearable sync: Fitbit, Oura, Google Fit",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/signup?plan=pro",
  },
  {
    name: "Creator",
    price: "Free",
    period: "founding period",
    highlight: false,
    description: "Coaches ready to build their platform.",
    features: [
      "Everything in Pro",
      "Build your creator community",
      "Sell programs — you keep 90%",
      "Creator analytics dashboard",
      "Verified Creator badge",
      "Founding discount — locked for life",
    ],
    cta: "Apply as Creator",
    href: "#founding-creator",
  },
];

type FoundingPerk = { icon: LucideIcon; color: AccentColor; text: string };

const FOUNDING_PERKS: FoundingPerk[] = [
  { icon: BadgeCheck, color: "orange", text: "Founding Creator badge — permanent, exclusive, displayed on your profile forever" },
  { icon: TrendingUp, color: "blue", text: "Creator platform is completely free throughout the entire founding period" },
  { icon: Users, color: "green", text: "Personal onboarding — we help you build and launch your first community" },
  { icon: BarChart3, color: "purple", text: "Direct line to the founding team — your feedback shapes the product roadmap" },
];

const STATS = [
  { value: "90%", label: "Creator revenue share" },
  { value: "400k+", label: "Foods in our database" },
  { value: "800+", label: "Exercises with muscle maps" },
  { value: "Free", label: "For founding creators" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>

      {/* ── NAV ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{ background: "var(--color-bg-blur)", backdropFilter: "blur(12px)", borderColor: "var(--color-border-subtle)" }}
      >
        <nav
          className="flex items-center justify-between h-16 px-6 mx-auto"
          style={{ maxWidth: "var(--max-width-content)" }}
          aria-label="Main navigation"
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="size-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)", fontFamily: "var(--font-display)" }}
            >G</div>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Gains<span style={{ color: "var(--color-accent)" }}>Lab</span>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-7 list-none">
            {[
              { label: "For Creators", href: "#creator-features" },
              { label: "Features", href: "#member-features" },
              { label: "Pricing", href: "#pricing" },
            ].map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm nav-link">{l.label}</a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="hidden sm:flex items-center text-sm px-4 h-9 rounded-lg border nav-link"
              style={{ borderColor: "var(--color-border)" }}
            >Sign in</Link>
            <a
              href="#founding-creator"
              className="flex items-center gap-1.5 text-sm px-4 h-9 rounded-lg font-semibold"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "0 0 16px var(--color-accent-glow)" }}
            >
              Apply as Creator <ChevronRight size={13} />
            </a>
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-44 pb-28 overflow-hidden"
        style={{ minHeight: "100dvh" }}
        aria-labelledby="hero-heading"
      >
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            mask: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
            WebkitMask: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
          }}
        />
        {/* Two-tone glow: orange top-right, blue bottom-left */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 55% 45% at 78% 5%, var(--color-accent-hero) 0%, transparent 70%),
              radial-gradient(ellipse 45% 40% at 18% 92%, var(--color-secondary-glow) 0%, transparent 65%)
            `,
          }}
        />

        {/* Badge */}
        <div
          className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 border"
          style={{ background: "var(--color-accent-subtle)", borderColor: "var(--color-accent-border)", color: "var(--color-accent)" }}
        >
          <span>🇧🇴</span> Founding Creators · Bolivia · Limited to 50 spots
        </div>

        <h1
          id="hero-heading"
          className="relative font-bold tracking-tight leading-none mb-6"
          style={{ fontSize: "clamp(3rem, 9vw, 8rem)", letterSpacing: "-0.04em", fontFamily: "var(--font-display)" }}
        >
          The platform where
          <br />
          fitness coaches{" "}
          <span style={{ color: "var(--color-accent)" }}>build communities.</span>
        </h1>

        <p
          className="relative max-w-2xl mx-auto text-lg leading-relaxed mb-10"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Give your audience a home. Sell your programs. Track their results.
          GainsLab is the creator platform for coaches, nutritionists, and trainers
          who are ready to turn their following into a thriving fitness community.
        </p>

        <div className="relative flex flex-col sm:flex-row items-center gap-3">
          <a
            href="#founding-creator"
            className="inline-flex items-center gap-2 px-7 rounded-xl font-semibold text-base"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "0 0 40px var(--color-accent-glow)", height: "52px" }}
          >
            Apply as Founding Creator <ArrowRight size={16} />
          </a>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 rounded-xl font-medium text-base border"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)", height: "52px" }}
          >
            Explore as Member
          </Link>
        </div>

        {/* Creator type marquee */}
        <div className="relative overflow-hidden mt-14 w-full max-w-3xl mx-auto">
          <div className="marquee-track flex gap-3 w-max">
            {[...CREATOR_TYPES, ...CREATOR_TYPES].map((type, i) => (
              <span
                key={i}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div
          className="relative flex flex-wrap justify-center gap-10 mt-16 pt-8 border-t"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold" style={{ color: "var(--color-accent)", fontFamily: "var(--font-display)" }}>{s.value}</div>
              <div className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CREATOR FEATURES ── */}
      <section
        id="creator-features"
        className="px-6 py-24"
        style={{ background: "var(--color-bg-secondary)" }}
        aria-labelledby="creator-heading"
      >
        <div className="mx-auto" style={{ maxWidth: "var(--max-width-content)" }}>
          <div className="mb-14 max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 border"
              style={{ background: "var(--color-accent-subtle)", borderColor: "var(--color-accent-border)", color: "var(--color-accent)" }}
            >For Creators</div>
            <h2 id="creator-heading" className="text-4xl font-bold tracking-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
              Build your community.{" "}
              <span style={{ color: "var(--color-accent)" }}>Grow your income.</span>
            </h2>
            <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
              Every tool a fitness creator needs — from community management and
              program sales, to analytics and verified credibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CREATOR_FEATURES.map((f) => {
              const Icon = f.icon;
              const { fg, bg } = ACCENT[f.color];
              return (
                <div
                  key={f.title}
                  className={`card-interactive rounded-2xl p-6 border${f.wide ? " md:col-span-2" : ""}`}
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                      <Icon size={18} style={{ color: fg }} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: bg, color: fg }}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CREATOR STUDIO MOCKUP ── */}
      <section className="px-6 py-24 mx-auto" style={{ maxWidth: "var(--max-width-content)" }}>
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* CSS-art mockup */}
          <div className="rounded-2xl overflow-hidden border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            {/* Window chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
              <div className="flex gap-1.5">
                {(["var(--color-danger)", "var(--color-warning)", "var(--color-success)"] as const).map((c, i) => (
                  <div key={i} className="size-2.5 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>GainsLab · Creator Studio</span>
              <div className="size-6 rounded-full" style={{ background: "var(--color-accent)" }} />
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-px" style={{ background: "var(--color-border)" }}>
              {[
                { label: "Members", value: "2,847", note: "+124 this week" },
                { label: "Revenue (Dec)", value: "Bs. 8,400", note: "↑ 23% vs Nov" },
                { label: "Programs", value: "7", note: "3 new sales" },
              ].map((stat) => (
                <div key={stat.label} className="p-4" style={{ background: "var(--color-surface)" }}>
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>{stat.label}</div>
                  <div className="text-xl font-bold" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}>{stat.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-success)" }}>{stat.note}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="p-4">
              <div className="text-xs font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
                Community growth · Last 7 days
              </div>
              <div className="flex items-end gap-1.5 h-16">
                {[38, 55, 47, 70, 62, 88, 79].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{ height: `${h}%`, background: i === 5 ? "var(--color-accent)" : "var(--color-accent-subtle)" }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i} className="flex-1 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>{d}</div>
                ))}
              </div>
            </div>

            {/* Programs */}
            <div className="px-4 pb-4 space-y-2">
              <div className="text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Top programs</div>
              {[
                { name: "8-Week Strength Foundation", members: 142, rate: "78%" },
                { name: "High Protein Meal Plan", members: 89, rate: "91%" },
                { name: "21-Day Hyrox Prep", members: 56, rate: "65%" },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "var(--color-bg)" }}>
                  <span className="text-sm" style={{ color: "var(--color-text)" }}>{p.name}</span>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span style={{ color: "var(--color-text-muted)" }}>{p.members} members</span>
                    <span className="font-semibold" style={{ color: "var(--color-success)" }}>{p.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 border"
              style={{ background: "var(--color-secondary-subtle)", borderColor: "rgba(71,199,252,0.25)", color: "var(--color-secondary)" }}
            >Creator Studio</div>
            <h2 className="text-4xl font-bold tracking-tight mb-5" style={{ letterSpacing: "-0.03em" }}>
              Your command center.{" "}
              <span style={{ color: "var(--color-secondary)" }}>All in one place.</span>
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)" }}>
              See exactly how your community grows, which programs perform best,
              and how much you've earned — without juggling five different tools.
            </p>
            <ul className="space-y-4">
              {[
                { color: "orange" as AccentColor, text: "Real-time community growth and engagement analytics" },
                { color: "blue" as AccentColor, text: "Program completion rates and member dropout analysis" },
                { color: "green" as AccentColor, text: "Revenue dashboard with full payout history" },
              ].map((item) => {
                const { fg, bg } = ACCENT[item.color];
                return (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg }}>
                      <Check size={12} style={{ color: fg }} />
                    </div>
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ── MEMBER FEATURES ── */}
      <section
        id="member-features"
        className="px-6 py-24"
        style={{ background: "var(--color-bg-secondary)" }}
        aria-labelledby="members-heading"
      >
        <div className="mx-auto" style={{ maxWidth: "var(--max-width-content)" }}>
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 border"
              style={{ background: "var(--color-secondary-subtle)", borderColor: "rgba(71,199,252,0.25)", color: "var(--color-secondary)" }}
            >For Members</div>
            <h2 id="members-heading" className="text-4xl font-bold tracking-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
              Tools that keep your community{" "}
              <span style={{ color: "var(--color-secondary)" }}>coming back every day.</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              A complete tracking suite built on peer-reviewed science — the kind your community
              will actually want to open every morning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEMBER_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="card-interactive rounded-2xl p-6 border"
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                >
                  <div className="size-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--color-accent-subtle)" }}>
                    <Icon size={18} style={{ color: "var(--color-accent)" }} />
                  </div>
                  <h3 className="font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        className="px-6 py-24 mx-auto"
        style={{ maxWidth: "var(--max-width-content)" }}
        aria-labelledby="pricing-heading"
      >
        <div className="text-center mb-14">
          <h2 id="pricing-heading" className="text-4xl font-bold tracking-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
            Simple pricing.{" "}
            <span style={{ color: "var(--color-accent)" }}>No surprises.</span>
          </h2>
          <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
            Start free. Upgrade when you're ready. Creators earn during the founding period.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className="rounded-2xl p-6 border flex flex-col"
              style={{
                background: tier.highlight ? "var(--color-surface-elevated)" : "var(--color-surface)",
                borderColor: tier.highlight ? "var(--color-accent)" : "var(--color-border)",
                boxShadow: tier.highlight ? "0 0 32px var(--color-accent-glow)" : "none",
              }}
            >
              {tier.highlight && (
                <div
                  className="text-xs font-bold px-2.5 py-1 rounded-full self-start mb-4"
                  style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
                >Most Popular</div>
              )}
              <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>{tier.name}</div>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-4xl font-bold" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
                  {tier.price}
                </span>
                {tier.price !== "Free" && (
                  <span className="text-sm mb-1.5" style={{ color: "var(--color-text-muted)" }}>{tier.period}</span>
                )}
              </div>
              {tier.price === "Free" && (
                <div className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>{tier.period}</div>
              )}
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>{tier.description}</p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={14}
                      className="shrink-0 mt-0.5"
                      style={{ color: tier.highlight ? "var(--color-accent)" : "var(--color-success)" }}
                    />
                    <span style={{ color: "var(--color-text-secondary)" }}>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className="flex items-center justify-center gap-1.5 h-11 rounded-xl font-semibold text-sm"
                style={
                  tier.highlight
                    ? { background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "0 0 20px var(--color-accent-glow)" }
                    : { background: "var(--color-surface-elevated)", color: "var(--color-text)", border: "1px solid var(--color-border)" }
                }
              >
                {tier.cta} <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOUNDING CREATOR ── */}
      <section
        id="founding-creator"
        className="px-6 py-24"
        style={{ background: "var(--color-bg-secondary)" }}
        aria-labelledby="founding-heading"
      >
        <div className="mx-auto grid md:grid-cols-2 gap-12 items-start" style={{ maxWidth: "var(--max-width-content)" }}>
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 border"
              style={{ background: "var(--color-accent-subtle)", borderColor: "var(--color-accent-border)", color: "var(--color-accent)" }}
            >🇧🇴 Founding Creator Program</div>
            <h2 id="founding-heading" className="text-4xl font-bold tracking-tight mb-5" style={{ letterSpacing: "-0.03em" }}>
              We&apos;re building this{" "}
              <span style={{ color: "var(--color-accent)" }}>with our first 100 creators.</span>
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)" }}>
              This isn&apos;t just a waitlist. Founding Creators shape the platform —
              your feedback directly influences the roadmap. In return, you get
              personal onboarding, a lifetime discounted rate, and the{" "}
              <strong style={{ color: "var(--color-text)" }}>Founding Creator</strong> badge
              displayed permanently on your profile.
            </p>
            <ul className="space-y-4">
              {FOUNDING_PERKS.map(({ icon: Icon, color, text }) => {
                const { fg, bg } = ACCENT[color];
                return (
                  <li key={text} className="flex items-start gap-3">
                    <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                      <Icon size={15} style={{ color: fg }} />
                    </div>
                    <span className="text-sm pt-1.5" style={{ color: "var(--color-text-secondary)" }}>{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl p-6 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <h3 className="text-xl font-bold mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
              Apply as a Founding Creator
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
              We review every application personally. Spots are limited to the first 50 coaches in Bolivia.
            </p>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width-content)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div
                  className="size-7 rounded-md flex items-center justify-center font-bold text-xs"
                  style={{ background: "var(--color-accent)", color: "var(--color-bg)", fontFamily: "var(--font-display)" }}
                >G</div>
                <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  Gains<span style={{ color: "var(--color-accent)" }}>Lab</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                The platform for fitness creators. Built with science. Powered by community.
              </p>
            </div>

            {[
              {
                title: "Platform",
                links: [
                  { label: "For Members", href: "#member-features" },
                  { label: "Features", href: "#member-features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Sign in", href: "/login" },
                ],
              },
              {
                title: "For Creators",
                links: [
                  { label: "Creator features", href: "#creator-features" },
                  { label: "Creator Studio", href: "#creator-features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Apply now", href: "#founding-creator" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
                  {col.title}
                </div>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm nav-link">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              © {new Date().getFullYear()} GainsLab. Built with science. Trained with data.
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span>🇧🇴 Bolivia</span>
              <span>·</span>
              <span>English / Español</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
