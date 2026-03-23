import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser();

  // Basic route protection: redirect unauthenticated users away from /dashboard to /login
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from /login to /dashboard
  if (
    user &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Subscription & Status Check
  if (user && request.nextUrl.pathname.startsWith('/dashboard') && !request.nextUrl.pathname.startsWith('/dashboard/billing')) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, tenants(status, expiry_date)')
      .eq('id', user.id)
      .single();

    const tenant = profile?.tenants as any;
    if (profile && tenant && profile.role !== 'superadmin') {
      const isExpired = tenant.status === 'EXPIRED' || (tenant.expiry_date && new Date(tenant.expiry_date) < new Date());
      if (isExpired || tenant.status === 'LOCKED') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard/billing';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
