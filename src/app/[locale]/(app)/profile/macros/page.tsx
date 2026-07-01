import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  calculateWaterIntake,
  ACTIVITY_LABELS,
  type ActivityLevel,
  type Gender,
  type BMRFormula,
  type MacroPreset,
  type MacroGoals,
} from "@/lib/calculators";
import { formatNumber, capitalize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Macros Analysis" };

function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / 3.156e10);
}

const MACRO_PRESETS: Array<{
  key: MacroPreset;
  label: string;
  p: number;
  c: number;
  f: number;
}> = [
  { key: "balanced", label: "Balanced", p: 30, c: 40, f: 30 },
  { key: "high_protein", label: "High protein", p: 40, c: 35, f: 25 },
  { key: "low_carb", label: "Low carb", p: 40, c: 20, f: 40 },
  { key: "keto", label: "Keto", p: 30, c: 5, f: 65 },
];

const BMR_FORMULAS: Array<{
  key: BMRFormula;
  label: string;
  recommended: boolean;
  requiresBodyFat: boolean;
}> = [
  { key: "mifflin_st_jeor", label: "Mifflin-St Jeor (1990)", recommended: true, requiresBodyFat: false },
  { key: "harris_benedict", label: "Harris-Benedict (1984)", recommended: false, requiresBodyFat: false },
  { key: "katch_mcardle", label: "Katch-McArdle (1975)", recommended: false, requiresBodyFat: true },
];

