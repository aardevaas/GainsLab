import { defineRouting } from 'next-intl/routing';

// Spanish is the default — Bolivia (the launch market) is Spanish-speaking.
// English is opt-in via the /en prefix.
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
});

export type AppLocale = (typeof routing.locales)[number];
