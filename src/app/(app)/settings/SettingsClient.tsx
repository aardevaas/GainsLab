'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle, Loader2, LogOut, Trash2, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { deleteAccountData } from './actions';

const fieldCls = 'w-full h-10 rounded-xl px-3 text-sm outline-none transition-colors focus:ring-1';
const fieldStyle = {
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
};

export function SettingsClient() {
  const router = useRouter();
  const supabase = createClient();

  // Password change
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwPending, setPwPending] = useState(false);

  // Delete
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus('idle');
    setPwMessage(null);

    if (password.length < 8) {
      setPwStatus('error');
      setPwMessage('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setPwStatus('error');
      setPwMessage('Passwords do not match');
      return;
    }

    setPwPending(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPwPending(false);

    if (error) {
      setPwStatus('error');
      setPwMessage(error.message);
      return;
    }
    setPwStatus('saved');
    setPwMessage('Password updated');
    setPassword('');
    setConfirm('');
    setTimeout(() => setPwStatus('idle'), 2500);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  function handleDelete() {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteAccountData();
      // On success the action redirects; only an error returns here.
      if (result && !result.ok) {
        setDeleteError(result.error ?? 'Something went wrong');
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Password */}
      <section
        className="rounded-2xl p-5 border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock size={15} style={{ color: 'var(--color-text-secondary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Change password
          </h2>
        </div>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
                New password
              </label>
              <input
                type="password"
                className={fieldCls}
                style={fieldStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
                Confirm password
              </label>
              <input
                type="password"
                className={fieldCls}
                style={fieldStyle}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={pwPending}
              className="flex items-center justify-center gap-2 px-5 h-10 rounded-xl text-sm font-bold transition-opacity disabled:opacity-60"
              style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
            >
              {pwPending && <Loader2 size={15} className="animate-spin" />}
              Update password
            </button>
            {pwStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                <Check size={15} /> {pwMessage}
              </span>
            )}
            {pwStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
                <AlertCircle size={15} /> {pwMessage}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Session */}
      <section
        className="rounded-2xl p-5 border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Session
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Sign out of GainsLab on this device.
        </p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold border transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </section>

      {/* Danger zone */}
      <section
        className="rounded-2xl p-5 border"
        style={{ background: 'rgba(248,113,113,0.04)', borderColor: 'rgba(248,113,113,0.3)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Trash2 size={15} style={{ color: 'var(--color-danger)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-danger)' }}>
            Danger zone
          </h2>
        </div>
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Permanently delete all your data — profile, food logs, workouts, progress, and competition
          entries. This cannot be undone. Type <strong style={{ color: 'var(--color-text)' }}>DELETE</strong> to confirm.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            className={fieldCls + ' sm:max-w-48'}
            style={fieldStyle}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
          />
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || isDeleting}
            className="flex items-center justify-center gap-2 px-5 h-10 rounded-xl text-sm font-bold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-danger)', color: '#fff' }}
          >
            {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Delete my data
          </button>
        </div>
        {deleteError && (
          <p className="mt-3 flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-danger)' }}>
            <AlertCircle size={15} /> {deleteError}
          </p>
        )}
      </section>
    </div>
  );
}
