'use server';

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { getIsProForUser } from '@/lib/payments/gate';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Question = { id: string; question: string; type: string };
type ResponseRow = {
  member_user_id: string;
  responses: Record<string, string | number> | null;
  submitted_at: string;
};

export type DigestResult = { digest: string } | { error: string };

// Caps the number of responses fed into the prompt — a digest is meant to
// summarize the latest cycle, not the checkin's entire history, and this
// keeps token usage (and cost) predictable per click.
const MAX_RESPONSES = 30;

export async function generateCheckinDigest(checkinId: string): Promise<DigestResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // Pro gate is enforced here, not just hidden in the UI — this calls a paid
  // API on the creator's behalf, so the server must re-verify regardless of
  // what the client showed.
  const isPro = await getIsProForUser(user.id);
  if (!isPro) return { error: 'AI digests are a Pro feature. Upgrade to use this.' };

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) return { error: 'Creator profile not found.' };

  const { data: checkin } = await supabase
    .from('automated_checkins')
    .select('id, title, questions, creator_id')
    .eq('id', checkinId)
    .eq('creator_id', creator.id)
    .maybeSingle();
  if (!checkin) return { error: 'Check-in not found.' };

  const { data: responses } = await supabase
    .from('checkin_responses')
    .select('member_user_id, responses, submitted_at')
    .eq('checkin_id', checkinId)
    .order('submitted_at', { ascending: false })
    .limit(MAX_RESPONSES);

  const responseRows = (responses ?? []) as ResponseRow[];
  if (responseRows.length === 0) return { error: 'No responses yet to summarize.' };

  const questions = (checkin.questions as Question[]) ?? [];
  const questionById = new Map(questions.map(q => [q.id, q.question]));

  const memberIds = [...new Set(responseRows.map(r => r.member_user_id))];
  const { data: profiles } = await supabase
    .from('profiles').select('user_id, name, username').in('user_id', memberIds);
  const nameById = new Map(
    (profiles ?? []).map(p => [p.user_id, p.name ?? p.username ?? 'Member']),
  );

  const transcript = responseRows.map(r => {
    const answers = r.responses ?? {};
    const lines = Object.entries(answers).map(
      ([qId, answer]) => `  - ${questionById.get(qId) ?? qId}: ${answer}`,
    );
    return `${nameById.get(r.member_user_id) ?? 'Member'}:\n${lines.join('\n')}`;
  }).join('\n\n');

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `You are summarizing client check-in responses for a fitness coach
reviewing "${checkin.title}". Below are the latest responses.

${transcript}

Write a short digest for the coach in plain text (no markdown headers):
- 2-4 bullet points on patterns across clients (energy, soreness, adherence, mood, etc.)
- Call out any client whose answers suggest they need direct follow-up
- Keep it under 120 words total
- Use a "-" prefix for each bullet, one per line`,
      }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return { error: 'Could not generate a digest. Try again.' };

    return { digest: content.text.trim() };
  } catch {
    return { error: 'AI digest failed. Try again in a moment.' };
  }
}
