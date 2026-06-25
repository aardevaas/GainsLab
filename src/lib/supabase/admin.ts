import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Service-role client — bypasses RLS. ONLY use in server-side code that runs
// with full trust (server actions, API routes). Never expose to the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it from your Supabase project dashboard → Settings → API.',
    );
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
