'use client';

import { useActionState, useRef, useState } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { submitReceipt } from './actions';
import type { SubmitResult } from './actions';

const PRICE_BOB = process.env.NEXT_PUBLIC_PLAN_PRICE_BOB ?? '99.60';
const QR_URL = process.env.NEXT_PUBLIC_SIMPLE_QR_URL ?? '';

type Props = {
  hasPending: boolean;
  pendingSubmittedAt: string | null;
};

export function SubscribeClient({ hasPending, pendingSubmittedAt }: Props) {
  const [result, action, isPending] = useActionState<SubmitResult | null, FormData>(submitReceipt, null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function clearFile() {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  // Already approved this session
  if (result?.status === 'approved') {
    return (
      <div className="rounded-2xl border p-8 text-center space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)' }}>
        <CheckCircle size={40} className="mx-auto" style={{ color: 'var(--color-accent)' }} />
        <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Subscription Activated!</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Your GainsLab Pro is active for the next 30 days. Welcome to the squad.
        </p>
      </div>
    );
  }

  // Pending review
  if (hasPending || result?.status === 'pending') {
    const submittedAt = pendingSubmittedAt
      ? new Date(pendingSubmittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : 'recently';

    return (
      <div className="rounded-2xl border p-8 text-center space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <Clock size={40} className="mx-auto" style={{ color: '#fbbf24' }} />
        <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Receipt Under Review</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Submitted at {submittedAt}. We'll verify within a few hours and activate your access.
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          No action needed — refresh this page to check your status.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {/* Step 1: QR */}
      <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <span className="size-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}>1</span>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Scan the QR with your banking app</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {QR_URL ? (
            <div className="shrink-0 rounded-xl overflow-hidden border p-3" style={{ borderColor: 'var(--color-border)', background: '#fff' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={QR_URL} alt="$imple payment QR" width={160} height={160} style={{ display: 'block' }} />
            </div>
          ) : (
            <div className="shrink-0 size-[160px] rounded-xl border flex items-center justify-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-elevated)' }}>
              <p className="text-xs text-center px-3" style={{ color: 'var(--color-text-muted)' }}>QR not configured<br />(set NEXT_PUBLIC_SIMPLE_QR_URL)</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Open your banking app (Bisa, BNB, Mercantil, BancoSol, etc.) and scan the QR.
            </p>
            <div className="rounded-xl border px-4 py-3" style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>Amount to pay</p>
              <p className="text-3xl font-black" style={{ color: 'var(--color-accent)', letterSpacing: '-0.04em' }}>
                Bs. {PRICE_BOB}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>≈ $10 USD · 30-day Pro access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Upload receipt */}
      <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <span className="size-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text)' }}>2</span>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Upload your payment receipt</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          name="receipt"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          className="sr-only"
          id="receipt-input"
        />

        {preview ? (
          <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Receipt preview" className="w-full max-h-64 object-contain" style={{ background: '#000' }} />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 size-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            >
              <X size={14} style={{ color: '#fff' }} />
            </button>
            <p className="px-3 py-2 text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{fileName}</p>
          </div>
        ) : (
          <label
            htmlFor="receipt-input"
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-elevated)' }}
          >
            <Upload size={28} style={{ color: 'var(--color-text-muted)' }} />
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Click to upload receipt</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>JPG, PNG, WEBP or PDF · max 10 MB</p>
            </div>
          </label>
        )}
      </div>

      {/* Error message */}
      {result && !result.success && (
        <div className="flex items-start gap-3 rounded-xl border px-4 py-3" style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.3)' }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#f87171' }} />
          <p className="text-sm" style={{ color: '#f87171' }}>{result.message}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || !preview}
        className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all"
        style={{
          background: isPending || !preview ? 'var(--color-surface-elevated)' : 'var(--color-accent)',
          color: isPending || !preview ? 'var(--color-text-muted)' : '#0a0c0f',
          cursor: isPending || !preview ? 'not-allowed' : 'pointer',
        }}
      >
        {isPending ? 'Verifying receipt…' : 'Submit Receipt'}
      </button>

      <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        High-confidence receipts are approved instantly. Others are reviewed manually within a few hours.
      </p>
    </form>
  );
}
