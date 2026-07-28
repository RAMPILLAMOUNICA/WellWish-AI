import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { login, loading, clearError } = useAuth();
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
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      addToast(errorMsg, "error");
    }
  };

  const handleDemoLogin = async () => {
    try {
      const success = await login("demo@wellwish.ai", "demopassword123");
      if (success) {
        addToast("Welcome back to your wellbeing companion.", "success");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Demo login failed:", err);
      addToast("Demo account is temporarily unavailable.", "error");
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
                <span>{loading ? "Aligning details..." : "Sign In"}</span>
                {!loading && <ArrowRight className="w-4 h-4 text-charcoal-text" />}
              </button>

              {/* Demo Login Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleDemoLogin}
                className="w-full mt-3 py-3.5 rounded-full border border-neutral-border bg-warm-bg/50 hover:bg-warm-bg text-charcoal-light hover:text-charcoal-text font-bold text-xs shadow-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Aligning details..." : "Continue as Demo"}</span>
                {!loading && <ArrowRight className="w-4 h-4 text-charcoal-light" />}
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
