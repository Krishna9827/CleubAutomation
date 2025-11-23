import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  FileText
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Projects', href: '/admin/projects', icon: Building2 },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Back to Home', href: '/', icon: Home },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Top Navigation - Clean */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            {user && !loading && <ProfileMenu />}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Fixed Sidebar - Desktop Only */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-16 md:left-0 md:bg-black/20 md:backdrop-blur-xl md:border-r md:border-white/10">
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
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
};

export default AdminLayout;