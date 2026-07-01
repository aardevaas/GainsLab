import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getIsProForUser } from '@/lib/payments/gate';
import { CheckinDigestPanel } from './CheckinDigestPanel';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Check-in Responses — Studio' };

type Question = { id: string; question: string; type: string };

export default async function CheckinResponsesPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/studio');

  const { data: checkin } = await supabase
    .from('automated_checkins')
    .select('id, title, frequency, questions, creator_id')
    .eq('id', id)
    .single();

  if (!checkin || checkin.creator_id !== profile.id) redirect('/studio/checkins');

  const questions = (checkin.questions as Question[]) ?? [];

  const [{ data: responses }, isPro] = await Promise.all([
    supabase
      .from('checkin_responses')
      .select('id, member_user_id, responses, submitted_at')
      .eq('checkin_id', id)
      .order('submitted_at', { ascending: false }),
    getIsProForUser(user.id),
  ]);

  // Resolve member display names from profiles
  const memberIds = [...new Set((responses ?? []).map(r => r.member_user_id))];
  const { data: memberProfiles } = memberIds.length > 0
    ? await supabase
        .from('profiles')
        .select('user_id, name, username')
        .in('user_id', memberIds)
    : { data: [] };

  const nameMap: Record<string, string> = {};
  for (const p of memberProfiles ?? []) {
    nameMap[p.user_id] = p.name ?? p.username ?? 'Member';
  }

  const FREQ_LABEL: Record<string, string> = {
    daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly',
  };

  return (
    <div style={{ padding: '32px 28px' }}>
      {/* Back */}
      <Link href="/studio/checkins" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
        textDecoration: 'none', marginBottom: 20,
      }}>
        <ArrowLeft size={13} /> Back to Check-ins
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 20, fontWeight: 800, color: 'var(--color-text)',
          margin: '0 0 6px', letterSpacing: '-0.03em',
        }}>
          {checkin.title}
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 5,
            background: 'rgba(96,165,250,0.1)', color: '#60a5fa',
            fontFamily: 'var(--font-mono)',
          }}>
            {FREQ_LABEL[checkin.frequency] ?? checkin.frequency}
          </span>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {(responses ?? []).length} responses
          </span>
        </div>
      </div>

      <CheckinDigestPanel
        checkinId={checkin.id}
        isPro={isPro}
        hasResponses={(responses ?? []).length > 0}
      />

      {/* Questions legend */}
      {questions.length > 0 && (
        <div style={{
          marginBottom: 24, padding: '14px 18px', borderRadius: 12,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--color-text-muted)',
            margin: '0 0 10px', fontFamily: 'var(--font-mono)',
          }}>
            Questions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  background: 'rgba(96,165,250,0.12)', color: '#60a5fa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {q.question}
                  {' '}
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>({q.type})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responses */}
      {(responses ?? []).length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 16,
          color: 'var(--color-text-muted)', fontSize: 14,
        }}>
          No responses yet. Clients will be prompted when their check-in is due.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(responses ?? []).map(resp => {
            const answers = (resp.responses ?? {}) as Record<string, string | number>;
            return (
              <div key={resp.id} style={{
                borderRadius: 14, border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-surface)', overflow: 'hidden',
              }}>
                {/* Row header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                    {nameMap[resp.member_user_id] ?? 'Member'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {new Date(resp.submitted_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Answers */}
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {questions.map((q, i) => {
                    const answer = answers[q.id];
                    return (
                      <div key={q.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 2,
                          background: 'rgba(96,165,250,0.08)', color: '#60a5fa',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 800,
                        }}>
                          {i + 1}
                        </span>
                        <div>
                          <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>
                            {q.question}
                          </p>
                          {answer != null ? (
                            q.type === 'scale_1_10' ? (
                              <div style={{ display: 'flex', gap: 4 }}>
                                {Array.from({ length: 10 }, (_, k) => k + 1).map(n => (
                                  <div key={n} style={{
                                    width: 22, height: 22, borderRadius: 5, fontSize: 10, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: n === Number(answer)
                                      ? 'rgba(96,165,250,0.25)' : 'var(--color-surface-elevated)',
                                    color: n === Number(answer) ? '#60a5fa' : 'var(--color-text-muted)',
                                    border: n === Number(answer) ? '1px solid rgba(96,165,250,0.4)' : '1px solid transparent',
                                  }}>
                                    {n}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: 13, color: 'var(--color-text)', margin: 0, lineHeight: 1.5 }}>
                                {String(answer)}
                              </p>
                            )
                          ) : (
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, fontStyle: 'italic' }}>
                              Skipped
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
