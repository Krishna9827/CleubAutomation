import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/supabase/adminService';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, isAdmin, user, loading } = useAuth();

  // Check if user is already logged in and is an active admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (loading) {
          console.log('⏳ Waiting for auth context to load...');
          return;
        }

        if (!user) {
          console.log('ℹ️ User not logged in, showing login form');
          setIsCheckingAdmin(false);
          return;
        }

        // User is logged in, check if they're an active admin
        console.log('🔍 Checking admin status for:', user.email);
        const adminRecord = await adminService.getAdminByEmail(user.email!);
        
        if (adminRecord && adminRecord.is_active) {
          console.log('✅ User is an active admin, redirecting to /admin');
          navigate('/admin');
        } else {
          console.log('❌ User is not an active admin, showing login form');
          setIsCheckingAdmin(false);
        }
      } catch (error) {
        console.error('⚠️ Error checking admin status:', error);
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter email and password');
        setIsLoading(false);
        return;
      }

      console.log('🔐 Attempting admin login with email:', email);
      await signInWithEmail(email, password);
      
      // Check if the user is an admin after login
      console.log('🔍 Verifying admin status after login...');
      const adminRecord = await adminService.getAdminByEmail(email);
      
      if (!adminRecord || !adminRecord.is_active) {
        console.log('❌ User logged in but is not an active admin');
        setError('Your account is not authorized as an admin. Please contact the system administrator.');
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Admin verified, redirecting to admin panel');
      toast({
        title: 'Success',
        description: 'Welcome back, Admin!',
      });
      
      navigate('/admin');
      setIsLoading(false);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      setError(error.message || 'Invalid email or password');
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  if (loading || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <Card className="w-full max-w-md border-white/10 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg text-white">Admin Login</CardTitle>
          <p className="text-sm text-slate-400 mt-2">Sign in with your Supabase credentials</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="text-slate-300">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoFocus
                required
                disabled={isLoading}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="admin-password" className="text-slate-300">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">{error}</div>}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-xs text-slate-400 mt-4 text-center">
            You must be registered as an admin in the system to access this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
