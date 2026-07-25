import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft, User, Shield, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dailyReminders, setDailyReminders] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const { register, loading, error, clearError } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = "Full name is required.";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      errors.name = "Name can only contain letters and spaces.";
    }

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

    if (!termsAccepted) {
      errors.terms = "You must agree to the terms and privacy conditions.";
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
      const success = await register(email, name, password);
      if (success) {
        addToast("Wellness account registered successfully.", "success");
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Registration failed. Verify your details.";
      setLocalError(errorMsg);
      addToast(errorMsg, "error");
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center relative px-6 overflow-hidden grid-bg text-charcoal-text font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-sage/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none animate-pulse-slow" />

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
        <div className="flex flex-col items-center gap-4 mb-6 text-center animate-fade-in">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-sage/20 p-2 rounded-full border border-brand-sage/35 shadow-xs">
              <Heart className="w-5 h-5 text-brand-teal fill-brand-teal/20" />
            </div>
          </Link>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-charcoal-text">Start Your Journey</h2>
            <p className="text-xs text-charcoal-light mt-1">Begin tracking your daily wellbeing index securely</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="p-[1px] rounded-[32px] bg-neutral-border shadow-sm">
          <div className="bg-card-bg rounded-[31px] p-8 flex flex-col gap-5 border border-neutral-border">
            
            {/* Error Message Alert */}
            {(localError || error) && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl flex gap-2.5 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-charcoal-light tracking-wide">FULL NAME</label>
                <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all">
                  <div className="flex bg-warm-bg rounded-[11px] px-3 items-center">
                    <User className="w-4 h-4 text-charcoal-light mr-2 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (validationErrors.name) {
                          setValidationErrors(prev => ({ ...prev, name: "" }));
                        }
                      }}
                      className="w-full py-3 bg-transparent text-charcoal-text text-xs outline-none border-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
                {validationErrors.name && (
                  <span className="text-[10px] text-rose-600 font-medium px-1 animate-fade-in">{validationErrors.name}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-charcoal-light tracking-wide">EMAIL ADDRESS</label>
                <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all">
                  <div className="flex bg-warm-bg rounded-[11px] px-3 items-center">
                    <Mail className="w-4 h-4 text-charcoal-light mr-2 shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
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
                <label className="text-[10px] font-bold text-charcoal-light tracking-wide">PASSWORD</label>
                <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all">
                  <div className="flex bg-warm-bg rounded-[11px] px-3 items-center">
                    <Lock className="w-4.5 h-4.5 text-charcoal-light mr-2 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min. 8 characters"
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
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>
                {validationErrors.password && (
                  <span className="text-[10px] text-rose-600 font-medium px-1 animate-fade-in">{validationErrors.password}</span>
                )}
              </div>

              {/* Daily Reminders Toggle */}
              <div className="flex items-start gap-3 mt-1.5 p-3 rounded-2xl bg-warm-bg border border-neutral-border">
                <input
                  type="checkbox"
                  id="sync"
                  checked={dailyReminders}
                  onChange={(e) => setDailyReminders(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-neutral-border bg-card-bg text-brand-teal focus:ring-brand-sage cursor-pointer"
                />
                <label htmlFor="sync" className="text-[11px] text-charcoal-light leading-relaxed cursor-pointer select-none">
                  <span className="font-bold text-charcoal-text block">Enable Daily Check-in Reminders</span>
                  Receive daily nudges to log your sleep, hydration, and mood.
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-start gap-3 mt-1.5 p-3 rounded-2xl bg-warm-bg border border-neutral-border">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (validationErrors.terms) {
                        setValidationErrors(prev => ({ ...prev, terms: "" }));
                      }
                    }}
                    className="mt-1 w-4 h-4 rounded border-neutral-border bg-card-bg text-brand-teal focus:ring-brand-sage cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-charcoal-light leading-relaxed cursor-pointer select-none">
                    I agree to the terms and privacy conditions of WellWish AI.
                  </label>
                </div>
                {validationErrors.terms && (
                  <span className="text-[10px] text-rose-600 font-medium px-1 animate-fade-in">{validationErrors.terms}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-full bg-brand-sage text-charcoal-text font-bold text-xs hover:bg-brand-teal hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Aligning account..." : "Initialize Account"}</span>
                {!loading && <ArrowRight className="w-4 h-4 text-charcoal-text" />}
              </button>

            </form>

            <div className="flex items-center justify-center gap-2 text-[10px] text-charcoal-light">
              <Shield className="w-3.5 h-3.5 text-brand-teal" />
              <span>Data is stored securely in your browser.</span>
            </div>

            {/* Bottom link */}
            <p className="text-[11px] text-charcoal-light text-center mt-2 border-t border-neutral-border pt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-brand-teal hover:underline">
                Sign In
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
