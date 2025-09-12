import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AssessmentProvider } from "@/contexts/assessment-context";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AssessmentChat from "./pages/AssessmentChat";
import SupplementaryQuestions from "./pages/SupplementaryQuestions"; // ایمپورت جدید
import Transition from "./pages/Transition";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NewQuestionnaire from "./pages/admin/NewQuestionnaire";
import AdminReports from "./pages/admin/AdminReports";
import AdminReportDetail from "./pages/admin/AdminReportDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AssessmentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessment/:stringId" element={<AssessmentChat />} />
            <Route path="/supplementary/:assessmentId" element={<SupplementaryQuestions />} /> {/* مسیر جدید */}
            <Route path="/transition/:stringId" element={<Transition />} />
            <Route path="/results" element={<Results />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/questionnaires/new" element={<NewQuestionnaire />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/reports/:id" element={<AdminReportDetail />} />

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AssessmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;