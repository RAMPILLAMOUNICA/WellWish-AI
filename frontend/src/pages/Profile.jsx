import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  User,
  ArrowLeft,
  Shield,
  Key,
  Lock,
  Smartphone,
  Bell,
  Eye,
  EyeOff,
  LogOut,
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2,
  Menu,
  X,
  BookOpen,
  Users,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const ToggleSwitch = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-ring ${
      checked ? "bg-brand-sage" : "bg-neutral-border"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card-bg shadow-md ring-0 transition duration-200 ease-in-out ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Edit Profile States
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Change Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Toggles settings (mocked state parameters)
  const [appleWatch, setAppleWatch] = useState(true);
  const [ouraRing, setOuraRing] = useState(false);
  const [fitbit, setFitbit] = useState(false);
  
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [stressAlerts, setStressAlerts] = useState(true);
  const [restReminders, setRestReminders] = useState(false);

  const [anonymousSync, setAnonymousSync] = useState(true);

  // Sync profile details if context user changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || profileLoading) return;
    setProfileLoading(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      await api.put("/auth/profile", { full_name: fullName });
      setProfileSuccess("Profile details updated.");
      addToast("Profile details successfully updated.", "success");
    } catch (err) {
      setProfileError(err.response?.data?.detail || "Failed to update profile details.");
      addToast("Failed to save profile changes.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    setPasswordLoading(true);
    setPasswordSuccess("");
    setPasswordError("");
    try {
      await api.put("/auth/password", {
        old_password: oldPassword,
        new_password: newPassword
      });
      setPasswordSuccess("Password updated successfully.");
      addToast("Security password updated successfully.", "success");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to update passcode.");
      addToast("Failed to update password.", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    addToast("Logged out successfully.", "info");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-warm-bg text-charcoal-text flex relative overflow-hidden font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-neutral-border bg-sidebar-bg hidden lg:flex flex-col justify-between p-6 shrink-0 relative z-30 shadow-xs">
        <div className="flex flex-col gap-8">
          <Link to="/" className="flex items-center gap-2.5 group focus-ring rounded-xl">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-brand-sage/20 opacity-50 blur-sm"></div>
              <div className="relative bg-card-bg border border-neutral-border p-2 rounded-full shadow-xs">
                <Heart className="w-4.5 h-4.5 text-brand-teal fill-brand-teal/10" />
              </div>
            </div>
            <span className="font-display font-bold text-lg text-charcoal-text">
              WellWish <span className="text-brand-sage font-extrabold">AI</span>
            </span>
          </Link>
          <nav className="flex flex-col gap-1.5">
            <button onClick={() => navigate("/dashboard")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer focus-ring">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-brand-teal" />
                <span>My Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>
            <button onClick={() => navigate("/journal")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer focus-ring">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                <span>Wellbeing Journal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>
            <button onClick={() => navigate("/community")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer focus-ring">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-brand-teal" />
                <span>Impact Circles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between bg-brand-sage/20 border-l-4 border-brand-sage text-charcoal-text transition-all outline-none cursor-pointer focus-ring">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-brand-purple" />
                <span>Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
          </nav>
        </div>
        <div className="flex flex-col gap-4 border-t border-neutral-border pt-6">
          <button onClick={handleLogoutClick} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-charcoal-light hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-3 cursor-pointer outline-none focus-ring">
            <LogOut className="w-4 h-4" />
            <span>Lock Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-45 lg:hidden flex bg-slate-900/40 backdrop-blur-xs"
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-64 h-full bg-sidebar-bg border-r border-neutral-border p-6 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <Link to="/" className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-brand-teal" />
                    <span className="font-display font-bold text-charcoal-text">WellWish AI</span>
                  </Link>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full text-charcoal-light hover:text-charcoal-text touch-target">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-charcoal-light hover:text-charcoal-text touch-target">
                    <Activity className="w-4 h-4 text-brand-teal" />
                    <span>My Dashboard</span>
                  </button>
                  <button onClick={() => { navigate("/journal"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-charcoal-light hover:text-charcoal-text touch-target">
                    <BookOpen className="w-4 h-4 text-brand-purple" />
                    <span>Wellbeing Journal</span>
                  </button>
                  <button onClick={() => { navigate("/community"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-charcoal-light hover:text-charcoal-text touch-target">
                    <Users className="w-4 h-4 text-brand-teal" />
                    <span>Impact Circles</span>
                  </button>
                  <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 bg-brand-sage/20 text-charcoal-text touch-target">
                    <User className="w-4 h-4 text-brand-purple" />
                    <span>Settings</span>
                  </button>
                </nav>
              </div>

              <div className="flex flex-col gap-4 border-t border-neutral-border pt-6">
                <button onClick={handleLogoutClick} className="w-full py-3 rounded-full text-xs font-bold text-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all touch-target">
                  Lock Session
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Navbar */}
        <header className="h-16 border-b border-neutral-border bg-card-bg/75 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-full text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 touch-target flex items-center justify-center"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2.5">
              <h1 className="text-sm font-bold text-charcoal-text font-display">Settings</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                <span>Preferences</span>
              </span>
            </div>
          </div>
          <Link to="/dashboard" className="text-xs font-semibold text-charcoal-light hover:text-charcoal-text flex items-center gap-1.5 px-4 py-2 rounded-full bg-card-bg border border-neutral-border shadow-xs hover:border-brand-sage transition-all focus-ring">
            <ArrowLeft className="w-4 h-4 text-charcoal-light" />
            <span>Dashboard</span>
          </Link>
        </header>

        <main className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 sm:gap-8 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Column A: Edit Profile & Password */}
            <div className="flex flex-col gap-6 sm:gap-8">
              
              {/* Edit Profile */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-5 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <User className="w-4.5 h-4.5 text-brand-teal" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Profile Details</h3>
                </div>

                {profileSuccess && (
                  <div className="p-3 bg-brand-teal/15 border border-brand-teal/30 text-charcoal-text text-[11px] rounded-xl flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-brand-teal shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[11px] rounded-xl flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full p-3 bg-warm-bg rounded-xl border border-neutral-border text-slate-400 text-xs cursor-not-allowed outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 bg-warm-bg rounded-xl border border-neutral-border text-charcoal-text text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading || !fullName.trim()}
                    className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs self-end transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs hover:scale-105 active:scale-95 focus-ring btn-press"
                  >
                    {profileLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-5 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Lock className="w-4.5 h-4.5 text-brand-purple" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Change Password</h3>
                </div>

                {passwordSuccess && (
                  <div className="p-3 bg-brand-teal/15 border border-brand-teal/30 text-charcoal-text text-[11px] rounded-xl flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-brand-teal shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[11px] rounded-xl flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">CURRENT PASSWORD</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full p-3 bg-warm-bg rounded-xl border border-neutral-border text-charcoal-text text-xs outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">NEW PASSWORD</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-3 pr-10 bg-warm-bg rounded-xl border border-neutral-border text-charcoal-text text-xs outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-charcoal-light hover:text-charcoal-text cursor-pointer touch-target flex items-center justify-center"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading || !oldPassword || newPassword.length < 6}
                    className="px-6 py-2.5 rounded-full bg-brand-purple text-charcoal-text font-bold text-xs hover:bg-brand-purple/80 self-end transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs hover:scale-105 active:scale-95 focus-ring"
                  >
                    {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Update Password</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Column B: Toggles for Devices, Alerts, Privacy */}
            <div className="flex flex-col gap-6 sm:gap-8">
              
              {/* Wearable Sync */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Smartphone className="w-4.5 h-4.5 text-brand-teal" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Device Connections</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Apple Watch</span>
                    <ToggleSwitch
                      checked={appleWatch}
                      onChange={(val) => {
                        setAppleWatch(val);
                        addToast(val ? "Apple Watch linked." : "Apple Watch unlinked.", "info");
                      }}
                      label="Apple Watch integration"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Oura Ring</span>
                    <ToggleSwitch
                      checked={ouraRing}
                      onChange={(val) => {
                        setOuraRing(val);
                        addToast(val ? "Oura Ring linked." : "Oura Ring unlinked.", "info");
                      }}
                      label="Oura Ring integration"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Fitbit App</span>
                    <ToggleSwitch
                      checked={fitbit}
                      onChange={(val) => {
                        setFitbit(val);
                        addToast(val ? "Fitbit linked." : "Fitbit unlinked.", "info");
                      }}
                      label="Fitbit integration"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Rules */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Bell className="w-4.5 h-4.5 text-brand-purple" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Reminders & Alerts</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Weekly Wellbeing Digests</span>
                    <ToggleSwitch
                      checked={weeklyDigest}
                      onChange={(val) => {
                        setWeeklyDigest(val);
                        addToast("Preferences updated.", "success");
                      }}
                      label="Weekly digests toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Stress Level Alerts</span>
                    <ToggleSwitch
                      checked={stressAlerts}
                      onChange={(val) => {
                        setStressAlerts(val);
                        addToast("Preferences updated.", "success");
                      }}
                      label="Stress level alerts toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Mindful Breathing Breaks</span>
                    <ToggleSwitch
                      checked={restReminders}
                      onChange={(val) => {
                        setRestReminders(val);
                        addToast("Preferences updated.", "success");
                      }}
                      label="Mindful breathing reminders toggle"
                    />
                  </div>
                </div>
              </div>

              {/* Security Shield details */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Key className="w-4.5 h-4.5 text-brand-teal" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Account Privacy</h3>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between items-center p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-charcoal-light font-mono text-[10px] uppercase">STORAGE TYPE</span>
                    <span className="text-charcoal-text font-bold font-mono text-[11px]">Browser Local Vault</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Anonymous Analytics Sync</span>
                    <ToggleSwitch
                      checked={anonymousSync}
                      onChange={(val) => {
                        setAnonymousSync(val);
                        addToast("Privacy preferences saved.", "info");
                      }}
                      label="Anonymous analytics toggle"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-brand-purple/5 border border-brand-purple/10 rounded-2xl flex gap-2.5 text-[10px] text-charcoal-light leading-normal">
                  <Shield className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                  <span>Your reflections and check-ins are encrypted locally in your browser cache.</span>
                </div>
              </div>

              {/* Logout Row */}
              <button
                onClick={handleLogoutClick}
                className="w-full py-3.5 bg-rose-50 border border-rose-100 hover:bg-rose-100/60 text-xs font-bold text-rose-600 rounded-3xl flex items-center justify-center gap-2 transition-all cursor-pointer outline-none focus-ring shadow-xs active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Lock Dashboard Session</span>
              </button>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
