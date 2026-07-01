import Link from 'next/link';
import { ArrowLeft, Activity } from 'lucide-react';
import { BodyAgeTestClient } from '../BodyAgeTestClient';
import { requirePro } from '@/lib/payments/gate';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Body Age Assessment' };

export default async function BodyAgeTestPage() {
  await requirePro();

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/profile/body-age" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div className="flex items-center gap-3">
          <Activity size={16} style={{ color: 'var(--color-accent)' }} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Body Age Assessment
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <BodyAgeTestClient />
      </div>
    </div>
  );
}
