'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ChevronDown, ExternalLink, Lock } from 'lucide-react';
import { WEARABLE_PROVIDERS } from '@/lib/wearables/providers';

type Props = {
  isPro: boolean;
};

export function IntegrationsSection({ isPro }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section
      className="rounded-2xl p-5 border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Activity size={15} style={{ color: 'var(--color-text-secondary)' }} />
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          Wearable integrations
        </h2>
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Sync steps, sleep, and workouts automatically. Pro feature.
      </p>

      {!isPro ? (
        <div
          className="flex items-center justify-between gap-3 rounded-xl p-4"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <div className="flex items-center gap-2.5">
            <Lock size={14} style={{ color: '#fbbf24' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Upgrade to Pro to connect a wearable.
            </p>
          </div>
          <Link
            href="/subscribe"
            className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
          >
            Upgrade →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {WEARABLE_PROVIDERS.map(provider => {
            const expanded = expandedId === provider.id;
            return (
              <div
                key={provider.id}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : provider.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{ background: 'var(--color-bg)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      {provider.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {provider.description}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full"
                    style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}
                  >
                    Not connected
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: 'var(--color-text-muted)',
                      transform: expanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 150ms ease',
                    }}
                  />
                </button>

                {expanded && (
                  <div
                    className="px-4 py-3 text-xs leading-relaxed"
                    style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}
                  >
                    <p className="mb-3">{provider.setupInstructions}</p>
                    <a
                      href={provider.devConsoleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      <ExternalLink size={11} />
                      {provider.devConsoleLabel}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
