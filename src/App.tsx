
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Planner from "./pages/Planner";
import AdminSettings from "./pages/AdminSettings";
import AdminLogin from "./pages/AdminLogin";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import RequirementSheet2 from "./pages/RequirementSheet2";
import PremiumLanding from "./pages/PremiumLanding";
import RoomSelection from "./pages/RoomSelection";
import FinalReview from "./pages/FinalReview";

const queryClient = new QueryClient();


// Wrapper to protect admin route
const ProtectedAdmin = () => {
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';
  if (!isAdmin) {
    window.location.replace('/admin-login');
    return null;
  }
  return <AdminSettings />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PremiumLanding />} />
          <Route path="/room-selection" element={<RoomSelection />} />
          <Route path="/intake" element={<Index />} />
          <Route path="/requirements" element={<RequirementSheet2 />} />
          <Route path="/premium" element={<PremiumLanding />} />
          <Route path="/requirements-v2" element={<RequirementSheet2 />} />
          <Route path="/final-review" element={<FinalReview />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/admin" element={<ProtectedAdmin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/history" element={<History />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
