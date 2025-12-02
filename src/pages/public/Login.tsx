import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Phone, MapPin, Calendar } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const luxuryEasing = [0.22, 1, 0.36, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: luxuryEasing }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, signInWithGoogle, signUpWithEmail, user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

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
      navigate('/', { replace: true });
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
      navigate('/', { replace: true });
    } catch (error: any) {
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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      {/* Fixed Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 w-full z-50 mix-blend-difference px-8 lg:px-16 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: luxuryEasing }}
      >
        <div className="flex justify-between items-center">
          <motion.h1 
            className="font-serif text-2xl text-[#F5F5F3]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: luxuryEasing }}
          >
            Cleub
          </motion.h1>
          <motion.p 
            className="text-[10px] tracking-[0.35em] uppercase text-[#F5F5F3]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: luxuryEasing }}
          >
            Authentication
          </motion.p>
        </div>
      </motion.nav>

      <motion.div 
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-[#1A1A1A] rounded-none p-0 h-auto gap-0">
              <TabsTrigger 
                value="login" 
                className="text-[#F5F5F3] rounded-none border-b-2 border-transparent hover:bg-[#F5F5F3] hover:text-[#0A0A0A] data-[state=active]:bg-[#F5F5F3] data-[state=active]:text-[#0A0A0A] pb-4 text-xs tracking-[0.25em] uppercase transition-all duration-500"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="text-[#F5F5F3] rounded-none border-b-2 border-transparent hover:bg-[#F5F5F3] hover:text-[#0A0A0A] data-[state=active]:bg-[#F5F5F3] data-[state=active]:text-[#0A0A0A] pb-4 text-xs tracking-[0.25em] uppercase transition-all duration-500"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-8 mt-12">
              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="login-email" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="login-password" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full px-12 py-4 rounded-full border-2 border-[#F5F5F3] text-[#F5F5F3] text-xs tracking-[0.2em] uppercase hover:bg-[#F5F5F3] hover:text-[#0A0A0A] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(245,245,243,0.2)]"
                  whileHover={{ scale: loginLoading ? 1 : 1.02 }}
                  whileTap={{ scale: loginLoading ? 1 : 0.98 }}
                >
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1A1A1A]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0A0A0A] text-[8px] tracking-[0.35em] text-[#F5F5F3]/30 uppercase px-4">Or continue with</span>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full px-12 py-4 rounded-full border border-[#F5F5F3]/20 text-[#F5F5F3] text-xs tracking-[0.2em] uppercase hover:border-[#F5F5F3]/40 transition-all duration-500 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FcGoogle className="w-5 h-5" />
                Google
              </motion.button>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-6 mt-12 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1A1A1A] scrollbar-track-transparent">
              <form onSubmit={handleSignup} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">Phone (10 digits) *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={signupData.phoneNumber}
                    onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-3">
                  <Label htmlFor="dob" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={signupData.dateOfBirth}
                    onChange={(e) => setSignupData({ ...signupData, dateOfBirth: e.target.value })}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>

                {/* Address Fields */}
                <div className="space-y-3">
                  <Label htmlFor="postalCode" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">Postal Code</Label>
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
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                  <p className="text-[8px] tracking-[0.3em] uppercase text-[#F5F5F3]/30 mt-2">6-digit code for auto-fill</p>
                </div>

                {/* State and City (Auto-filled) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="state" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">State</Label>
                    <Input
                      id="state"
                      placeholder="Auto-filled"
                      value={signupData.state}
                      onChange={(e) => setSignupData({ ...signupData, state: e.target.value })}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">City</Label>
                    <Input
                      id="city"
                      placeholder="Auto-filled"
                      value={signupData.city}
                      onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                    />
                  </div>
                </div>

                {/* Area */}
                <div className="space-y-3">
                  <Label htmlFor="area" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">Area</Label>
                  <Input
                    id="area"
                    placeholder="Auto-filled from postal code"
                    value={signupData.area}
                    onChange={(e) => setSignupData({ ...signupData, area: e.target.value })}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>

                {/* House Number */}
                <div className="space-y-3">
                  <Label htmlFor="houseNumber" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">House Number *</Label>
                  <Input
                    id="houseNumber"
                    placeholder="123, Main Street"
                    value={signupData.houseNumber}
                    onChange={(e) => setSignupData({ ...signupData, houseNumber: e.target.value })}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>

                {/* Password Fields */}
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">Password *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirm-password" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">Confirm Password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full px-12 py-4 rounded-full border-2 border-[#F5F5F3] text-[#F5F5F3] text-xs tracking-[0.2em] uppercase hover:bg-[#F5F5F3] hover:text-[#0A0A0A] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(245,245,243,0.2)] mt-8"
                  whileHover={{ scale: signupLoading ? 1 : 1.02 }}
                  whileTap={{ scale: signupLoading ? 1 : 0.98 }}
                >
                  {signupLoading ? 'Creating Account...' : 'Sign Up'}
                </motion.button>

                <p className="text-[8px] tracking-[0.3em] uppercase text-[#F5F5F3]/30 text-center mt-6">
                  * Required fields. Encrypted for security.
                </p>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1A1A1A]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0A0A0A] text-[8px] tracking-[0.35em] text-[#F5F5F3]/30 uppercase px-4">Or sign up with</span>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full px-12 py-4 rounded-full border border-[#F5F5F3]/20 text-[#F5F5F3] text-xs tracking-[0.2em] uppercase hover:border-[#F5F5F3]/40 transition-all duration-500 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FcGoogle className="w-5 h-5" />
                Google
              </motion.button>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
