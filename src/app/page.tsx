"use client";

import Link from "next/link";
import {
  Dumbbell,
  FlaskConical,
  UtensilsCrossed,
  TrendingUp,
  Trophy,
  Users,
  Zap,
  BarChart3,
  Camera,
  CalendarDays,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const STATS = [
  { value: "50+", label: "Calculators" },
  { value: "800+", label: "Exercises" },
  { value: "400k+", label: "Foods" },
  { value: "Free", label: "To start" },
];

const FEATURES = [
  {
    icon: FlaskConical,
    title: "Science-backed Macros",
    description:
      "Built on Mifflin-St Jeor, Harris-Benedict, and Katch-McArdle. Precision macros from verified research — not guesswork.",
  },
  {
    icon: Dumbbell,
    title: "Workout Builder",
    description:
      "Build complex plans with animated muscle diagrams. Track progressive overload, sets, reps, and rest in real time.",
  },
  {
    icon: UtensilsCrossed,
    title: "Nutrition Database",
    description:
      "Search 400k+ foods from USDA, Open Food Facts, and FatSecret. Log every meal with full macro breakdowns.",
  },
  {
    icon: BarChart3,
    title: "Body Composition Tracker",
    description:
      "Weight, body fat %, lean mass over time. See your body transform through data, not just the mirror.",
  },
  {
    icon: Camera,
    title: "Progress Photos",
    description:
      "Side-by-side timeline comparisons. Visual proof of your transformation — private or shared.",
  },
  {
    icon: CalendarDays,
    title: "Habit Heatmap",
    description:
      "GitHub-style interactive calendar. Streaks, XP, confetti on completions. Showing up becomes addictive.",
  },
  {
    icon: TrendingUp,
    title: "Calorie Dashboard",
    description:
      "Burn vs. intake visualized daily. 30, 60, and 90-day projections. Color-coded surplus and deficit.",
  },
  {
    icon: Trophy,
    title: "Monthly Competitions",
    description:
      "Compete platform-wide for real prizes. Leaderboards, Instagram share cards, and monthly resets.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Leaderboards, social feed, and fitness forums. Connect with people who train as hard as you do.",
  },
];

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Science", href: "#science" },
  { label: "Community", href: "#community" },
];

