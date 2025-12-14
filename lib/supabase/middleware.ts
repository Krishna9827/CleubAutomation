import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Debug: log the session check
  if (pathname.startsWith('/admin')) {
    console.log('🔐 Middleware auth check for /admin:', {
      hasUser: !!user,
      userEmail: user?.email,
      pathname
    });
  }

  // Define protected routes
  const protectedRoutes = [
    '/project-planning',
    '/room-selection',
    '/requirements',
    '/final-review',
    '/planner',
    '/my-projects',
  ];

  const adminRoutes = [
    '/admin',
    '/admin/settings',
    '/admin/panel-presets',
    '/admin/inquiries',
    '/admin/projects',
    '/admin/inventory',
    '/admin/testimonials',
    '/admin/blogs',
    '/admin/faqs',
    '/admin-login',
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(url);
  }

  // NOTE: Admin route protection is handled by AdminLayoutClient component
  // Don't redirect in middleware to avoid session sync issues
  // The component will handle redirects after auth context is loaded
  
  return supabaseResponse;
}
