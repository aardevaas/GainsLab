import Link from "next/link";
import {
  UtensilsCrossed,
  Dumbbell,
  Zap,
  TrendingUp,
  ChefHat,
  Users,
  FlaskConical,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Flame,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  calculateTDEE,
  calculateMacros,
  type ActivityLevel,
  type Gender,
  type MacroPreset,
  type MacroGoals,
} from "@/lib/calculators";
import { formatNumber } from "@/lib/utils";
import { syncMyScores } from "@/app/(app)/community/actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / 3.156e10);
}

const QUICK_ACTIONS = [
  { label: "Log food", href: "/nutrition/log", icon: UtensilsCrossed, desc: "Track today's meals" },
  { label: "Workouts", href: "/workouts", icon: Dumbbell, desc: "Build or start a plan" },
  { label: "Exercises", href: "/exercises", icon: Zap, desc: "Browse 800+ exercises" },
  { label: "Tracker", href: "/tracker", icon: TrendingUp, desc: "Body & progress data" },
  { label: "Recipes", href: "/recipes", icon: ChefHat, desc: "Browse meal ideas" },
  { label: "Community", href: "/community", icon: Users, desc: "Leaderboards & more" },
  { label: "Supplements", href: "/supplements", icon: FlaskConical, desc: "Science-backed picks" },
  { label: "Learn", href: "/learn", icon: BookOpen, desc: "Education hub" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, dietRes, scores] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("dietary_profiles").select("*").eq("user_id", user!.id).single(),
    syncMyScores(),
  ]);

  const profile = profileRes.data;
  const macroPreset = (dietRes.data?.macro_preset ?? "balanced") as MacroPreset;

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const isProfileComplete = profile?.onboarding_completed ?? false;

  let macros: MacroGoals | null = null;
  let tdee: number | null = null;

  if (
    profile?.weight_kg &&
    profile?.height_cm &&
    profile?.date_of_birth &&
    profile?.sex &&
    profile?.activity_level
  ) {
    const age = calcAge(profile.date_of_birth);
    if (age) {
      const sex = profile.sex as Gender;
      const activityLevel = profile.activity_level as ActivityLevel;
      const tdeeResult = calculateTDEE(
        profile.weight_kg,
        profile.height_cm,
        age,
        sex,
        activityLevel,
      );
      tdee = tdeeResult.tdee;
      macros = calculateMacros(
        profile.weight_kg,
        profile.height_cm,
        age,
        sex,
        activityLevel,
        macroPreset,
      );
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Page header */}
      <div
        className="px-8 py-6 border-b"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}
        >
          {greeting}, {firstName}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {today}
        </p>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6">
        {/* Onboarding banner */}
        {!isProfileComplete && (
          <div
            className="flex items-center gap-4 p-4 rounded-xl border"
            style={{ background: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.25)" }}
          >
            <AlertCircle size={20} style={{ color: "var(--color-warning)", flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--color-warning)" }}>
                Complete your profile
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                Add your stats to unlock personalized macros, TDEE, and recommendations.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "var(--color-warning)", color: "#0a0c0f" }}
            >
              Set up <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Daily calories"
            value={macros ? formatNumber(macros.maintenance.calories) : "—"}
            sub="kcal goal"
            icon={<Flame size={16} />}
            accent
          />
          <StatCard
            label="Protein target"
            value={macros ? `${formatNumber(macros.maintenance.proteinG)}g` : "—"}
            sub="per day"
            icon={<span className="text-xs font-bold">P</span>}
          />
          <StatCard
            label="Active streak"
            value={`${scores.streak}`}
            sub={scores.streak === 1 ? "day in a row" : "days in a row"}
            icon={<Flame size={16} />}
          />
          <StatCard
            label="Workouts"
            value={`${scores.workoutsWeekly}`}
            sub="this week"
            icon={<Dumbbell size={16} />}
          />
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Macros breakdown */}
          <div
            className="lg:col-span-2 rounded-xl border p-5"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                Macro targets
              </h2>
              <Link
                href="/profile/macros"
                className="text-xs flex items-center gap-1"
                style={{ color: "var(--color-accent)" }}
              >
                Full analysis <ArrowRight size={11} />
              </Link>
            </div>

            {macros ? (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <p
                    className="text-4xl font-bold"
                    style={{ color: "var(--color-accent)", letterSpacing: "-0.03em" }}
                  >
                    {formatNumber(macros.maintenance.calories)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                    kcal/day maintenance
                  </p>
                  {tdee && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      TDEE: {formatNumber(tdee)} kcal
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <MacroBar
                    label="Protein"
                    grams={macros.maintenance.proteinG}
                    calories={macros.maintenance.proteinG * 4}
                    total={macros.maintenance.calories}
                    color="#4ade80"
                  />
                  <MacroBar
                    label="Carbs"
                    grams={macros.maintenance.carbsG}
                    calories={macros.maintenance.carbsG * 4}
                    total={macros.maintenance.calories}
                    color="#60a5fa"
                  />
                  <MacroBar
                    label="Fat"
                    grams={macros.maintenance.fatG}
                    calories={macros.maintenance.fatG * 9}
                    total={macros.maintenance.calories}
                    color="#fbbf24"
                  />
                </div>

                <div
                  className="pt-2 border-t grid grid-cols-3 gap-2 text-center"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div>
                    <p className="text-xs font-bold" style={{ color: "#ef4444" }}>
                      {formatNumber(macros.cutting.calories)}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Cutting</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--color-accent)" }}>
                      {formatNumber(macros.maintenance.calories)}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Maintain</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "#a78bfa" }}>
                      {formatNumber(macros.bulking.calories)}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Bulking</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <div
                  className="size-12 rounded-full flex items-center justify-center"
                  style={{ background: "var(--color-surface-elevated)" }}
                >
                  <Flame size={20} style={{ color: "var(--color-text-muted)" }} />
                </div>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Complete your profile to see your macros
                </p>
                <Link
                  href="/onboarding"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}
                >
                  Set up profile
                </Link>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="lg:col-span-3">
            <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-text)" }}>
              Quick access
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200"
                    style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="size-8 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--color-surface-elevated)" }}
                    >
                      <Icon size={15} style={{ color: "var(--color-text-secondary)" }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                        {action.label}
                      </p>
                      <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "var(--color-text-muted)" }}>
                        {action.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: "var(--color-surface)",
        borderColor: accent ? "rgba(74,222,128,0.2)" : "var(--color-border)",
        boxShadow: accent ? "0 0 20px rgba(74,222,128,0.04)" : "none",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</p>
        <span style={{ color: accent ? "var(--color-accent)" : "var(--color-text-muted)" }}>{icon}</span>
      </div>
      <p
        className="text-2xl font-bold"
        style={{ color: accent ? "var(--color-accent)" : "var(--color-text)", letterSpacing: "-0.03em" }}
      >
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{sub}</p>
    </div>
  );
}

function MacroBar({
  label,
  grams,
  calories,
  total,
  color,
}: {
  label: string;
  grams: number;
  calories: number;
  total: number;
  color: string;
}) {
  const pct = Math.round((calories / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>
          {formatNumber(grams)}g{" "}
          <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
