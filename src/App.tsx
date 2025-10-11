import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Article from "./pages/Article";
import AIDesignSprint from "./pages/AIDesignSprint";
import OnlineSprintLanding from "./pages/OnlineSprintLanding";
import ProblemFramingWorkshop from "./pages/ProblemFramingWorkshop";
import DesignSprintWorkshop from "./pages/DesignSprintWorkshop";
import AIConsultingServices from "./pages/AIConsultingServices";
import AboutUs from "./pages/AboutUs";
import DataQualityAudit from "./pages/DataQualityAudit";
import Auth from "./pages/Auth";
import PasswordReset from "./pages/PasswordReset";
import UpdatePassword from "./pages/UpdatePassword";
import AdminDashboard from "./pages/AdminDashboard";
import LMSCustomerDashboard from "./pages/admin/LMSCustomerDashboard";
import LMSParticipantDashboard from "./pages/admin/LMSParticipantDashboard";
import LMSCourseDashboard from "./pages/admin/LMSCourseDashboard";
import LMSPurchaseDashboard from "./pages/admin/LMSPurchaseDashboard";
import LMSEnrollmentDashboard from "./pages/admin/LMSEnrollmentDashboard";
import LMSIndex from "./pages/lms/LMSIndex";
import LMSCourseDetail from "./pages/lms/LMSCourseDetail";
import LMSDataExport from "./pages/lms/LMSDataExport";
import SprintSetup from "./pages/sprint/SprintSetup";
import SprintIndex from "./pages/sprint/SprintIndex";
import SprintSession from "./pages/sprint/SprintSession";
import SprintBooking from "./pages/sprint/SprintBooking";
import { SprintLayout } from "./layouts/SprintLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Article />} />
          <Route path="/ai-design-sprint" element={<AIDesignSprint />} />
          <Route path="/ai-design-sprint/online" element={<OnlineSprintLanding />} />
          <Route path="/problem-framing-workshop" element={<ProblemFramingWorkshop />} />
          <Route path="/design-sprint-workshop" element={<DesignSprintWorkshop />} />
          
          {/* Standalone Sprint Container */}
          <Route path="/sprint" element={<SprintLayout />}>
            <Route index element={<SprintIndex />} />
            <Route path="setup" element={<SprintSetup />} />
            <Route path="session" element={<SprintSession />} />
          </Route>
          
          {/* Standalone Assessment with main navigation */}
          <Route path="/sprint/assessment" element={<SprintBooking />} />
          
          <Route path="/ai-consulting-services" element={<AIConsultingServices />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/data-quality-audit" element={<DataQualityAudit />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/lms" element={<LMSCustomerDashboard />} />
          <Route path="/admin/lms/participants" element={<LMSParticipantDashboard />} />
          <Route path="/admin/lms/courses" element={<LMSCourseDashboard />} />
          <Route path="/admin/lms/purchases" element={<LMSPurchaseDashboard />} />
          <Route path="/admin/lms/enrollments" element={<LMSEnrollmentDashboard />} />
          <Route path="/lms" element={<LMSIndex />} />
          <Route path="/lms/enrollment/:enrollmentId" element={<LMSCourseDetail />} />
          <Route path="/lms/data-export" element={<LMSDataExport />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
