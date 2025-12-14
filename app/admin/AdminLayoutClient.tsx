'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import ProfileMenu from '@/components/ui/profile-menu';
import {
  LayoutDashboard,
  MessageSquareQuote,
  Settings,
  Home,
  MessageSquare,
  Building2,
  Package,
  Zap,
  FileText,
  HelpCircle
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  // Check if user is admin, if not redirect
  useEffect(() => {
    // Log auth state for debugging
    console.log('🔐 AdminLayout auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      isAdmin,
      loading
    });

    if (!loading) {
      if (!user) {
        console.log('❌ No user found, redirecting to /admin-login');
        router.push('/admin-login');
      } else if (!isAdmin) {
        console.log('❌ User is not admin, redirecting to /');
        router.push('/');
      } else {
        console.log('✅ User is authenticated admin, showing panel');
      }
    }
  }, [user, isAdmin, loading, router]);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Projects', href: '/admin/projects', icon: Building2 },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Panel Presets', href: '/admin/panel-presets', icon: Zap },
    { name: 'Blogs', href: '/admin/blogs', icon: FileText },
    { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Back to Home', href: '/', icon: Home },
  ];

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render until auth is confirmed
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Fixed Sidebar - Desktop Only */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-16 md:left-0 md:bg-black/20 md:backdrop-blur-xl md:border-r md:border-white/10">
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-600/20 text-teal-400 border-l-2 border-teal-400'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content - Offset for sidebar */}
        <div className="w-full md:ml-64 p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
