import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Article from "./pages/Article";
import AIDesignSprint from "./pages/AIDesignSprint";
import OnlineSprintLanding from "./pages/OnlineSprintLanding";
import ProblemFramingWorkshop from "./pages/ProblemFramingWorkshop";
import DesignSprintWorkshop from "./pages/DesignSprintWorkshop";
import AIConsultingServices from "./pages/AIConsultingServices";
import CustomAIDevelopment from "./pages/CustomAIDevelopment";
import AboutUs from "./pages/AboutUs";
import DataQualityAudit from "./pages/DataQualityAudit";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import PasswordReset from "./pages/PasswordReset";
import UpdatePassword from "./pages/UpdatePassword";
import AdminDashboard from "./pages/AdminDashboard";
import LMSCustomerDashboard from "./pages/admin/LMSCustomerDashboard";
import LMSCustomerDetail from "./pages/admin/LMSCustomerDetail";
import LMSParticipantDashboard from "./pages/admin/LMSParticipantDashboard";
import LMSCourseDashboard from "./pages/admin/LMSCourseDashboard";
import LMSPurchaseDashboard from "./pages/admin/LMSPurchaseDashboard";
import LMSEnrollmentDashboard from "./pages/admin/LMSEnrollmentDashboard";
import LMSIndex from "./pages/lms/LMSIndex";
import LMSCourseDetail from "./pages/lms/LMSCourseDetail";
import LMSDataExport from "./pages/lms/LMSDataExport";
import LMSDashboard from "./pages/lms/LMSDashboard";
import DeleteAccountPage from "./pages/lms/DeleteAccountPage";
import LMSAnalytics from "./pages/admin/LMSAnalytics";
import LMSModuleDashboard from "./pages/admin/LMSModuleDashboard";
import LMSModuleEditor from "./pages/admin/LMSModuleEditor";
import LMSModulePreview from "./pages/admin/LMSModulePreview";
import LMSToolboxDashboard from "./pages/admin/LMSToolboxDashboard";
import LMSToolboxEditor from "./pages/admin/LMSToolboxEditor";
import LMSCoursePreview from "./pages/lms/LMSCoursePreview";
import LMSHMWTool from "./pages/lms/LMSHMWTool";
import LMSSmartSailboat from "./pages/lms/LMSSmartSailboat";
import LMSPurchaseConfirmation from "./pages/lms/LMSPurchaseConfirmation";
import VoiceBot from "./pages/VoiceBot";
import NotFound from "./pages/NotFound";
import BMADSessionDashboard from "./pages/admin/BMADSessionDashboard";
import BMADArtifactDashboard from "./pages/admin/BMADArtifactDashboard";
import BMADAnalytics from "./pages/admin/BMADAnalytics";
import BMADSessionDetail from "./pages/admin/BMADSessionDetail";
import BMADLogin from "./pages/bmad/BMADLogin";
import BMADAcceptInvitation from "./pages/bmad/BMADAcceptInvitation";
import BMADDashboard from "./pages/bmad/BMADDashboard";