export default function LandingPage() {
  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      {/* ── NAV ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{
          background: "rgba(10, 12, 15, 0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--color-border-subtle)",
        }}
      >
        <nav
          className="flex items-center justify-between h-16 px-6 mx-auto"
          style={{ maxWidth: "var(--max-width-content)" }}
          aria-label="Main navigation"
        >
          <a href="/" className="flex items-center gap-2.5 group">
            <div
              className="size-8 rounded-lg flex items-center justify-center font-bold text-sm transition-shadow group-hover:shadow-[0_0_16px_var(--color-accent-glow)]"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
            >
              G
            </div>
            <span className="text-lg font-bold">
              Gains<span style={{ color: "var(--color-accent)" }}>Lab</span>
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.color = "var(--color-text)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.color = "var(--color-text-secondary)";
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm px-4 h-9 rounded-lg border flex items-center transition-colors"
              style={{
                color: "var(--color-text-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 h-9 rounded-lg font-semibold flex items-center gap-1.5 transition-all"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                boxShadow: "0 0 20px var(--color-accent-glow)",
              }}
            >
              Start free <ChevronRight size={14} />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-24 overflow-hidden"
        style={{ minHeight: "100dvh" }}
        aria-labelledby="hero-heading"
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            mask: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
            WebkitMask: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "900px",
            height: "500px",
            background: "radial-gradient(ellipse at top, rgba(74,222,128,0.12) 0%, transparent 65%)",
          }}
        />

        {/* Pill badge */}
        <div
          className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border"
          style={{
            background: "var(--color-accent-subtle)",
            borderColor: "rgba(74,222,128,0.25)",
            color: "var(--color-accent)",
          }}
        >
          <Zap size={11} />
          Science-backed. Built for real results.
        </div>

        <h1
          id="hero-heading"
          className="relative font-bold tracking-tight leading-none mb-6"
          style={{
            fontSize: "clamp(3rem, 8vw, 7rem)",
            letterSpacing: "-0.04em",
          }}
        >
          The bridge between
          <br />
          <span style={{ color: "var(--color-accent)" }}>gym &amp; science.</span>
        </h1>

        <p
          className="relative max-w-xl mx-auto text-lg leading-relaxed mb-10"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Macros, workouts, nutrition, body composition, competitions — every
          dimension of your fitness life, unified in one elite platform.
        </p>

        <div className="relative flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-13 px-7 rounded-xl font-semibold text-base transition-all"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              boxShadow: "0 0 40px var(--color-accent-glow)",
              height: "52px",
            }}
          >
            Start for free <ArrowRight size={16} />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 h-13 px-7 rounded-xl font-medium text-base border transition-colors"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
              height: "52px",
            }}
          >
            See features
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="relative flex flex-wrap items-center justify-center gap-8 mt-20 pt-8 border-t"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-3xl font-bold"
                style={{ color: "var(--color-accent)" }}
              >
                {stat.value}
              </div>
              <div className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="px-6 py-24 mx-auto"
        style={{ maxWidth: "var(--max-width-content)" }}
        aria-labelledby="features-heading"
      >
        <div className="text-center mb-16">
          <h2
            id="features-heading"
            className="text-4xl font-bold tracking-tight mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Everything your fitness needs.{" "}
            <span style={{ color: "var(--color-accent)" }}>Nothing it doesn&apos;t.</span>
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Nine integrated systems. One coherent platform. Built on the same
            research elite coaches use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            const isLarge = i === 0 || i === 7;

            return (
              <div
                key={feature.title}
                className={`group relative rounded-2xl p-6 border transition-all duration-300 ${isLarge ? "md:col-span-1 lg:col-span-1" : ""}`}
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
                  (e.currentTarget as HTMLElement).style.background = "var(--color-surface-elevated)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px var(--color-accent-glow)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                  (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div
                  className="size-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--color-accent-subtle)" }}
                >
                  <Icon size={18} style={{ color: "var(--color-accent)" }} />
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "var(--color-text)" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SCIENCE CALLOUT ── */}
      <section
        id="science"
        className="px-6 py-24"
        style={{ background: "var(--color-bg-secondary)" }}
        aria-labelledby="science-heading"
      >
        <div className="mx-auto max-w-4xl text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border"
            style={{
              background: "var(--color-accent-subtle)",
              borderColor: "rgba(74,222,128,0.25)",
              color: "var(--color-accent)",
            }}
          >
            <FlaskConical size={11} />
            Peer-reviewed sources
          </div>
          <h2
            id="science-heading"
            className="text-4xl font-bold tracking-tight mb-6"
            style={{ letterSpacing: "-0.03em" }}
          >
            Every number backed by{" "}
            <span style={{ color: "var(--color-accent)" }}>real research.</span>
          </h2>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "var(--color-text-secondary)" }}>
            Our calculation engine references Mifflin-St Jeor (1990), Katch-McArdle (1975),
            Hodgdon &amp; Beckett (1984), Tanaka (2001), the Riegel endurance formula (1981),
            and 7 validated 1RM formulas. No broscience. No shortcuts.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              { label: "BMR formulas", value: "3 validated" },
              { label: "1RM estimators", value: "7 methods" },
              { label: "Body fat methods", value: "US Navy + BMI" },
              { label: "HR zone models", value: "Karvonen + Standard" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 border"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-accent)" }}>
                  {item.value}
                </div>
                <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <section
        id="community"
        className="px-6 py-24 mx-auto"
        style={{ maxWidth: "var(--max-width-content)" }}
        aria-labelledby="community-heading"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border"
              style={{
                background: "var(--color-accent-subtle)",
                borderColor: "rgba(74,222,128,0.25)",
                color: "var(--color-accent)",
              }}
            >
              <Users size={11} />
              Built for them, not just you
            </div>
            <h2
              id="community-heading"
              className="text-4xl font-bold tracking-tight mb-5"
              style={{ letterSpacing: "-0.03em" }}
            >
              Compete. Share.{" "}
              <span style={{ color: "var(--color-accent)" }}>Win.</span>
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)" }}>
              Monthly platform-wide competitions with real prizes. Leaderboards that
              reset every month. Instagram story share cards that drive new members in
              and reward you for inviting them.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                boxShadow: "0 0 24px var(--color-accent-glow)",
              }}
            >
              Join GainsLab free <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Trophy, title: "Monthly prizes", desc: "Real rewards for real consistency. Top performers win every month." },
              { icon: TrendingUp, title: "Live leaderboards", desc: "Weekly, monthly, all-time. Categories for every fitness goal." },
              { icon: Users, title: "Social sharing", desc: "Pre-built Instagram story cards. Share your wins. Grow your audience." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 p-4 rounded-xl border"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div
                    className="size-10 shrink-0 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--color-accent-subtle)" }}
                  >
                    <Icon size={18} style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-0.5">{item.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(74,222,128,0.06), transparent)",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <h2
            className="text-5xl font-bold tracking-tight mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Your body is a{" "}
            <span style={{ color: "var(--color-accent)" }}>science project.</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "var(--color-text-secondary)" }}>
            Start measuring it like one. Free forever to start. No credit card.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-14 px-8 rounded-xl font-bold text-lg transition-all"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              boxShadow: "0 0 48px var(--color-accent-glow)",
            }}
          >
            Start GainsLab free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-6 py-8 border-t"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <div
          className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="size-6 rounded-md flex items-center justify-center font-bold text-xs"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
            >
              G
            </div>
            <span className="text-sm font-semibold">
              Gains<span style={{ color: "var(--color-accent)" }}>Lab</span>
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            © {new Date().getFullYear()} GainsLab. Built with science. Trained with data.
          </p>
          <div className="flex gap-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <a href="#" className="hover:text-[var(--color-text)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--color-text)] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
