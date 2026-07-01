'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { saveBodyAgeAssessment } from './actions';

type Fields = {
  pushup_max: string;
  situp_max: string;
  resting_hr: string;
  flexibility_score: string;
  mile_time_minutes: string;
};

const STEPS = [
  {
    key: 'pushup_max' as const,
    label: 'Push-up Test',
    unit: 'reps',
    description: 'Perform as many push-ups as you can with good form and no rest.',
    guidance: [
      'Start in a high plank. Hands shoulder-width apart.',
      'Lower until your chest nearly touches the floor.',
      'Full lockout at the top counts as one rep.',
      'Stop when form breaks down.',
    ],
    placeholder: 'e.g. 25',
    min: 0,
    max: 200,
  },
  {
    key: 'situp_max' as const,
    label: 'Sit-up Test',
    unit: 'reps / 60 sec',
    description: 'Perform as many sit-ups as you can in 60 seconds. Have someone hold your feet.',
    guidance: [
      'Lie on your back, knees bent at 90°.',
      'Hands behind your head or crossed on your chest.',
      'Touch your elbows to your knees at the top.',
      'Control the descent — bouncing does not count.',
    ],
    placeholder: 'e.g. 30',
    min: 0,
    max: 200,
  },
  {
    key: 'resting_hr' as const,
    label: 'Resting Heart Rate',
    unit: 'bpm',
    description: 'Measure your resting heart rate first thing in the morning before getting out of bed.',
    guidance: [
      'Lie still for 5 minutes after waking.',
      'Place two fingers on your wrist (radial) or neck (carotid).',
      'Count beats for 60 seconds (or 30 s × 2).',
      'Take the average of 3 readings for accuracy.',
    ],
    placeholder: 'e.g. 62',
    min: 30,
    max: 200,
  },
  {
    key: 'flexibility_score' as const,
    label: 'Sit-and-Reach Test',
    unit: 'cm',
    description: 'Measure how far you can reach past your feet. Negative values are fine if you cannot reach.',
    guidance: [
      'Sit on the floor with legs straight, feet flat against a box or wall.',
      'Slowly reach forward with both hands as far as possible.',
      'Hold for 2 seconds. Do not bounce.',
      'Positive = past your feet. Negative = short of your feet.',
    ],
    placeholder: 'e.g. 10 (or -5 if short)',
    min: -30,
    max: 50,
  },
  {
    key: 'mile_time_minutes' as const,
    label: '1-Mile Run/Walk',
    unit: 'minutes (decimal)',
    description: 'Complete 1 mile as fast as possible — running, walking, or a mix.',
    guidance: [
      'Use a track, GPS watch, or treadmill to measure exactly 1 mile.',
      'Warm up for 5 minutes first.',
      'Enter your time in decimal minutes: 8 min 30 sec = 8.5',
      'Walking counts — this measures your aerobic fitness level.',
    ],
    placeholder: 'e.g. 9.5 (= 9 min 30 sec)',
    min: 3,
    max: 40,
    step: 0.1,
  },
];

export function BodyAgeTestClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<Fields>({
    pushup_max: '',
    situp_max: '',
    resting_hr: '',
    flexibility_score: '',
    mile_time_minutes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function setValue(val: string) {
    setError(null);
    setFields(prev => ({ ...prev, [current.key]: val }));
  }

  function validate(): boolean {
    const val = parseFloat(fields[current.key]);
    if (isNaN(val)) {
      setError('Please enter a number.');
      return false;
    }
    if (val < current.min || val > current.max) {
      setError(`Must be between ${current.min} and ${current.max}.`);
      return false;
    }
    return true;
  }

  function handleNext() {
    if (!validate()) return;
    setStep(s => s + 1);
  }

  function handleSubmit() {
    if (!validate()) return;
    startTransition(async () => {
      await saveBodyAgeAssessment({
        pushup_max: parseInt(fields.pushup_max),
        situp_max: parseInt(fields.situp_max),
        resting_hr: parseInt(fields.resting_hr),
        flexibility_score: parseFloat(fields.flexibility_score),
        mile_time_minutes: parseFloat(fields.mile_time_minutes),
      });
      router.push('/profile/body-age');
    });
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-1.5 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= step ? 'var(--color-accent)' : 'var(--color-border)' }}
          />
        ))}
      </div>

      {/* Step label */}
      <div className="mb-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-6 border mb-4"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-xl font-extrabold mb-1" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          {current.label}
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
          {current.description}
        </p>

        {/* Guidance */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--color-text-muted)' }}>
            How to perform
          </p>
          <ol className="flex flex-col gap-1.5">
            {current.guidance.map((g, i) => (
              <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="shrink-0 font-semibold" style={{ color: 'var(--color-text-muted)' }}>{i + 1}.</span>
                {g}
              </li>
            ))}
          </ol>
        </div>

        {/* Input */}
        <label className="block">
          <span className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Your result ({current.unit})
          </span>
          <input
            type="number"
            inputMode="decimal"
            step={('step' in current) ? current.step : 1}
            min={current.min}
            max={current.max}
            value={fields[current.key]}
            onChange={e => setValue(e.target.value)}
            placeholder={current.placeholder}
            className="w-full rounded-xl px-4 py-3 text-lg font-bold outline-none focus:ring-1"
            style={{
              background: 'var(--color-bg)',
              border: `1px solid ${error ? '#f87171' : 'var(--color-border)'}`,
              color: 'var(--color-text)',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') isLast ? handleSubmit() : handleNext();
            }}
          />
          {error && <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>{error}</p>}
        </label>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <ChevronLeft size={15} />
            Back
          </button>
        )}
        <button
          type="button"
          onClick={isLast ? handleSubmit : handleNext}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-60"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <>
              {isLast ? 'Calculate My Body Age' : 'Next'}
              {!isLast && <ChevronRight size={15} />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
