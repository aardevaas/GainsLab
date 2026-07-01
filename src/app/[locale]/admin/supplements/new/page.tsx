import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SupplementForm } from '../SupplementForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'New Supplement — Admin' };

export default function NewSupplementPage() {
  return (
    <div>
      <Link
        href="/admin/supplements"
        className="inline-flex items-center gap-2 text-xs font-semibold mb-6"
        style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
      >
        <ArrowLeft size={13} /> Supplements
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 20px', letterSpacing: '-0.03em' }}>
        New supplement
      </h1>
      <SupplementForm />
    </div>
  );
}
