import { createClient } from '@/lib/supabase/server';
import { approveSubmission, rejectSubmission, flagSubmission } from './actions';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Payment Review — Admin' };

const STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24',
  approved: '#4ade80',
  rejected: '#f87171',
  flagged:  '#fb923c',
};

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  // Fetch all submissions ordered newest first
  const { data: submissions } = await supabase
    .from('payment_submissions')
    .select('id, user_id, status, amount_extracted, transaction_id_extracted, date_extracted, destination_extracted, ocr_confidence, auto_approved, review_note, submitted_at, reviewed_at, receipt_storage_path, plan_id')
    .order('submitted_at', { ascending: false })
    .limit(100);

  const rows = submissions ?? [];

  // Generate signed URLs for all receipts (1-hour expiry)
  const signedUrls = await Promise.all(
    rows.map(async (row) => {
      const { data } = await supabase.storage
        .from('payment-receipts')
        .createSignedUrl(row.receipt_storage_path, 3600);
      return { id: row.id, url: data?.signedUrl ?? null };
    }),
  );
  const urlMap = new Map(signedUrls.map(s => [s.id, s.url]));

  // Fetch user emails for display
  const userIds = [...new Set(rows.map(r => r.user_id))];
  const profilesRes = userIds.length
    ? await supabase.from('profiles').select('user_id, name, username').in('user_id', userIds)
    : { data: [] };
  const profileMap = new Map((profilesRes.data ?? []).map(p => [p.user_id, p.name ?? p.username ?? p.user_id.slice(0, 8)]));

  const pending = rows.filter(r => r.status === 'pending');
  const flagged = rows.filter(r => r.status === 'flagged');
  const reviewed = rows.filter(r => r.status !== 'pending' && r.status !== 'flagged');

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
          Payment Submissions
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {pending.length} pending · {flagged.length} flagged · {rows.length} total
        </p>
      </div>

      {/* Pending queue */}
      {pending.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No pending submissions</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>All caught up.</p>
        </div>
      ) : (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Pending Review
          </h2>
          {pending.map(row => (
            <SubmissionCard
              key={row.id}
              row={row}
              receiptUrl={urlMap.get(row.id) ?? null}
              displayName={profileMap.get(row.user_id) ?? row.user_id.slice(0, 8)}
            />
          ))}
        </section>
      )}

      {/* Flagged — needs manual decision */}
      {flagged.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#fb923c' }}>
            Flagged — Needs Decision
          </h2>
          {flagged.map(row => (
            <SubmissionCard
              key={row.id}
              row={row}
              receiptUrl={urlMap.get(row.id) ?? null}
              displayName={profileMap.get(row.user_id) ?? row.user_id.slice(0, 8)}
            />
          ))}
        </section>
      )}

      {/* Reviewed history */}
      {reviewed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            History
          </h2>
          {reviewed.map(row => (
            <SubmissionCard
              key={row.id}
              row={row}
              receiptUrl={urlMap.get(row.id) ?? null}
              displayName={profileMap.get(row.user_id) ?? row.user_id.slice(0, 8)}
              readOnly
            />
          ))}
        </section>
      )}
    </div>
  );
}

type SubmissionRow = {
  id: string;
  user_id: string;
  status: string;
  amount_extracted: number | null;
  transaction_id_extracted: string | null;
  date_extracted: string | null;
  destination_extracted: string | null;
  ocr_confidence: string | null;
  auto_approved: boolean | null;
  review_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  plan_id: string;
};

function SubmissionCard({
  row,
  receiptUrl,
  displayName,
  readOnly = false,
}: {
  row: SubmissionRow;
  receiptUrl: string | null;
  displayName: string;
  readOnly?: boolean;
}) {
  const statusColor = STATUS_COLORS[row.status] ?? 'var(--color-text-muted)';

  return (
    <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{displayName}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${statusColor}18`, color: statusColor }}>
              {row.status}
            </span>
            {row.auto_approved && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}>
                auto
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Submitted {new Date(row.submitted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            View receipt ↗
          </a>
        )}
      </div>

      {/* OCR extracted data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Amount', value: row.amount_extracted != null ? `Bs. ${row.amount_extracted}` : '—' },
          { label: 'TX ID', value: row.transaction_id_extracted ?? '—' },
          { label: 'Date', value: row.date_extracted ?? '—' },
          { label: 'OCR confidence', value: row.ocr_confidence ?? '—' },
        ].map(f => (
          <div key={f.label} className="rounded-xl p-3" style={{ background: 'var(--color-surface-elevated)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>{f.label}</p>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{f.value}</p>
          </div>
        ))}
      </div>

      {row.review_note && (
        <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>Note: {row.review_note}</p>
      )}

      {/* Action buttons — pending and flagged */}
      {!readOnly && (row.status === 'pending' || row.status === 'flagged') && (
        <div className="flex flex-wrap gap-3 pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <form action={approveSubmission.bind(null, row.id, 'Manually verified by admin')}>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
            >
              Approve — Activate 30 days
            </button>
          </form>
          {row.status === 'pending' && (
            <form action={flagSubmission.bind(null, row.id, 'Needs further verification.')}>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: '#fb923c', color: '#fb923c' }}
              >
                Flag
              </button>
            </form>
          )}
          <form action={rejectSubmission.bind(null, row.id, 'Receipt could not be verified. Please resubmit.')}>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold border"
              style={{ borderColor: 'var(--color-border)', color: '#f87171' }}
            >
              Reject
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
