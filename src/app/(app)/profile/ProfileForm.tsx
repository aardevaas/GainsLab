'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  feetInchesToCm,
  cmToFeetInches,
  lbsToKg,
  kgToLbs,
} from '@/lib/calculators';
import { useToast } from '@/components/ui/toast/ToastProvider';
import { updateProfile, type ProfileInput } from './actions';

type Units = 'metric' | 'imperial';
type Sex = 'male' | 'female';
type Goal = ProfileInput['goal'];
type Activity = ProfileInput['activity_level'];

type Props = {
  initial: {
    name: string;
    username: string;
    sex: Sex | '';
    date_of_birth: string;
    height_cm: number | null;
    weight_kg: number | null;
    goal: Goal | '';
    activity_level: Activity | '';
    units: Units;
    avatar_url: string;
  };
};

const GOALS: { value: Goal; label: string }[] = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'gain_muscle', label: 'Build muscle' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'improve_endurance', label: 'Endurance' },
  { value: 'general_fitness', label: 'General fitness' },
];

const ACTIVITY: { value: Activity; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Lightly active' },
  { value: 'moderate', label: 'Moderately active' },
  { value: 'active', label: 'Very active' },
  { value: 'very_active', label: 'Extra active' },
  { value: 'extra_active', label: 'Athlete' },
];

const labelCls = 'text-xs font-semibold mb-1.5 block';
const fieldCls =
  'w-full h-10 rounded-xl px-3 text-sm outline-none transition-colors focus:ring-1';

function fieldStyle() {
  return {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  };
}

export function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(initial.username);
  const [sex, setSex] = useState<Sex | ''>(initial.sex);
  const [dob, setDob] = useState(initial.date_of_birth);
  const [goal, setGoal] = useState<Goal | ''>(initial.goal);
  const [activity, setActivity] = useState<Activity | ''>(initial.activity_level);
  const [units, setUnits] = useState<Units>(initial.units);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url);

  // Height/weight kept as metric source of truth.
  const [heightCm, setHeightCm] = useState<number | null>(initial.height_cm);
  const [weightKg, setWeightKg] = useState<number | null>(initial.weight_kg);

  const ftIn = heightCm != null ? cmToFeetInches(heightCm) : { feet: 0, inches: 0 };
  const lbs = weightKg != null ? Math.round(kgToLbs(weightKg)) : null;

  function handleHeightImperial(feet: number, inches: number) {
    setHeightCm(feetInchesToCm(feet, inches));
  }

  function handleWeightImperial(value: number) {
    setWeightKg(value > 0 ? lbsToKg(value) : null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!sex || !goal || !activity) {
      toast.error('Please complete all fields.');
      return;
    }
    if (heightCm == null || weightKg == null) {
      toast.error('Please enter your height and weight.');
      return;
    }

    const input: ProfileInput = {
      name,
      username,
      sex,
      date_of_birth: dob,
      height_cm: heightCm,
      weight_kg: weightKg,
      goal,
      activity_level: activity,
      units,
      avatar_url: avatarUrl,
    };

    startTransition(async () => {
      const result = await updateProfile(input);
      if (result.ok) {
        toast.success('Profile saved');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* Identity */}
      <section
        className="rounded-2xl p-5 border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          Identity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>
              Display name
            </label>
            <input
              className={fieldCls}
              style={fieldStyle()}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>
              Username
            </label>
            <input
              className={fieldCls}
              style={fieldStyle()}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              maxLength={30}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>
              Avatar image URL <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
            </label>
            <input
              className={fieldCls}
              style={fieldStyle()}
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              type="url"
            />
          </div>
        </div>
      </section>

      {/* Body stats */}
      <section
        className="rounded-2xl p-5 border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Body stats
          </h2>
          {/* Units toggle */}
          <div
            className="flex rounded-lg p-0.5"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          >
            {(['metric', 'imperial'] as Units[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnits(u)}
                className="px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors"
                style={{
                  background: units === u ? 'var(--color-accent)' : 'transparent',
                  color: units === u ? '#0a0c0f' : 'var(--color-text-secondary)',
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>
              Sex
            </label>
            <select
              className={fieldCls}
              style={fieldStyle()}
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
            >
              <option value="" disabled>Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>
              Date of birth
            </label>
            <input
              type="date"
              className={fieldCls}
              style={fieldStyle()}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          {/* Height */}
          <div>
            <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>
              Height
            </label>
            {units === 'metric' ? (
              <div className="relative">
                <input
                  type="number"
                  className={fieldCls}
                  style={fieldStyle()}
                  value={heightCm ?? ''}
                  onChange={(e) =>
                    setHeightCm(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="175"
                  min={50}
                  max={280}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  cm
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    className={fieldCls}
                    style={fieldStyle()}
                    value={ftIn.feet || ''}
                    onChange={(e) =>
                      handleHeightImperial(Number(e.target.value || 0), ftIn.inches)
                    }
                    placeholder="5"
                    min={1}
                    max={8}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>ft</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    className={fieldCls}
                    style={fieldStyle()}
                    value={ftIn.inches || ''}
                    onChange={(e) =>
                      handleHeightImperial(ftIn.feet, Number(e.target.value || 0))
                    }
                    placeholder="9"
                    min={0}
                    max={11}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>in</span>
                </div>
              </div>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>
              Weight
            </label>
            <div className="relative">
              {units === 'metric' ? (
                <>
                  <input
                    type="number"
                    className={fieldCls}
                    style={fieldStyle()}
                    value={weightKg ?? ''}
                    onChange={(e) =>
                      setWeightKg(e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="75"
                    min={20}
                    max={400}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>kg</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    className={fieldCls}
                    style={fieldStyle()}
                    value={lbs ?? ''}
                    onChange={(e) => handleWeightImperial(Number(e.target.value || 0))}
                    placeholder="165"
                    min={40}
                    max={880}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>lbs</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section
        className="rounded-2xl p-5 border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          Goal & activity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>
              Primary goal
            </label>
            <select
              className={fieldCls}
              style={fieldStyle()}
              value={goal}
              onChange={(e) => setGoal(e.target.value as Goal)}
            >
              <option value="" disabled>Select…</option>
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>
              Activity level
            </label>
            <select
              className={fieldCls}
              style={fieldStyle()}
              value={activity}
              onChange={(e) => setActivity(e.target.value as Activity)}
            >
              <option value="" disabled>Select…</option>
              {ACTIVITY.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Submit bar */}
      <div className="flex items-center gap-4 sticky bottom-0 py-3" >
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 px-6 h-11 rounded-xl text-sm font-bold transition-opacity disabled:opacity-60"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
