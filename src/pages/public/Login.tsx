import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Phone, MapPin, Calendar } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, signInWithGoogle, signUpWithEmail } = useAuth();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    postalCode: '',
    area: '',
    city: '',
    state: '',
    houseNumber: '',
  });
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: 'Error',
        description: 'Please enter email and password',
        variant: 'destructive',
      });
      return;
    }

    setLoginLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Note: Google OAuth will redirect. No need for navigate() here
      // The redirect will happen, and auth state will update automatically
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!signupData.firstName || !signupData.lastName) {
      toast({
        title: 'Error',
        description: 'First name and last name are required',
        variant: 'destructive',
      });
      return;
    }

    if (!signupData.email) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email.trim())) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address (e.g., example@domain.com)',
        variant: 'destructive',
      });
      return;
    }

    if (signupData.phoneNumber.length !== 10 || !/^\d{10}$/.test(signupData.phoneNumber)) {
      toast({
        title: 'Error',
        description: 'Phone number must be 10 digits',
        variant: 'destructive',
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (!signupData.houseNumber) {
      toast({
        title: 'Error',
        description: 'House number is required',
        variant: 'destructive',
      });
      return;
    }

    setSignupLoading(true);
    try {
      console.log('📝 Attempting signup with email:', signupData.email);
      await signUpWithEmail(signupData.email, signupData.password, {
        first_name: signupData.firstName,
        last_name: signupData.lastName,
        phone_number: signupData.phoneNumber,
        date_of_birth: signupData.dateOfBirth,
        house_number: signupData.houseNumber,
        area: signupData.area,
        city: signupData.city,
        state: signupData.state,
        postal_code: signupData.postalCode,
      });
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
      navigate('/');
    } catch (error: any) {
      console.error('🔴 Signup failed:', error);
      const errorMessage = error.message || 'An error occurred during signup';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSignupLoading(false);
    }
  };

  const getStateAndCity = async (postalCode: string) => {
    if (postalCode.length === 6) {
      try {
        // Using a free postal code API - you can replace with your preferred service
        const response = await fetch(
          `https://api.postalpincode.in/postoffice/${postalCode}`
        );
        const data = await response.json();
        if (data && data[0] && data[0].PostOffice) {
          const office = data[0].PostOffice[0];
          setSignupData(prev => ({
            ...prev,
            state: office.State || '',
            city: office.District || '',
            area: office.Name || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching postal code data:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white text-center">
            Cleub Automation
          </CardTitle>
          <p className="text-slate-400 text-center text-sm">Smart Home Planning Platform</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="login" className="text-white">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-white">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-900 text-slate-400 px-2">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="w-5 h-5 mr-2" />
                Google
              </Button>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4 mt-4 max-h-[600px] overflow-y-auto">
              <form onSubmit={handleSignup} className="space-y-3">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-white text-sm">First Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        className="pl-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName" className="text-white text-sm">Last Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        className="pl-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="signup-email" className="text-white text-sm">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-white text-sm">Phone Number (10 digits) *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      value={signupData.phoneNumber}
                      onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })}
                      className="pl-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <Label htmlFor="dob" className="text-white text-sm">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                    <Input
                      id="dob"
                      type="date"
                      value={signupData.dateOfBirth}
                      onChange={(e) => setSignupData({ ...signupData, dateOfBirth: e.target.value })}
                      className="pl-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <div className="space-y-1">
                  <Label htmlFor="postalCode" className="text-white text-sm">Postal Code</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      value={signupData.postalCode}
                      onChange={(e) => {
                        setSignupData({ ...signupData, postalCode: e.target.value });
                        getStateAndCity(e.target.value);
                      }}
                      className="pl-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <p className="text-xs text-slate-400">Enter 6-digit postal code for auto-fill</p>
                </div>

                {/* State and City (Auto-filled) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="state" className="text-white text-sm">State</Label>
                    <Input
                      id="state"
                      placeholder="Auto-filled"
                      value={signupData.state}
                      onChange={(e) => setSignupData({ ...signupData, state: e.target.value })}
                      className="text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="city" className="text-white text-sm">City</Label>
                    <Input
                      id="city"
                      placeholder="Auto-filled"
                      value={signupData.city}
                      onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                      className="text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Area */}
                <div className="space-y-1">
                  <Label htmlFor="area" className="text-white text-sm">Area</Label>
                  <Input
                    id="area"
                    placeholder="Auto-filled from postal code"
                    value={signupData.area}
                    onChange={(e) => setSignupData({ ...signupData, area: e.target.value })}
                    className="text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* House Number */}
                <div className="space-y-1">
                  <Label htmlFor="houseNumber" className="text-white text-sm">House Number *</Label>
                  <Input
                    id="houseNumber"
                    placeholder="123, Main Street"
                    value={signupData.houseNumber}
                    onChange={(e) => setSignupData({ ...signupData, houseNumber: e.target.value })}
                    className="text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Password Fields */}
                <div className="space-y-1">
                  <Label htmlFor="signup-password" className="text-white text-sm">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pl-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirm-password" className="text-white text-sm">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="pl-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 mt-4"
                  disabled={signupLoading}
                >
                  {signupLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>

                <p className="text-xs text-slate-400 text-center">
                  * Required fields. Passwords are encrypted for security.
                </p>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-900 text-slate-400 px-2">Or sign up with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="w-5 h-5 mr-2" />
                Google
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
