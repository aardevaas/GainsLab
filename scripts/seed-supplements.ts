/**
 * One-time migration: copies the hardcoded supplements from
 * src/lib/supplements/data.ts into the supplements table (see migration
 * 020_supplements_cms.sql). Safe to re-run — upserts on slug.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... npx tsx scripts/seed-supplements.ts
 */
import { createClient } from '@supabase/supabase-js';
import { SUPPLEMENTS } from '../src/lib/supplements/data';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  for (const s of SUPPLEMENTS) {
    const { error } = await supabase
      .from('supplements')
      .upsert(
        {
          slug: s.id,
          name: s.name,
          category: s.category,
          goals: s.goals,
          evidence: s.evidence,
          summary: s.summary,
          mechanism: s.mechanism,
          dosage: s.dosage,
          timing: s.timing,
          notes: s.notes,
          price_tier: s.priceTier,
          is_published: true,
        },
        { onConflict: 'slug' },
      );

    if (error) {
      console.error(`Failed to seed "${s.id}":`, error.message);
    } else {
      console.log(`Seeded: ${s.id}`);
    }
  }
}

main().then(() => process.exit(0));
