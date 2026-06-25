'use client';

import { useState, useTransition } from 'react';
import { Zap, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { requestToJoin } from './actions';

type Props = {
  creatorId: string;
  communityPriceBob: number | null;
  initialRequested: boolean;
};

export function JoinRequestButton({ creatorId, communityPriceBob, initialRequested }: Props) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<'idle' | 'requested' | 'member' | 'error'>(
    initialRequested ? 'requested' : 'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');

  function handleClick() {
    startTransition(async () => {
      const result = await requestToJoin(creatorId);
      if (result.status === 'sent') setState('requested');
      else if (result.status === 'already_member') setState('member');
      else if (result.status === 'already_requested') setState('requested');
      else {
        setErrorMsg(result.message);
        setState('error');
      }
    });
  }

  if (state === 'requested') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
        background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
        color: '#fbbf24',
      }}>
        <Clock size={14} />
        Request sent — awaiting approval
      </div>
    );
  }

  if (state === 'member') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
        background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
        color: '#4ade80',
      }}>
        <CheckCircle size={14} />
        You're already a member
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: '#f87171',
        }}>
          <AlertCircle size={12} /> {errorMsg}
        </div>
        <button
          type="button"
          onClick={() => setState('idle')}
          style={{
            fontSize: 12, color: 'var(--color-text-muted)', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      style={{
        padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
        background: pending ? 'rgba(74,222,128,0.4)' : 'var(--color-accent)',
        color: '#0a0c0f', border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: pending ? 'none' : '0 4px 16px rgba(74,222,128,0.25)',
        transition: 'all 150ms ease',
      }}
    >
      {pending ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={14} />}
      {pending
        ? 'Sending…'
        : communityPriceBob
          ? `Join · Bs. ${communityPriceBob}/mo`
          : 'Request to Join'}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
