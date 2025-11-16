import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, Shield, Loader } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const ProfileMenu = () => {
  const { user, userProfile, isAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user || loading) return null;

  // Memoize initials to prevent unnecessary recalculations
  const initials = useMemo(() => {
    return (
      (userProfile?.first_name?.[0] || '') +
      (userProfile?.last_name?.[0] || '')
    ).toUpperCase() || 'U';
  }, [userProfile?.first_name, userProfile?.last_name]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Navigate first, then logout (prevents component unmount mid-execution)
      navigate('/');
      await logout();
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 transition-colors cursor-pointer">
            <Avatar className="w-10 h-10">
              <AvatarImage src="" alt={userProfile?.first_name || 'User'} />
              <AvatarFallback className="bg-teal-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
          <DropdownMenuLabel className="text-white">
            <div className="font-semibold">
              {userProfile?.first_name || 'User'} {userProfile?.last_name || ''}
            </div>
            <div className="text-xs text-slate-400">{user.email}</div>
            {isAdmin && <div className="text-xs text-amber-400 mt-1">🔐 Admin User</div>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem
            onClick={() => setShowProfileDialog(true)}
            className="text-slate-200 cursor-pointer focus:bg-slate-800 focus:text-white"
          >
            <User className="w-4 h-4 mr-2" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate('/profile-settings')}
            className="text-slate-200 cursor-pointer focus:bg-slate-800 focus:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={() => navigate('/admin')}
                className="text-amber-400 cursor-pointer focus:bg-amber-900/30 focus:text-amber-400"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-400 cursor-pointer focus:bg-red-900/20 focus:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Your Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="" alt={userProfile?.first_name || 'User'} />
                <AvatarFallback className="bg-teal-600 text-white text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-lg">
                  {userProfile?.first_name || 'User'} {userProfile?.last_name || ''}
                </div>
                <div className="text-sm text-slate-400">{user.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
              {userProfile?.phone_number && (
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Phone</div>
                  <div className="text-sm text-slate-200">{userProfile.phone_number}</div>
                </div>
              )}
              {userProfile?.date_of_birth && (
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">DOB</div>
                  <div className="text-sm text-slate-200">{userProfile.date_of_birth}</div>
                </div>
              )}
              {userProfile?.city && (
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">City</div>
                  <div className="text-sm text-slate-200">{userProfile.city}</div>
                </div>
              )}
              {userProfile?.state && (
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">State</div>
                  <div className="text-sm text-slate-200">{userProfile.state}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowProfileDialog(false);
                navigate('/profile-settings');
              }}
              className="w-full mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileMenu;
