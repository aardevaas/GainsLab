import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

// Routes anyone can visit without an account
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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Only block access to explicitly auth-required routes
  if (!user && requiresAuth(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
