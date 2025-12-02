
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
// Public pages
import PremiumLanding from "./pages/public/PremiumLanding"
import Login from "./pages/public/Login"
import Inquiry from "./pages/public/Inquiry"
import NotFound from "./pages/public/NotFound"
import AboutUs from "./pages/public/AboutUs"
import PrivacyPolicy from "./pages/public/PrivacyPolicy"
import CookiePolicy from "./pages/public/CookiePolicy"
import TermsAndConditions from "./pages/public/TermsAndConditions"
// User pages
import HomePage from "./pages/user/HomePage"
import ProjectPlanning from "./pages/user/ProjectPlanning"
import RoomSelection from "./pages/user/RoomSelection"
import RequirementsForm from "./pages/user/RequirementsForm"
import FinalReview from "./pages/user/FinalReview"
import Planner from "./pages/user/Planner"
import UserHistory from "./pages/user/ProjectHistory"
// Admin pages
import AdminLogin from "./pages/admin/AdminLogin"
import AdminSettings from "./pages/admin/AdminSettings"
import AdminPanelPresets from "./pages/admin/AdminPanelPresets"
import AdminTestimonials from "./pages/admin/AdminTestimonials"
import AdminInquiries from "./pages/admin/AdminInquiries"
import AdminProjects from "./pages/admin/AdminProjects"
import AdminInventory from "./pages/admin/AdminInventory"
import AdminProjectTimeline from "./pages/admin/AdminProjectTimeline"
import AdminBOQGeneration from "./pages/admin/AdminBOQGeneration"

const queryClient = new QueryClient();


// Wrapper to protect admin routes
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate('/admin-login', { replace: true });
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
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/project-planning" element={<ProjectPlanning />} />
            <Route path="/room-selection" element={<RoomSelection />} />
            <Route path="/requirements" element={<RequirementsForm />} />
            <Route path="/final-review" element={<FinalReview />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/my-projects" element={<UserHistory />} />
            <Route path="/admin" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
            <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
            <Route path="/admin/panel-presets" element={<ProtectedAdminRoute><AdminPanelPresets /></ProtectedAdminRoute>} />
            <Route path="/admin/inquiries" element={<ProtectedAdminRoute><AdminInquiries /></ProtectedAdminRoute>} />
            <Route path="/admin/projects" element={<ProtectedAdminRoute><AdminProjects /></ProtectedAdminRoute>} />
            <Route path="/admin/projects/:projectId/timeline" element={<ProtectedAdminRoute><AdminProjectTimeline /></ProtectedAdminRoute>} />
            <Route path="/admin/projects/:projectId/boq" element={<ProtectedAdminRoute><AdminBOQGeneration /></ProtectedAdminRoute>} />
            <Route path="/admin/inventory" element={<ProtectedAdminRoute><AdminInventory /></ProtectedAdminRoute>} />
            <Route path="/admin/testimonials" element={<ProtectedAdminRoute><AdminTestimonials /></ProtectedAdminRoute>} />
            <Route path="/admin-login" element={<AdminLogin />} />
            {/* Legacy routes for backward compatibility */}
            <Route path="/intake" element={<ProjectPlanning />} />
            <Route path="/premium" element={<PremiumLanding />} />
            <Route path="/requirements-v2" element={<RequirementsForm />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
  </QueryClientProvider>
);

export default App;
