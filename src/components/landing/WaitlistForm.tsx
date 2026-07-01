"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

const SPECIALTIES = [
  "Fitness Coach",
  "Nutritionist / Dietitian",
  "Personal Trainer",
  "Yoga / Pilates Instructor",
  "Hyrox / Sports Coach",
  "General Wellness",
  "Other",
];

type FormState = "idle" | "submitting" | "success";

const inputClass =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors";

const inputStyle = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
};

export function WaitlistForm() {
  const [state, setState] = useState<FormState>("idle");
  const [data, setData] = useState({
    name: "",
    email: "",
    instagram: "",
    specialty: "",
  });

  function field(key: keyof typeof data) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setData((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    // TODO: POST to Supabase waitlist table
    await new Promise((r) => setTimeout(r, 900));
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div
          className="size-16 rounded-full flex items-center justify-center"
          style={{
            background: "var(--color-accent-subtle)",
            border: "2px solid var(--color-accent)",
          }}
        >
          <Check size={28} style={{ color: "var(--color-accent)" }} />
        </div>
        <div>
          <p
            className="text-xl font-bold mb-1.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            You're on the list.
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            We'll reach out personally within 48 hours to get your Creator
            Studio set up.
          </p>
        </div>
      </div>
    );
  }

  const isSubmitting = state === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          type="text"
          placeholder="Your name"
          value={data.name}
          onChange={field("name")}
          className={inputClass}
          style={inputStyle}
        />
        <input
          required
          type="email"
          placeholder="Email address"
          value={data.email}
          onChange={field("email")}
          className={inputClass}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="@instagram (optional)"
          value={data.instagram}
          onChange={field("instagram")}
          className={inputClass}
          style={inputStyle}
        />
        <select
          required
          value={data.specialty}
          onChange={field("specialty")}
          className={inputClass}
          style={inputStyle}
        >
          <option value="" disabled>
            Your specialty
          </option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm transition-opacity"
        style={{
          background: "var(--color-accent)",
          color: "var(--color-bg)",
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            Apply as Founding Creator
            <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
        Founding Creator spots are limited to the first 100 coaches in Bolivia.
        We review every application personally.
      </p>
    </form>
  );
}
