import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createPlan } from '../actions';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'New Workout Plan' };

export default function CreatePlanPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-8 py-5 border-b flex items-center gap-4"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <Link
          href="/workouts"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          New plan
        </h1>
      </div>

      <div className="flex-1 px-8 py-6 max-w-lg">
        <form action={createPlan} className="space-y-5">
          <Field label="Plan name *" htmlFor="name">
            <input
              id="name"
              name="name"
              required
              placeholder="e.g. Push Pull Legs"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--color-accent)]"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="What's the goal of this plan?"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--color-accent)] resize-none"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Days per week" htmlFor="days_per_week">
              <select
                id="days_per_week"
                name="days_per_week"
                defaultValue="3"
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                {[2, 3, 4, 5, 6, 7].map(n => (
                  <option key={n} value={n}>{n} days</option>
                ))}
              </select>
            </Field>

            <Field label="Difficulty" htmlFor="difficulty">
              <select
                id="difficulty"
                name="difficulty"
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <option value="">Any</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
          </div>

          <Field label="Primary goal" htmlFor="goal">
            <input
              id="goal"
              name="goal"
              placeholder="e.g. Build muscle, Lose fat, Improve strength"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--color-accent)]"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
            >
              Create plan
            </button>
            <Link
              href="/workouts"
              className="px-6 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold mb-1.5"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
