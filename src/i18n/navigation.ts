import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware drop-ins for next/link, next/navigation — use these instead of
// the plain Next.js versions in any file that needs to stay on the current
// locale when navigating. Existing `next/link` usages keep working too (the
// middleware redirect adds the locale prefix), this is just the no-redirect,
// cleaner path for new/updated code.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
