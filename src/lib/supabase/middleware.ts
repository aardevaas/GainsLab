import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import { routing } from '@/i18n/routing';

// Routes anyone can visit without an account (locale-stripped, e.g. "/learn"
// matches both "/es/learn" and "/en/learn")
const PUBLIC_PREFIXES = [
  '/',
  '/login',
  '/signup',
  '/about',
  '/pricing',
  '/learn',
  '/exercises',
  '/nutrition',
];

// Routes that ALWAYS require auth (personal data)
const AUTH_REQUIRED_PREFIXES = [
  '/dashboard',
  '/onboarding',
  '/profile',
  '/tracker',
  '/workouts',
  '/grocery',
  '/community',
  '/settings',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    p => pathname === p || (p !== '/' && pathname.startsWith(p)),
  );
}

function requiresAuth(pathname: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some(p => pathname.startsWith(p));
}

/** Splits a locale-prefixed pathname (e.g. "/es/dashboard") into its locale and the rest ("/dashboard"). */
function splitLocale(pathname: string): { locale: string; rest: string } {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return { locale, rest: '/' };
    if (pathname.startsWith(`/${locale}/`)) return { locale, rest: pathname.slice(locale.length + 1) };
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

/**
 * Runs after next-intl's middleware has already resolved the locale prefix —
 * `response` carries that rewrite and must stay the response we return, so
 * Supabase cookie writes land on it rather than a fresh NextResponse.
 */
export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          } catch {
            // Response already sent — ignore (mirrors server-component usage).
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { locale, rest: pathname } = splitLocale(request.nextUrl.pathname);

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // Only block access to explicitly auth-required routes
  if (!user && requiresAuth(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Pass the locale-stripped pathname to Server Components so the app layout
  // can gate routes that require onboarding without an extra DB query.
  response.headers.set('x-invoke-path', pathname);

  return response;
}
