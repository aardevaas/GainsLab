'use client';

import { useState, useEffect } from 'react';
import { Copy, Download, Check, Share2 } from 'lucide-react';

type Props = {
  imageUrl: string;
  shareText: string;
};

export function ShareCardClient({ imageUrl, shareText }: Props) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title: 'My GainsLab Progress', text: shareText, url: window.location.origin });
    } catch {
      // user cancelled or share failed — silently ignore
    }
  }

  return (
    <div className="space-y-6">
      {/* Card preview */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: 'var(--color-border)', maxWidth: 480 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Your GainsLab progress card"
          className="w-full"
          style={{ display: 'block' }}
        />
      </div>

      {/* Primary actions */}
      <div className="flex gap-3" style={{ maxWidth: 480 }}>
        <a
          href={imageUrl}
          download="gainslab-card.png"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          <Download size={14} />
          Download PNG
        </a>

        {canNativeShare ? (
          <button
            onClick={handleNativeShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', background: 'var(--color-surface)' }}
          >
            <Share2 size={14} />
            Share
          </button>
        ) : (
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all"
            style={{
              borderColor: copied ? 'var(--color-accent)' : 'var(--color-border)',
              color: copied ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              background: copied ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy caption'}
          </button>
        )}
      </div>

      {/* Secondary: copy caption when native share is available */}
      {canNativeShare && (
        <button
          onClick={handleCopy}
          className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all"
          style={{
            borderColor: copied ? 'var(--color-accent)' : 'var(--color-border)',
            color: copied ? 'var(--color-accent)' : 'var(--color-text-muted)',
            background: copied ? 'var(--color-accent-subtle)' : 'transparent',
            maxWidth: 480,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Caption copied!' : 'Copy caption text'}
        </button>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)', maxWidth: 480 }}>
        Download the image then share it as a story or post on Instagram, X, or anywhere.
      </p>
    </div>
  );
}
