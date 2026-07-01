import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProgramBuilderClient } from './ProgramBuilderClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'New Program' };

export default async function NewProgramPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) redirect('/apply');

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-7 py-5 border-b flex items-center gap-4 shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/studio/programs"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            New Program
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Build a week-by-week training program for your clients
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-7">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <ProgramBuilderClient />
        </div>
      </div>
    </div>
  );
}
