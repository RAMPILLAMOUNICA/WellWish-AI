import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Heart } from "lucide-react";

export default function ProtectedRoute({ children, publicOnly = false }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center text-charcoal-text font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-brand-sage/20 opacity-50 blur-sm animate-pulse" />
            <div className="relative bg-card-bg border border-neutral-border p-3 rounded-xl animate-spin">
              <Heart className="w-5 h-5 text-brand-teal fill-brand-teal/20" />
            </div>
          </div>
          <span className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase">Syncing Telemetry Vault...</span>
        </div>
      </div>
    );
  }

  // Redirect authenticated user away from public pages (like login/register) to dashboard
  if (publicOnly && token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect unauthenticated user to login
  if (!publicOnly && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
