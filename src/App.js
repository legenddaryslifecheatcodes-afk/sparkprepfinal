import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Pricing from "@/pages/Pricing";
import SpecLibrary from "@/pages/SpecLibrary";
import AuditLanding from "@/pages/AuditLanding";
import AuditPreview from "@/pages/AuditPreview";
import AuditReport from "@/pages/AuditReport";
import Dashboard from "@/pages/Dashboard";
import Editor from "@/pages/Editor";
import Account from "@/pages/Account";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import BetaRedeem from "@/pages/BetaRedeem";
import BetaFeedback from "@/pages/BetaFeedback";
import AdminBeta from "@/pages/AdminBeta";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-sm font-mono-spec text-neutral-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-sm font-mono-spec text-neutral-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}

function CrashFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="font-display font-black text-xl mb-2">Something went wrong.</div>
        <p className="text-sm text-neutral-400 mb-6">
          This page hit an unexpected error. Your work is saved -- reloading should fix it.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-gold px-6 py-3 font-mono-spec text-xs tracking-widest uppercase btn-industrial"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallback={<CrashFallback />}>
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/specs" element={<SpecLibrary />} />
          <Route path="/audit" element={<AuditLanding />} />
          <Route path="/audit/:id/preview" element={<AuditPreview />} />
          <Route path="/audit/:id/report" element={<AuditReport />} />
          <Route path="/beta/redeem" element={<BetaRedeem />} />
          <Route path="/beta/feedback" element={<Protected><BetaFeedback /></Protected>} />
          <Route path="/admin/beta" element={<AdminOnly><AdminBeta /></AdminOnly>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/editor/:id" element={<Protected><Editor /></Protected>} />
          <Route path="/account" element={<Protected><Account /></Protected>} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