export default async function MacrosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, dietRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("dietary_profiles").select("*").eq("user_id", user!.id).single(),
  ]);

  const profile = profileRes.data;
  const macroPreset = (dietRes.data?.macro_preset ?? "balanced") as MacroPreset;

  const hasData =
    profile?.weight_kg &&
    profile?.height_cm &&
    profile?.date_of_birth &&
    profile?.sex &&
    profile?.activity_level;

  if (!hasData) redirect("/onboarding");

  const age = calcAge(profile!.date_of_birth!);
  const sex = profile!.sex as Gender;
  const activityLevel = profile!.activity_level as ActivityLevel;
  const weightKg = profile!.weight_kg!;
  const heightCm = profile!.height_cm!;

  // BMR formula comparison
  const bmrResults = BMR_FORMULAS.map(({ key, label, recommended, requiresBodyFat }) => {
    if (requiresBodyFat) {
      return { key, label, recommended, bmr: null as number | null };
    }
    try {
      const result = calculateBMR(weightKg, heightCm, age, sex, key);
      return { key, label, recommended, bmr: result.bmr as number | null };
    } catch {
      return { key, label, recommended, bmr: null as number | null };
    }
  });

  const primaryBMR = bmrResults[0].bmr ?? 0;

  // TDEE
  const tdeeResult = calculateTDEE(weightKg, heightCm, age, sex, activityLevel);
  const water = calculateWaterIntake(weightKg, activityLevel);

  // All macro presets
  const allPresets = MACRO_PRESETS.map((preset) => {
    const m: MacroGoals = calculateMacros(weightKg, heightCm, age, sex, activityLevel, preset.key);
    return { ...preset, macros: m };
  });

  const goalLabel = profile?.goal ? capitalize(profile.goal.replace(/_/g, " ")) : "General fitness";
  const activityLabel = ACTIVITY_LABELS[activityLevel];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="px-8 py-6 border-b flex items-center gap-4"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <Link
          href="/dashboard"
          className="size-8 rounded-lg flex items-center justify-center border transition-colors hover:bg-[var(--color-surface-elevated)]"
          style={{ borderColor: "var(--color-border)" }}
        >
          <ArrowLeft size={14} style={{ color: "var(--color-text-secondary)" }} />
        </Link>
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}
          >
            Macros Analysis
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {goalLabel} · {activityLabel} · Age {age} · {weightKg}kg / {heightCm}cm
          </p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border"
          style={{
            background: "var(--color-accent-subtle)",
            borderColor: "rgba(74,222,128,0.2)",
            color: "var(--color-accent)",
          }}
        >
          <FlaskConical size={11} />
          Mifflin-St Jeor · Katch-McArdle · Roza &amp; Shizgal
        </div>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6 max-w-4xl">
        {/* Key numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="col-span-2 md:col-span-1 rounded-xl border p-5"
            style={{
              background: "var(--color-surface)",
              borderColor: "rgba(74,222,128,0.2)",
              boxShadow: "0 0 24px rgba(74,222,128,0.04)",
            }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>TDEE</p>
            <p
              className="text-3xl font-bold"
              style={{ color: "var(--color-accent)", letterSpacing: "-0.03em" }}
            >
              {formatNumber(tdeeResult.tdee)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>kcal/day total burn</p>
          </div>
          <NumberCard label="BMR" value={formatNumber(primaryBMR)} sub="kcal at rest" />
          <NumberCard
            label="Water intake"
            value={water.liters.toFixed(1)}
            sub={`litres/day · ${Math.round(water.cups)} cups`}
          />
          <NumberCard
            label="Activity factor"
            value={`×${tdeeResult.activityMultiplier}`}
            sub={activityLabel}
          />
        </div>

        {/* BMR formula comparison */}
        <section
          className="rounded-xl border p-5"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-text)" }}>
            BMR — formula comparison
          </h2>
          <div className="space-y-3">
            {bmrResults.map((f) => {
              const pct = f.bmr && primaryBMR ? Math.round((f.bmr / primaryBMR) * 100) : 0;
              return (
                <div key={f.key} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                        {f.label}
                      </span>
                      {f.recommended && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}
                        >
                          Recommended
                        </span>
                      )}
                      {f.bmr === null && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-muted)" }}
                        >
                          Requires body fat %
                        </span>
                      )}
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--color-border)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: f.recommended ? "var(--color-accent)" : "var(--color-text-muted)",
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold shrink-0"
                    style={{ color: f.recommended ? "var(--color-accent)" : "var(--color-text)" }}
                  >
                    {f.bmr !== null ? `${formatNumber(f.bmr)} kcal` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Macro presets */}
        <section>
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--color-text)" }}>
            Macro presets — based on your TDEE of {formatNumber(tdeeResult.tdee)} kcal
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {allPresets.map((preset) => {
              const isActive = preset.key === macroPreset;
              return (
                <div
                  key={preset.key}
                  className="rounded-xl border p-5"
                  style={{
                    background: isActive ? "var(--color-surface-elevated)" : "var(--color-surface)",
                    borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                    boxShadow: isActive ? "0 0 20px rgba(74,222,128,0.08)" : "none",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: isActive ? "var(--color-accent)" : "var(--color-text)" }}
                      >
                        {preset.label}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {preset.p}% P · {preset.c}% C · {preset.f}% F
                      </p>
                    </div>
                    {isActive && (
                      <span
                        className="text-[10px] px-2 py-1 rounded-full font-semibold"
                        style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}
                      >
                        Active
                      </span>
                    )}
                  </div>

                  {(["maintenance", "cutting", "bulking"] as const).map((phase) => {
                    const m = preset.macros[phase];
                    const phaseColor =
                      phase === "cutting"
                        ? "#ef4444"
                        : phase === "bulking"
                          ? "#a78bfa"
                          : "var(--color-accent)";
                    return (
                      <div
                        key={phase}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                        style={{ borderColor: "var(--color-border-subtle)" }}
                      >
                        <span className="text-xs capitalize" style={{ color: "var(--color-text-muted)" }}>
                          {phase}
                        </span>
                        <div className="flex items-center gap-3 text-xs font-semibold">
                          <span style={{ color: phaseColor }}>{formatNumber(m.calories)} kcal</span>
                          <span style={{ color: "#4ade80" }}>{formatNumber(m.proteinG)}P</span>
                          <span style={{ color: "#60a5fa" }}>{formatNumber(m.carbsG)}C</span>
                          <span style={{ color: "#fbbf24" }}>{formatNumber(m.fatG)}F</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        {/* Science sources */}
        <div
          className="rounded-xl border p-4 flex gap-3"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border-subtle)" }}
        >
          <FlaskConical
            size={16}
            style={{ color: "var(--color-accent)", flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>
              Sources
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              BMR: Mifflin &amp; St Jeor (1990), Roza &amp; Shizgal (1984), Katch &amp; McArdle (1975).
              Activity multipliers from FAO/WHO/UNU (1985) and McArdle et al.
              Macro ratios from ISSN Position Stand on protein (2017) and ACSM guidelines.
              Cutting = TDEE × 0.80 · Bulking = TDEE × 1.15.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
      <p
        className="text-2xl font-bold"
        style={{ color: "var(--color-text)", letterSpacing: "-0.03em" }}
      >
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{sub}</p>
    </div>
  );
}
