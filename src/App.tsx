import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Article from "./pages/Article";
import AIDesignSprint from "./pages/AIDesignSprint";
import OnlineSprintLanding from "./pages/OnlineSprintLanding";
import AIConsultingServices from "./pages/AIConsultingServices";
import AboutUs from "./pages/AboutUs";
import DataQualityAudit from "./pages/DataQualityAudit";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import OnlineDesignSprint from "./pages/OnlineDesignSprint";
import SprintSetup from "./pages/sprint/SprintSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Article />} />
          <Route path="/ai-design-sprint" element={<AIDesignSprint />} />
          <Route path="/ai-design-sprint/online" element={<OnlineSprintLanding />} />
          <Route path="/ai-design-sprint/setup" element={<SprintSetup />} />
          <Route path="/ai-design-sprint/sprint" element={<OnlineDesignSprint />} />
          <Route path="/ai-consulting-services" element={<AIConsultingServices />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/data-quality-audit" element={<DataQualityAudit />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
