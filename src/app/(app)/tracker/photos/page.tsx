import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getPhotos } from './actions';
import { PhotosClient } from './PhotosClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Progress Photos' };

export default async function ProgressPhotosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const photos = await getPhotos();

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link
          href="/tracker"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Progress Photos
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Your transformation · drag to compare
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <PhotosClient photos={photos} userId={user.id} />
      </div>
    </div>
  );
}
