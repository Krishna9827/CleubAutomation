
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PremiumLanding from "./pages/PremiumLanding";
import ProjectPlanning from "./pages/ProjectPlanning";
import Inquiry from "./pages/Inquiry";
import Login from "./pages/Login";
import UserHistory from "./pages/UserHistory";
import AdminProjectHistory from "./pages/AdminProjectHistory";
import Planner from "./pages/Planner";
import AdminSettings from "./pages/AdminSettings";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import RequirementSheet2 from "./pages/RequirementSheet2";
import RoomSelection from "./pages/RoomSelection";
import FinalReview from "./pages/FinalReview";
import AdminTestimonials from "./pages/AdminTestimonials";

const queryClient = new QueryClient();


// Wrapper to protect admin routes
const ProtectedAdmin = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';
  if (!isAdmin) {
    window.location.replace('/admin-login');
    return null;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PremiumLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/inquiry" element={<Inquiry />} />
            <Route path="/project-planning" element={<ProjectPlanning />} />
            <Route path="/room-selection" element={<RoomSelection />} />
            <Route path="/requirements" element={<RequirementSheet2 />} />
            <Route path="/final-review" element={<FinalReview />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/my-projects" element={<UserHistory />} />
            <Route path="/admin" element={<ProtectedAdmin><AdminSettings /></ProtectedAdmin>} />
            <Route path="/admin/testimonials" element={<ProtectedAdmin><AdminTestimonials /></ProtectedAdmin>} />
            <Route path="/admin/projects" element={<ProtectedAdmin><AdminProjectHistory /></ProtectedAdmin>} />
            <Route path="/admin-login" element={<AdminLogin />} />
            {/* Legacy routes for backward compatibility */}
            <Route path="/intake" element={<ProjectPlanning />} />
            <Route path="/premium" element={<PremiumLanding />} />
            <Route path="/requirements-v2" element={<RequirementSheet2 />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
  </QueryClientProvider>
);

export default App;