import WorkshopRegistration from "./pages/WorkshopRegistration";
import UserProfile from "./pages/UserProfile";
import CompanyProfile from "./pages/CompanyProfile";
import AcceptInvitation from "./pages/AcceptInvitation";
import AcceptEnrollmentInvitation from "./pages/lms/AcceptEnrollmentInvitation";
import Contact from "./pages/Contact";
import Analysis from "./pages/Analysis";
import Impressum from "./pages/Impressum";
import DynamicPage from "./pages/DynamicPage";
import Kurse from "./pages/Kurse";
import PublicCourseDashboard from "./pages/admin/PublicCourseDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Article />} />
        <Route path="/sprint-uebersicht" element={<AIDesignSprint />} />
        <Route path="/sprint-uebersicht/online" element={<OnlineSprintLanding />} />
        {/* Redirects for old URLs */}
        <Route path="/ai-design-sprint" element={<Navigate to="/sprint-uebersicht" replace />} />
        <Route path="/ai-design-sprint/online" element={<Navigate to="/sprint-uebersicht/online" replace />} />
          <Route path="/problem-framing-workshop" element={<ProblemFramingWorkshop />} />
          <Route path="/design-sprint-workshop" element={<DesignSprintWorkshop />} />
          <Route path="/workshop-registration" element={<WorkshopRegistration />} />
          
          <Route path="/ai-consulting-services" element={<AIConsultingServices />} />
          <Route path="/custom-ai-development" element={<CustomAIDevelopment />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/data-quality-audit" element={<DataQualityAudit />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/lms" element={<LMSCustomerDashboard />} />
          <Route path="/admin/customers" element={<LMSCustomerDashboard />} />
          <Route path="/admin/customers/:customerId" element={<LMSCustomerDetail />} />
          <Route path="/admin/lms/participants" element={<LMSParticipantDashboard />} />
          <Route path="/admin/lms/courses" element={<LMSCourseDashboard />} />
          <Route path="/admin/lms/purchases" element={<LMSPurchaseDashboard />} />
          <Route path="/admin/lms/enrollments" element={<LMSEnrollmentDashboard />} />
          <Route path="/admin/lms/analytics" element={<LMSAnalytics />} />
          <Route path="/admin/lms/modules" element={<LMSModuleDashboard />} />
          <Route path="/admin/lms/modules/new" element={<LMSModuleEditor />} />
          <Route path="/admin/lms/modules/:moduleId/edit" element={<LMSModuleEditor />} />
          <Route path="/admin/lms/modules/:moduleId/preview" element={<LMSModulePreview />} />
          <Route path="/admin/lms/toolbox" element={<LMSToolboxDashboard />} />
          <Route path="/admin/lms/toolbox/new" element={<LMSToolboxEditor />} />
          <Route path="/admin/lms/toolbox/:toolId" element={<LMSToolboxEditor />} />
            <Route path="/admin/bmad/sessions" element={<BMADSessionDashboard />} />
            <Route path="/admin/bmad/session/:sessionId" element={<BMADSessionDetail />} />
            <Route path="/admin/bmad/artifacts" element={<BMADArtifactDashboard />} />
            <Route path="/admin/bmad/analytics" element={<BMADAnalytics />} />
          {/* BMAD User Routes */}
          <Route path="/bmad/login" element={<BMADLogin />} />
          <Route path="/bmad/accept-invitation" element={<BMADAcceptInvitation />} />
          <Route path="/bmad" element={<BMADDashboard />} />
          <Route path="/bmad/session/:sessionId" element={<BMADSessionDetail />} />
          <Route path="/lms/courses/:courseId/preview" element={<LMSCoursePreview />} />
          <Route path="/lms/tools/hmw" element={<LMSHMWTool />} />
          <Route path="/lms/tools/hmw-generator" element={<Navigate to="/lms/tools/hmw" replace />} />
          <Route path="/lms/tools/hmw-clustering" element={<Navigate to="/lms/tools/hmw" replace />} />
          <Route path="/lms/tools/smart-sailboat" element={<LMSSmartSailboat />} />
          <Route path="/lms" element={<LMSIndex />} />
          <Route path="/lms/dashboard" element={<LMSDashboard />} />
          <Route path="/lms/enrollment/:enrollmentId" element={<LMSCourseDetail />} />
          <Route path="/lms/purchase-confirmation" element={<LMSPurchaseConfirmation />} />
          <Route path="/lms/data-export" element={<LMSDataExport />} />
          <Route path="/lms/account/delete" element={<DeleteAccountPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
           <Route path="/accept-invitation" element={<AcceptInvitation />} />
           <Route path="/accept-enrollment-invitation" element={<AcceptEnrollmentInvitation />} />
           <Route path="/voice-bot" element={<VoiceBot />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/analyse" element={<Analysis />} />
          <Route path="/impressum" element={<Impressum />} />
          {/* Dynamic page template routes */}
          <Route path="/:slug" element={<DynamicPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
