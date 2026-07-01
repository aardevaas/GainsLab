import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const intlResponse = handleI18nRouting(request);

  // A bare/un-prefixed path (or a locale next-intl wants to switch) gets a
  // redirect here — let it through as-is. Auth runs on the follow-up request
  // once the URL actually carries a locale prefix.
  if (intlResponse.headers.get('location')) {
    return intlResponse;
  }

  return updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
