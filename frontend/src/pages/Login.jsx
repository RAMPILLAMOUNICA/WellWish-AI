import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const { login, loading, error, clearError } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear errors when mounting the component
  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!validateForm()) {
      addToast("Please correct the validation errors.", "error");
      return;
    }
    try {
      const success = await login(email, password);
      if (success) {
        addToast("Welcome back to your wellbeing companion.", "success");
        navigate("/dashboard");
      }
    } catch (err) {
      let errorMsg = "Failed to log in. Please verify your credentials.";
      if (!navigator.onLine) {
        errorMsg = "Unable to connect to the server. Please check your internet connection.";
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMsg = "Request timed out. Please try again.";
      } else if (err.response) {
        if (err.response.status === 401 || err.response.status === 400) {
          errorMsg = "Invalid email or password.";
        } else if (err.response.status >= 500) {
          errorMsg = "Server error. Please try again in a few moments.";
        }
      }
      setLocalError(errorMsg);
      addToast(errorMsg, "error");
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center relative px-6 overflow-hidden grid-bg text-charcoal-text font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-sage/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Back button */}
      <Link
        to="/"
        className="absolute top-6 left-6 text-sm font-semibold text-charcoal-light hover:text-charcoal-text flex items-center gap-2 px-4 py-2 rounded-full bg-card-bg border border-neutral-border hover:bg-warm-bg/50 transition-all shadow-xs"
      >
        <ArrowLeft className="w-4 h-4 text-charcoal-light" />
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-4 mb-8 text-center animate-fade-in">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-sage/20 p-2 rounded-full border border-brand-sage/35 shadow-xs">
              <Heart className="w-5 h-5 text-brand-teal fill-brand-teal/20" />
            </div>
          </Link>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-charcoal-text">Welcome Back</h2>
            <p className="text-xs text-charcoal-light mt-1">Access your personal wellbeing dashboard</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="p-[1px] rounded-[32px] bg-neutral-border shadow-sm">
          <div className="bg-card-bg rounded-[31px] p-8 flex flex-col gap-6 border border-neutral-border">
            
            {/* Error Message Alert */}
            {(localError || error) && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl flex gap-2.5 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setLocalError("OAuth integrations require companion app sync.");
                  addToast("Please connect via local health tokens.", "info");
                }}
                className="py-2.5 rounded-full border border-neutral-border bg-warm-bg/50 hover:bg-warm-bg text-xs font-bold text-charcoal-light hover:text-charcoal-text transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#8FD3D1"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#A8D5BA"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalError("OAuth integrations require companion app sync.");
                  addToast("Please connect via local health tokens.", "info");
                }}
                className="py-2.5 rounded-full border border-neutral-border bg-warm-bg/50 hover:bg-warm-bg text-xs font-bold text-charcoal-light hover:text-charcoal-text transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.72-1.16 1.87-1.01 2.98 1.1.09 2.24-.57 2.96-1.42z"/>
                </svg>
                <span>Apple ID</span>
              </button>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <span className="h-px bg-neutral-border flex-1" />
              <span className="text-[10px] text-charcoal-light font-mono">OR EMAIL</span>
              <span className="h-px bg-neutral-border flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-charcoal-light tracking-wide">EMAIL ADDRESS</label>
                <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all">
                  <div className="flex bg-warm-bg rounded-[11px] px-3 items-center">
                    <Mail className="w-4 h-4 text-charcoal-light mr-2 shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validationErrors.email) {
                          setValidationErrors(prev => ({ ...prev, email: "" }));
                        }
                      }}
                      className="w-full py-3 bg-transparent text-charcoal-text text-xs outline-none border-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
                {validationErrors.email && (
                  <span className="text-[10px] text-rose-600 font-medium px-1 animate-fade-in">{validationErrors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-charcoal-light tracking-wide">PASSWORD</label>
                  <a href="#" className="text-[10px] font-semibold text-brand-teal hover:underline">Forgot?</a>
                </div>
                <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all">
                  <div className="flex bg-warm-bg rounded-[11px] px-3 items-center">
                    <Lock className="w-4 h-4 text-charcoal-light mr-2 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (validationErrors.password) {
                          setValidationErrors(prev => ({ ...prev, password: "" }));
                        }
                      }}
                      className="w-full py-3 bg-transparent text-charcoal-text text-xs outline-none border-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-charcoal-light hover:text-charcoal-text ml-1.5 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {validationErrors.password && (
                  <span className="text-[10px] text-rose-600 font-medium px-1 animate-fade-in">{validationErrors.password}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-full bg-brand-sage text-charcoal-text font-bold text-xs shadow-xs hover:bg-brand-teal hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Aligning details..." : "Open Companion"}</span>
                {!loading && <ArrowRight className="w-4 h-4 text-charcoal-text" />}
              </button>

            </form>

            {/* Bottom links */}
            <p className="text-[11px] text-charcoal-light text-center mt-2 border-t border-neutral-border pt-4">
              New to WellWish AI?{" "}
              <Link to="/register" className="font-bold text-brand-teal hover:underline">
                Create Free Account
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
