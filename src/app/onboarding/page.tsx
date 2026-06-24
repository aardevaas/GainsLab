"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Flame,
  Target,
  Zap,
  Heart,
  Dumbbell,
  Activity,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { feetInchesToCm, lbsToKg } from "@/lib/calculators";

// ── Types ──────────────────────────────────────────
type OnboardingData = {
  sex: "male" | "female" | null;
  units: "metric" | "imperial";
  dateOfBirth: string;
  heightCm: number | null;
  heightFt: number | null;
  heightIn: number | null;
  weightKg: number | null;
  weightLbs: number | null;
  goal: "lose_weight" | "maintain" | "gain_muscle" | "improve_endurance" | "general_fitness" | null;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active" | null;
  dietType: string | null;
  restrictions: string[];
};

const INITIAL: OnboardingData = {
  sex: null,
  units: "metric",
  dateOfBirth: "",
  heightCm: null,
  heightFt: null,
  heightIn: null,
  weightKg: null,
  weightLbs: null,
  goal: null,
  activityLevel: null,
  dietType: null,
  restrictions: [],
};

const TOTAL_STEPS = 5;

// ── Step config ─────────────────────────────────────
const GOALS = [
  { value: "lose_weight", label: "Lose weight", desc: "Shed body fat, look leaner", icon: Flame },
  { value: "gain_muscle", label: "Build muscle", desc: "Add lean mass, get stronger", icon: Dumbbell },
  { value: "maintain", label: "Maintain", desc: "Stay at current composition", icon: Target },
  { value: "improve_endurance", label: "Endurance", desc: "Run faster, go further", icon: Activity },
  { value: "general_fitness", label: "General fitness", desc: "Be healthier overall", icon: Heart },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", desc: "Desk job, little to no exercise", multiplier: "×1.2" },
  { value: "light", label: "Lightly active", desc: "1–3 workouts per week", multiplier: "×1.375" },
  { value: "moderate", label: "Moderately active", desc: "3–5 workouts per week", multiplier: "×1.55" },
  { value: "active", label: "Very active", desc: "6–7 hard workouts per week", multiplier: "×1.725" },
  { value: "very_active", label: "Extra active", desc: "2× daily training or physical job", multiplier: "×1.9" },
];

const DIET_TYPES = [
  { value: "omnivore", label: "Everything" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterranean" },
];

const RESTRICTIONS = [
  "Gluten-free", "Dairy-free", "Nut-free", "Egg-free",
  "Soy-free", "Shellfish-free", "Low sodium", "Halal", "Kosher",
];

// ── Animation variants ──────────────────────────────
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 48 : -48, opacity: 0 }),
};

// ── Helpers ─────────────────────────────────────────
function resolveMetric(data: OnboardingData) {
  const heightCm =
    data.units === "metric"
      ? (data.heightCm ?? null)
      : data.heightFt !== null
        ? feetInchesToCm(data.heightFt, data.heightIn ?? 0)
        : null;

  const weightKg =
    data.units === "metric"
      ? (data.weightKg ?? null)
      : data.weightLbs !== null
        ? lbsToKg(data.weightLbs)
        : null;

  return { heightCm, weightKg };
}

