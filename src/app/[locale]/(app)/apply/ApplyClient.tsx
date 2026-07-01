'use client';

import { useActionState, useState } from 'react';
import { submitCreatorApplication, type ApplyState } from './actions';
import {
  CheckCircle, ExternalLink, Globe, Loader2,
  Zap, Users, TrendingUp, Shield,
} from 'lucide-react';

const SPECIALTIES = [
  { id: 'fat_loss', label: 'Fat Loss' },
  { id: 'muscle_gain', label: 'Muscle Gain' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'powerlifting', label: 'Powerlifting' },
  { id: 'bodybuilding', label: 'Bodybuilding' },
  { id: 'calisthenics', label: 'Calisthenics' },
  { id: 'sports_performance', label: 'Sports Performance' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'rehabilitation', label: 'Rehab' },
  { id: 'mindset', label: 'Mindset' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'general_fitness', label: 'General Fitness' },
];

const VALUE_PROPS = [
  { icon: <TrendingUp size={16} />, label: 'Keep 90–95% of revenue', sub: 'We take only 5–10%. You earn what you deserve.' },
  { icon: <Users size={16} />, label: 'Built-in client management', sub: 'Roster, programs, check-ins — all automated.' },
  { icon: <Zap size={16} />, label: 'Zero monthly fee to start', sub: 'We grow when you grow. No upfront cost.' },
  { icon: <Shield size={16} />, label: 'Protected payments', sub: 'Every transaction runs through GainsLab.' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)', borderRadius: 10,
  padding: '11px 14px', fontSize: 14, color: 'var(--color-text)',
  outline: 'none', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)',
  letterSpacing: '0.05em', display: 'block', marginBottom: 6,
};

const sectionHeadStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.15em', color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-mono)', marginBottom: 20,
  paddingBottom: 12, borderBottom: '1px solid var(--color-border-subtle)',
};

type Props = { profileName: string | null };

export function ApplyClient({ profileName }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, action, pending] = useActionState<ApplyState, FormData>(
    submitCreatorApplication,
    {},
  );

  function toggleSpecialty(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (state.success) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 20, textAlign: 'center', padding: '0 32px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--color-accent-subtle)', border: '2px solid var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 32px rgba(74,222,128,0.2)',
        }}>
          <CheckCircle size={28} style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
            Application Submitted
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0, maxWidth: 400 }}>
            We review every application personally. You'll hear back within 48 hours.
            Welcome to the future of fitness coaching.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 0 80px' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(74,222,128,0.06) 0%, transparent 60%)',
        border: '1px solid var(--color-border-subtle)', borderRadius: 18,
        padding: '40px 40px 36px', marginBottom: 40,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 300, height: 300,
          background: 'radial-gradient(circle at 70% 30%, rgba(74,222,128,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--color-accent)', fontFamily: 'var(--font-mono)',
          background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
          padding: '4px 10px', borderRadius: 6,
        }}>
          <Zap size={10} /> Creator Program
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.04em', lineHeight: 1.15, margin: '0 0 12px' }}>
          Build your coaching<br />business on GainsLab
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: '0 0 28px', maxWidth: 520 }}>
          We're selectively onboarding coaches during our launch phase. If you're serious about
          growing your impact and income, this is your platform.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {VALUE_PROPS.map((v, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
              background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
              borderRadius: 10,
            }}>
              <div style={{ color: 'var(--color-accent)', marginTop: 1, flexShrink: 0 }}>{v.icon}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 2px' }}>{v.label}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>{v.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORM ── */}
      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {/* Hidden specialties as checkboxes so FormData includes them */}
        {Array.from(selected).map(s => (
          <input key={s} type="hidden" name="specialty" value={s} />
        ))}

        {/* ── IDENTITY ── */}
        <section>
          <p style={sectionHeadStyle}>Your Identity</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="full_name" style={labelStyle}>Full Name *</label>
              <input id="full_name" name="full_name" required defaultValue={profileName ?? undefined}
                placeholder="Your full name as it appears publicly"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="bio" style={labelStyle}>Bio</label>
              <textarea id="bio" name="bio" rows={3}
                placeholder="A short bio that will appear on your creator profile…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </section>

        {/* ── SPECIALTY ── */}
        <section>
          <p style={sectionHeadStyle}>Your Specialty *</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16, marginTop: -12 }}>
            Select all that apply — this is how members discover you.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SPECIALTIES.map(s => {
              const on = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSpecialty(s.id)}
                  style={{
                    fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
                    padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                    border: on ? '1px solid rgba(74,222,128,0.5)' : '1px solid var(--color-border)',
                    background: on ? 'rgba(74,222,128,0.1)' : 'var(--color-surface-elevated)',
                    color: on ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    transition: 'all 150ms ease',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {on && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)' }} />}
                  {s.label}
                </button>
              );
            })}
          </div>
          {selected.size > 0 && (
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 10 }}>
              {selected.size} selected
            </p>
          )}
        </section>

        {/* ── PRESENCE ── */}
        <section>
          <p style={sectionHeadStyle}>Your Presence</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label htmlFor="instagram_url" style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><ExternalLink size={12} /> Instagram</span>
              </label>
              <input id="instagram_url" name="instagram_url" type="url"
                placeholder="https://instagram.com/yourhandle"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="youtube_url" style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><ExternalLink size={12} /> YouTube</span>
              </label>
              <input id="youtube_url" name="youtube_url" type="url"
                placeholder="https://youtube.com/@yourchannel"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="tiktok_url" style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Globe size={12} /> TikTok</span>
              </label>
              <input id="tiktok_url" name="tiktok_url" type="url"
                placeholder="https://tiktok.com/@yourhandle"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="experience_years" style={labelStyle}>Years of Experience</label>
              <input id="experience_years" name="experience_years" type="number" min="0" max="50"
                placeholder="e.g. 5"
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label htmlFor="certifications" style={labelStyle}>Certifications & Credentials</label>
              <input id="certifications" name="certifications"
                placeholder="NASM-CPT, ACE, Precision Nutrition, etc."
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* ── MOTIVATION ── */}
        <section>
          <p style={sectionHeadStyle}>Why GainsLab?</p>
          <div>
            <label htmlFor="motivation" style={labelStyle}>
              Tell us what drives you as a coach and why you want to build on GainsLab *
            </label>
            <textarea id="motivation" name="motivation" rows={5} required minLength={50}
              placeholder="What problems do you solve for your clients? What makes your coaching different? What excites you about the GainsLab platform?…"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
            />
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
              Minimum 50 characters · Be specific — this helps us understand your vision
            </p>
          </div>
        </section>

        {/* ── ERROR ── */}
        {state.error && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
            fontSize: 13, color: '#f87171',
          }}>
            {state.error}
          </div>
        )}

        {/* ── SUBMIT ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button type="submit" disabled={pending} style={{
            padding: '13px 32px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: pending ? 'var(--color-surface-elevated)' : 'var(--color-accent)',
            color: pending ? 'var(--color-text-muted)' : '#0a0c0f',
            border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: pending ? 'none' : '0 4px 20px rgba(74,222,128,0.25)',
            transition: 'all 200ms ease',
          }}>
            {pending ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={16} />}
            {pending ? 'Submitting…' : 'Apply to GainsLab'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            We review every application within 48 hrs.
          </p>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
