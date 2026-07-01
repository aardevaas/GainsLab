import { createClient } from '@/lib/supabase/server';
import { getIsProForUser } from '@/lib/payments/gate';
import { SettingsClient } from './SettingsClient';
import { IntegrationsSection } from '@/components/settings/IntegrationsSection';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPro = user ? await getIsProForUser(user.id) : false;

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-6 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {user?.email}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-col gap-6 max-w-2xl">
          <IntegrationsSection isPro={isPro} />
          <SettingsClient />
        </div>
      </div>
    </div>
  );
}
