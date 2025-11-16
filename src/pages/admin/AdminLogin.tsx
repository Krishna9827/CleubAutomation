import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, isAdmin, user, loading } = useAuth();

  // If already logged in as admin, redirect to admin panel
  useEffect(() => {
    if (!loading && user && isAdmin) {
      console.log('✅ User is already logged in as admin, redirecting to /admin');
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  // If not admin but logged in, redirect to login
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      console.log('⚠️ User is logged in but not an admin');
      navigate('/admin-login');
    }
  }, [user, isAdmin, loading, navigate]);

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
      
      // Wait for auth context to update
      toast({
        title: 'Success',
        description: 'Logging in...',
      });
      
      // The AuthContext will handle admin check and redirect
      // Give it a moment to process
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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

  if (loading) {
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