// ── Main component ──────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  }

  function back() {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function toggleRestriction(r: string) {
    setData((prev) => ({
      ...prev,
      restrictions: prev.restrictions.includes(r)
        ? prev.restrictions.filter((x) => x !== r)
        : [...prev.restrictions, r],
    }));
  }

  async function finish() {
    setSaving(true);
    const { heightCm, weightKg } = resolveMetric(data);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const age = data.dateOfBirth
      ? Math.floor((Date.now() - new Date(data.dateOfBirth).getTime()) / 3.156e10)
      : null;

    type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean';

    const [profileRes, dietRes] = await Promise.all([
      supabase.from("profiles").upsert({
        user_id: user.id,
        name: null,
        username: null,
        avatar_url: null,
        sex: data.sex,
        date_of_birth: data.dateOfBirth || null,
        height_cm: heightCm,
        weight_kg: weightKg,
        goal: data.goal,
        activity_level: data.activityLevel,
        units: data.units,
        onboarding_completed: true,
      }, { onConflict: "user_id" }),
      supabase.from("dietary_profiles").upsert({
        user_id: user.id,
        diet_type: data.dietType as DietType | null,
        restrictions: data.restrictions,
        allergies: [],
        diseases: [],
        disliked_foods: [],
        macro_preset: null,
      }, { onConflict: "user_id" }),
    ]);

    setSaving(false);
    if (!profileRes.error && !dietRes.error) {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } else {
      console.error("[onboarding] save failed", {
        profile: profileRes.error,
        dietary: dietRes.error,
      });
      setSaveError("We couldn't save your setup. Please try again.");
    }
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-6 px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="size-20 rounded-full flex items-center justify-center"
          style={{ background: "var(--color-accent)" }}
        >
          <Check size={36} color="var(--color-bg)" strokeWidth={3} />
        </motion.div>
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
            You&apos;re all set.
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Taking you to your dashboard…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-16 shrink-0">
        <a href="/" className="flex items-center gap-2">
          <div
            className="size-7 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
          >
            G
          </div>
          <span className="font-bold" style={{ color: "var(--color-text)" }}>
            Gains<span style={{ color: "var(--color-accent)" }}>Lab</span>
          </span>
        </a>

        {step <= TOTAL_STEPS && (
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            Skip for now
          </button>
        )}
      </header>

      {/* Progress bar */}
      {step <= TOTAL_STEPS && (
        <div className="px-6 shrink-0">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--color-accent)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 1 && <Step1 data={data} update={update} />}
              {step === 2 && <Step2 data={data} update={update} />}
              {step === 3 && <Step3 data={data} update={update} />}
              {step === 4 && <Step4 data={data} update={update} />}
              {step === 5 && (
                <Step5
                  data={data}
                  update={update}
                  toggleRestriction={toggleRestriction}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Save error */}
      {saveError && (
        <div className="px-6 pb-2 max-w-lg mx-auto w-full">
          <p
            className="text-sm text-center rounded-lg px-3 py-2"
            style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "var(--color-danger)",
            }}
          >
            {saveError}
          </p>
        </div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between px-6 pb-8 shrink-0 max-w-lg mx-auto w-full">
        <Button
          variant="ghost"
          onClick={back}
          disabled={step === 1}
          leftIcon={<ChevronLeft size={16} />}
        >
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button onClick={next} rightIcon={<ChevronRight size={16} />}>
            Continue
          </Button>
        ) : (
          <Button onClick={finish} isLoading={saving} rightIcon={<Check size={16} />}>
            Finish setup
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Sex + Units ──────────────────────────────
function Step1({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)", letterSpacing: "-0.03em" }}>
          Tell us about you.
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          We use this to calculate your precise energy needs.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Biological sex
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((sex) => (
            <button
              key={sex}
              onClick={() => update("sex", sex)}
              className={cn(
                "py-5 rounded-xl border-2 text-base font-semibold capitalize transition-all duration-150",
                data.sex === sex
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]",
              )}
            >
              {sex === "male" ? "♂ Male" : "♀ Female"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Date of birth
        </p>
        <input
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => update("dateOfBirth", e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-full h-11 px-3 rounded-xl border text-sm transition-colors focus:outline-none"
          style={{
            background: "var(--color-surface)",
            borderColor: data.dateOfBirth ? "var(--color-accent)" : "var(--color-border)",
            color: "var(--color-text)",
          }}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Preferred units
        </p>
        <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              onClick={() => update("units", u)}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium capitalize transition-all duration-150",
                data.units === u
                  ? "text-[var(--color-bg)] font-semibold"
                  : "text-[var(--color-text-secondary)]",
              )}
              style={{
                background: data.units === u ? "var(--color-accent)" : "var(--color-surface)",
              }}
            >
              {u === "metric" ? "Metric (kg / cm)" : "Imperial (lbs / ft)"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Height + Weight ──────────────────────────
function Step2({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  const isMetric = data.units === "metric";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)", letterSpacing: "-0.03em" }}>
          Your body stats.
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Used to calculate your exact BMR and TDEE.
        </p>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Height
        </label>
        {isMetric ? (
          <div className="relative">
            <input
              type="number"
              placeholder="175"
              value={data.heightCm ?? ""}
              onChange={(e) => update("heightCm", e.target.value ? +e.target.value : null)}
              className="w-full h-14 px-4 pr-16 rounded-xl border text-lg font-medium focus:outline-none transition-colors"
              style={{
                background: "var(--color-surface)",
                borderColor: data.heightCm ? "var(--color-accent)" : "var(--color-border)",
                color: "var(--color-text)",
              }}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              cm
            </span>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="5"
                value={data.heightFt ?? ""}
                onChange={(e) => update("heightFt", e.target.value ? +e.target.value : null)}
                className="w-full h-14 px-4 pr-10 rounded-xl border text-lg font-medium focus:outline-none transition-colors"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-text-muted)" }}>ft</span>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="11"
                value={data.heightIn ?? ""}
                onChange={(e) => update("heightIn", e.target.value ? +e.target.value : null)}
                className="w-full h-14 px-4 pr-10 rounded-xl border text-lg font-medium focus:outline-none transition-colors"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-text-muted)" }}>in</span>
            </div>
          </div>
        )}

        <label className="text-sm font-medium block" style={{ color: "var(--color-text-secondary)" }}>
          Weight
        </label>
        <div className="relative">
          <input
            type="number"
            placeholder={isMetric ? "75" : "165"}
            value={isMetric ? (data.weightKg ?? "") : (data.weightLbs ?? "")}
            onChange={(e) => {
              const val = e.target.value ? +e.target.value : null;
              isMetric ? update("weightKg", val) : update("weightLbs", val);
            }}
            className="w-full h-14 px-4 pr-16 rounded-xl border text-lg font-medium focus:outline-none transition-colors"
            style={{
              background: "var(--color-surface)",
              borderColor: (isMetric ? data.weightKg : data.weightLbs) ? "var(--color-accent)" : "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            {isMetric ? "kg" : "lbs"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Goal ─────────────────────────────────────
function Step3({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)", letterSpacing: "-0.03em" }}>
          What&apos;s your goal?
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          This sets your calorie target and macro split.
        </p>
      </div>

      <div className="space-y-2">
        {GOALS.map(({ value, label, desc, icon: Icon }) => {
          const selected = data.goal === value;
          return (
            <button
              key={value}
              onClick={() => update("goal", value as OnboardingData["goal"])}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150",
                selected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-muted)]",
              )}
            >
              <div
                className="size-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: selected ? "var(--color-accent)" : "var(--color-surface-elevated)",
                }}
              >
                <Icon size={18} color={selected ? "var(--color-bg)" : "var(--color-text-secondary)"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: selected ? "var(--color-accent)" : "var(--color-text)" }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {desc}
                </p>
              </div>
              {selected && (
                <Check size={16} className="shrink-0" style={{ color: "var(--color-accent)" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 4: Activity Level ───────────────────────────
function Step4({
  data,
  update,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)", letterSpacing: "-0.03em" }}>
          How active are you?
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Honest answer gives the most accurate TDEE.
        </p>
      </div>

      <div className="space-y-2">
        {ACTIVITY_LEVELS.map(({ value, label, desc, multiplier }) => {
          const selected = data.activityLevel === value;
          return (
            <button
              key={value}
              onClick={() => update("activityLevel", value as OnboardingData["activityLevel"])}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150",
                selected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-muted)]",
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: selected ? "var(--color-accent)" : "var(--color-text)" }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {desc}
                </p>
              </div>
              <span
                className="text-xs font-mono font-bold shrink-0 px-2 py-1 rounded"
                style={{
                  background: selected ? "var(--color-accent)" : "var(--color-surface-elevated)",
                  color: selected ? "var(--color-bg)" : "var(--color-text-muted)",
                }}
              >
                {multiplier}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 5: Diet ─────────────────────────────────────
function Step5({
  data,
  update,
  toggleRestriction,
}: {
  data: OnboardingData;
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  toggleRestriction: (r: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)", letterSpacing: "-0.03em" }}>
          Your eating style.
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Helps us recommend recipes and foods that work for you.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Diet type
        </p>
        <div className="flex flex-wrap gap-2">
          {DIET_TYPES.map(({ value, label }) => {
            const selected = data.dietType === value;
            return (
              <button
                key={value}
                onClick={() => update("dietType", selected ? null : value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                  selected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Dietary restrictions{" "}
          <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>
            (optional)
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {RESTRICTIONS.map((r) => {
            const selected = data.restrictions.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleRestriction(r)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
                  selected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]",
                )}
              >
                {selected && "✓ "}
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
