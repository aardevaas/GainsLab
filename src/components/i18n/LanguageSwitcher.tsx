'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

/** Switches locale while staying on the current page. */
export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function handleChange(nextLocale: string) {
    router.replace(
      // @ts-expect-error -- params are typed against the current route's
      // params, but we're switching locale on whatever route is active.
      { pathname, params },
      { locale: nextLocale },
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Globe size={13} style={{ color: 'var(--color-text-muted)' }} aria-hidden />
      <label htmlFor="language-switcher" className="sr-only">{t('label')}</label>
      <select
        id="language-switcher"
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="text-xs font-semibold bg-transparent outline-none cursor-pointer"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} style={{ color: '#0a0c0f' }}>
            {t(l)}
          </option>
        ))}
      </select>
    </div>
  );
}
