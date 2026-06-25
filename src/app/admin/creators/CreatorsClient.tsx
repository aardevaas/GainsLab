'use client';

import { useState, useTransition } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, ExternalLink, User } from 'lucide-react';
import { approveCreator, rejectCreator } from './actions';

type Application = {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  specialty: string[];
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  experience_years: number | null;
  certifications: string | null;
  motivation: string;
  status: string;
  review_note: string | null;
  reviewed_at: string | null;
  submitted_at: string;
};

type Props = { applications: Application[] };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  approved: { label: 'Approved', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
};

const SPECIALTY_LABEL: Record<string, string> = {
  fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', maintenance: 'Maintenance',
  performance: 'Performance', general_fitness: 'General', sports: 'Sports',
  powerlifting: 'Powerlifting', bodybuilding: 'Bodybuilding', crossfit: 'CrossFit',
  yoga: 'Yoga', mobility: 'Mobility', nutrition: 'Nutrition',
};

const TABS = ['pending', 'approved', 'rejected'] as const;

export function CreatorsClient({ applications }: Props) {
  const [tab, setTab] = useState<typeof TABS[number]>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const filtered = applications.filter(a => a.status === tab);

  function handleApprove(id: string) {
    startTransition(async () => {
      const res = await approveCreator(id, reviewNotes[id]);
      if (res.error) {
        setFeedback(prev => ({ ...prev, [id]: `Error: ${res.error}` }));
      } else {
        setFeedback(prev => ({ ...prev, [id]: 'Approved!' }));
        setExpandedId(null);
      }
    });
  }

  function handleReject(id: string) {
    startTransition(async () => {
      const res = await rejectCreator(id, reviewNotes[id] ?? '');
      if (res.error) {
        setFeedback(prev => ({ ...prev, [id]: `Error: ${res.error}` }));
      } else {
        setFeedback(prev => ({ ...prev, [id]: 'Rejected.' }));
        setExpandedId(null);
      }
    });
  }

  const counts = Object.fromEntries(
    TABS.map(t => [t, applications.filter(a => a.status === t).length])
  );

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {TABS.map(t => {
          const cfg = STATUS_CONFIG[t];
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                background: active ? cfg.bg : 'var(--color-surface)',
                color: active ? cfg.color : 'var(--color-text-secondary)',
                transition: 'all 150ms ease',
              }}
            >
              {t === 'pending' && <Clock size={13} />}
              {t === 'approved' && <CheckCircle size={13} />}
              {t === 'rejected' && <XCircle size={13} />}
              {cfg.label}
              <span style={{
                fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)',
                padding: '1px 6px', borderRadius: 5,
                background: active ? `${cfg.color}22` : 'var(--color-surface-elevated)',
                color: active ? cfg.color : 'var(--color-text-muted)',
              }}>
                {counts[t]}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 16,
          color: 'var(--color-text-muted)', fontSize: 14,
        }}>
          No {tab} applications.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status];
            const expanded = expandedId === app.id;
            return (
              <div key={app.id} style={{
                borderRadius: 14, border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-surface)', overflow: 'hidden',
              }}>
                {/* Row header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : app.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {/* Avatar placeholder */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'var(--color-surface-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={16} style={{ color: 'var(--color-text-muted)' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
                        {app.full_name}
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 4,
                        color: cfg.color, background: cfg.bg,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {app.specialty.slice(0, 4).map(s => (
                        <span key={s} style={{
                          fontSize: 10, color: 'var(--color-text-muted)',
                          background: 'var(--color-surface-elevated)',
                          padding: '1px 7px', borderRadius: 4,
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {SPECIALTY_LABEL[s] ?? s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
                    {app.experience_years != null && (
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        {app.experience_years}y exp
                      </p>
                    )}
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                      {new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <ChevronDown
                    size={16}
                    style={{
                      color: 'var(--color-text-muted)', flexShrink: 0,
                      transform: expanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 200ms ease',
                    }}
                  />
                </button>

                {/* Expanded detail */}
                {expanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

                      {/* Bio */}
                      {app.bio && (
                        <Section label="Bio">
                          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                            {app.bio}
                          </p>
                        </Section>
                      )}

                      {/* Motivation */}
                      <Section label="Why they want to create">
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                          {app.motivation}
                        </p>
                      </Section>

                      {/* Credentials */}
                      {app.certifications && (
                        <Section label="Certifications">
                          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                            {app.certifications}
                          </p>
                        </Section>
                      )}

                      {/* Social links */}
                      {(app.instagram_url || app.youtube_url || app.tiktok_url) && (
                        <Section label="Social presence">
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {app.instagram_url && (
                              <SocialLink href={app.instagram_url} label="Instagram" />
                            )}
                            {app.youtube_url && (
                              <SocialLink href={app.youtube_url} label="YouTube" />
                            )}
                            {app.tiktok_url && (
                              <SocialLink href={app.tiktok_url} label="TikTok" />
                            )}
                          </div>
                        </Section>
                      )}

                      {/* Prior review note */}
                      {app.review_note && (
                        <Section label="Review note">
                          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, fontStyle: 'italic' }}>
                            "{app.review_note}"
                          </p>
                        </Section>
                      )}

                      {/* Feedback flash */}
                      {feedback[app.id] && (
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', margin: 0 }}>
                          {feedback[app.id]}
                        </p>
                      )}

                      {/* Actions — only for pending */}
                      {app.status === 'pending' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                          <textarea
                            placeholder="Review note (optional — visible to applicant on rejection)"
                            value={reviewNotes[app.id] ?? ''}
                            onChange={e => setReviewNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                            rows={2}
                            style={{
                              width: '100%', resize: 'vertical', padding: '9px 12px',
                              borderRadius: 10, border: '1px solid var(--color-border)',
                              background: 'var(--color-surface-elevated)',
                              color: 'var(--color-text)', fontSize: 13,
                              fontFamily: 'inherit',
                            }}
                          />
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => handleApprove(app.id)}
                              disabled={isPending}
                              style={{
                                flex: 1, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 7,
                                padding: '10px 0', borderRadius: 10, border: 'none',
                                background: 'rgba(74,222,128,0.15)',
                                color: '#4ade80', fontSize: 13, fontWeight: 700,
                                cursor: isPending ? 'not-allowed' : 'pointer',
                                transition: 'background 150ms ease',
                              }}
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(app.id)}
                              disabled={isPending}
                              style={{
                                flex: 1, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 7,
                                padding: '10px 0', borderRadius: 10, border: 'none',
                                background: 'rgba(248,113,113,0.1)',
                                color: '#f87171', fontSize: 13, fontWeight: 700,
                                cursor: isPending ? 'not-allowed' : 'pointer',
                                transition: 'background 150ms ease',
                              }}
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--color-text-muted)',
        margin: '0 0 6px', fontFamily: 'var(--font-mono)',
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 7,
        background: 'var(--color-surface-elevated)',
        color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      <ExternalLink size={11} />
      {label}
    </a>
  );
}
