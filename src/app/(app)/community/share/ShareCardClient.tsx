'use client';

import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';

type Props = {
  imageUrl: string;
  shareText: string;
};

export function ShareCardClient({ imageUrl, shareText }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Action buttons */}
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
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)', maxWidth: 480 }}>
        Save the image to your camera roll, then share it as a story or post on Instagram.
      </p>
    </div>
  );
}
