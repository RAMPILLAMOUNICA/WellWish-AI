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
  ChevronRight,
  Download,
  Trash2,
  Sliders,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import MobileNavBar from "../components/MobileNavBar";

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
  const { user, logout, refreshUser } = useAuth();
  const { addToast } = useToast();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Edit Profile States
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
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

  // Preferences (Bound to DB)
  const [notifCheckin, setNotifCheckin] = useState(user?.notification_checkin ?? true);
  const [notifStreak, setNotifStreak] = useState(user?.notification_streak ?? true);
  const [notifActionPlan, setNotifActionPlan] = useState(user?.notification_action_plan ?? true);
  const [aiTone, setAiTone] = useState(user?.ai_tone || "Empathetic & Gentle");
  const [appTheme, setAppTheme] = useState(user?.app_theme || "Calm");

  // Modals for privacy & data management
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState("");
  const [clearLoading, setClearLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Synchronize state when user loaded
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setNotifCheckin(user.notification_checkin ?? true);
      setNotifStreak(user.notification_streak ?? true);
      setNotifActionPlan(user.notification_action_plan ?? true);
      setAiTone(user.ai_tone || "Empathetic & Gentle");
      setAppTheme(user.app_theme || "Calm");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || profileLoading) return;
    setProfileLoading(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      await api.put("/auth/profile", { 
        full_name: fullName,
        email: email
      });
      await refreshUser();
      setProfileSuccess("Account details updated.");
      addToast("Account details successfully updated.", "success");
    } catch (err) {
      setProfileError(err.response?.data?.detail || "Failed to update profile details.");
      addToast("Failed to save changes.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePreferenceChange = async (field, value) => {
    try {
      await api.put("/auth/profile", { [field]: value });
      await refreshUser();
      addToast("Preference saved successfully.", "success");
    } catch (err) {
      addToast("Failed to save preference.", "error");
    }
  };

  const handleTogglePreference = (field, checked, setVal) => {
    setVal(checked);
    handlePreferenceChange(field, checked);
  };

  const handleToneChange = (newTone) => {
    setAiTone(newTone);
    handlePreferenceChange("ai_tone", newTone);
  };

  const handleThemeChange = (newTheme) => {
    setAppTheme(newTheme);
    handlePreferenceChange("app_theme", newTheme);
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

  const handleExportData = async () => {
    try {
      const res = await api.get("/auth/export-data");
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `wellwish_export_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast("Wellness data compiled and downloaded successfully.", "success");
    } catch (err) {
      addToast("Failed to export wellness data.", "error");
    }
  };

  const handleClearData = async (e) => {
    e.preventDefault();
    if (clearConfirmText !== "CLEAR") {
      addToast("Please type CLEAR exactly to confirm.", "error");
      return;
    }
    setClearLoading(true);
    try {
      await api.post("/auth/clear-data");
      addToast("All journal logs and AI memories cleared successfully.", "success");
      setShowClearModal(false);
      setClearConfirmText("");
      window.dispatchEvent(new Event("wellwish_data_updated"));
    } catch (err) {
      addToast("Failed to clear data.", "error");
    } finally {
      setClearLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmText !== "DELETE") {
      addToast("Please type DELETE exactly to confirm.", "error");
      return;
    }
    setDeleteLoading(true);
    try {
      await api.delete("/auth/delete-account");
      addToast("Account permanently deleted.", "success");
      setShowDeleteModal(false);
      setDeleteConfirmText("");
      logout();
      navigate("/");
    } catch (err) {
      addToast("Failed to delete account.", "error");
    } finally {
      setDeleteLoading(false);
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
            className="fixed inset-0 z-40 lg:hidden flex bg-slate-900/40 backdrop-blur-xs"
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
                  <Link to="/" className="flex items-center gap-2 focus-ring rounded-lg">
                    <Heart className="w-4 h-4 text-brand-teal" />
                    <span className="font-display font-bold text-charcoal-text">WellWish AI</span>
                  </Link>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-full text-charcoal-light hover:text-charcoal-text">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-charcoal-light hover:text-charcoal-text">
                    <Activity className="w-4 h-4 text-brand-teal" />
                    <span>My Dashboard</span>
                  </button>
                  <button onClick={() => { navigate("/journal"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-charcoal-light hover:text-charcoal-text">
                    <BookOpen className="w-4 h-4 text-brand-purple" />
                    <span>Wellbeing Journal</span>
                  </button>
                  <button onClick={() => { navigate("/community"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-charcoal-light hover:text-charcoal-text">
                    <Users className="w-4 h-4 text-brand-teal" />
                    <span>Impact Circles</span>
                  </button>
                  <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 bg-brand-sage/20 text-charcoal-text">
                    <User className="w-4 h-4 text-brand-purple" />
                    <span>Settings</span>
                  </button>
                </nav>
              </div>

              <div className="flex flex-col gap-4 border-t border-neutral-border pt-6">
                <button onClick={handleLogoutClick} className="w-full py-2.5 rounded-full text-xs font-bold text-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all">
                  Lock Session
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 pb-[56px] md:pb-0">
        
        {/* Navbar */}
        <header className="h-16 border-b border-neutral-border bg-card-bg/75 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="hidden md:flex lg:hidden p-2 rounded-full text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 touch-target flex items-center justify-center"
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

        {/* Content Body */}
        <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            
            {/* Column A: Account & Password */}
            <div className="lg:col-span-6 flex flex-col gap-6 sm:gap-8">
              
              {/* Account details */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <User className="w-4.5 h-4.5 text-brand-teal" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Account Details</h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  {profileSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs flex gap-2 items-center font-semibold animate-fade-in">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}
                  {profileError && (
                    <div className="p-3 bg-rose-50 border border-rose-250 rounded-2xl text-rose-600 text-xs flex gap-2 items-center font-semibold animate-shake">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 bg-warm-bg rounded-xl border border-neutral-border text-charcoal-text text-xs outline-none focus:ring-2 focus:ring-brand-sage transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-warm-bg rounded-xl border border-neutral-border text-charcoal-text text-xs outline-none focus:ring-2 focus:ring-brand-sage transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading || !fullName.trim() || !email.trim()}
                    className="px-6 py-2.5 rounded-full bg-brand-sage text-charcoal-text font-bold text-xs hover:bg-brand-teal self-end transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs hover:scale-105 active:scale-95 focus-ring"
                  >
                    {profileLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Account Details</span>
                  </button>
                </form>
              </div>

              {/* Password change */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Lock className="w-4.5 h-4.5 text-brand-purple" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Passcode Rotation</h3>
                </div>

                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs flex gap-2 items-center font-semibold animate-fade-in">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}
                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-250 rounded-2xl text-rose-600 text-xs flex gap-2 items-center font-semibold animate-shake">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

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

            {/* Column B: Preferences, AI, Privacy */}
            <div className="lg:col-span-6 flex flex-col gap-6 sm:gap-8">
              
              {/* AI Calibration Controls */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Sliders className="w-4.5 h-4.5 text-brand-teal" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">AI Calibration Controls</h3>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light tracking-wider">AI COACHING TONE</label>
                    <select
                      value={aiTone}
                      onChange={(e) => handleToneChange(e.target.value)}
                      className="w-full p-3 bg-warm-bg text-charcoal-text rounded-xl border border-neutral-border text-xs outline-none focus:ring-2 focus:ring-brand-teal"
                    >
                      <option value="Empathetic & Gentle">Empathetic & Gentle (Supportive & Caring)</option>
                      <option value="Direct & Analytical">Direct & Analytical (Fact-Based & Logical)</option>
                      <option value="Motivational Coach">Motivational Coach (Energetic & Action-Oriented)</option>
                    </select>
                  </div>
                  
                  <div className="p-3 bg-brand-teal/5 border border-brand-teal/10 rounded-2xl flex gap-2 text-[10px] text-charcoal-light leading-relaxed">
                    <Sparkles className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <span>Willa's chat advisories and daily reflection deconstruction reports will automatically adapt to your calibrated coaching style.</span>
                  </div>
                </div>
              </div>

              {/* Notification preferences */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Bell className="w-4.5 h-4.5 text-brand-purple" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Notification Preferences</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-charcoal-text">Daily Check-in Reminders</span>
                      <span className="text-[9px] text-charcoal-light mt-0.5 font-light">Remind me to log vitals every day</span>
                    </div>
                    <ToggleSwitch
                      checked={notifCheckin}
                      onChange={(val) => handleTogglePreference("notification_checkin", val, setNotifCheckin)}
                      label="Daily check-in reminders toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-charcoal-text">Streak Alerts</span>
                      <span className="text-[9px] text-charcoal-light mt-0.5 font-light">Notify me when my streak is at risk</span>
                    </div>
                    <ToggleSwitch
                      checked={notifStreak}
                      onChange={(val) => handleTogglePreference("notification_streak", val, setNotifStreak)}
                      label="Streak alerts toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-charcoal-text">AI Action Plan Updates</span>
                      <span className="text-[9px] text-charcoal-light mt-0.5 font-light">Get alerts when my daily tasks calibrate</span>
                    </div>
                    <ToggleSwitch
                      checked={notifActionPlan}
                      onChange={(val) => handleTogglePreference("notification_action_plan", val, setNotifActionPlan)}
                      label="Action plan updates toggle"
                    />
                  </div>
                </div>
              </div>

              {/* App Appearance */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Activity className="w-4.5 h-4.5 text-brand-teal" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">App Appearance</h3>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-charcoal-text">Calm Theme</span>
                    <span className="text-[9px] text-charcoal-light mt-0.5 font-light">Use light-blue desaturated wellness styling</span>
                  </div>
                  <ToggleSwitch
                    checked={appTheme === "Calm"}
                    onChange={(val) => handleThemeChange(val ? "Calm" : "Light")}
                    label="Calm theme toggle"
                  />
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Shield className="w-4.5 h-4.5 text-brand-purple" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Data & Privacy</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleExportData}
                    className="w-full p-3.5 bg-brand-sage/20 border border-brand-sage/35 text-charcoal-text hover:bg-brand-sage/30 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer outline-none focus-ring"
                  >
                    <Download className="w-4 h-4 text-brand-teal" />
                    <span>Download My Wellness Data</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3.5 mt-1">
                    <button
                      onClick={() => {
                        setClearConfirmText("");
                        setShowClearModal(true);
                      }}
                      className="p-3 bg-warm-bg hover:bg-rose-50 border border-neutral-border hover:border-rose-200 text-[11px] font-bold text-charcoal-light hover:text-rose-600 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 outline-none active:scale-[0.98] focus-ring"
                      aria-label="Open Clear AI Memory Confirmation Modal"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Clear AI Memory</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirmText("");
                        setShowDeleteModal(true);
                      }}
                      className="p-3 bg-warm-bg hover:bg-rose-500 hover:text-white border border-neutral-border hover:border-rose-500 text-[11px] font-bold text-rose-600 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 outline-none active:scale-[0.98] focus-ring"
                      aria-label="Open Delete Account Confirmation Modal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Account</span>
                    </button>
                  </div>
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
        
        {/* Mobile Tab Bar */}
        <MobileNavBar />
      </div>

      {/* MODAL 1: CLEAR DATA MEMORY */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card-bg p-6 rounded-3xl border border-neutral-border max-w-sm w-full flex flex-col gap-4 shadow-2xl relative"
            >
              <div className="flex items-center gap-2.5 text-rose-600 border-b border-neutral-border pb-3">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-extrabold uppercase tracking-tight">Clear AI Memory</h3>
              </div>
              <p className="text-xs text-charcoal-light leading-relaxed">
                This will permanently delete all your logged vitals check-ins, timeline journal entries, and chatbot memory. This action is irreversible.
              </p>
              <form onSubmit={handleClearData} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-charcoal-light tracking-wide">
                    TYPE <span className="text-rose-600 font-extrabold">CLEAR</span> TO CONFIRM
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CLEAR"
                    value={clearConfirmText}
                    onChange={(e) => setClearConfirmText(e.target.value)}
                    className="w-full p-2.5 bg-warm-bg border border-neutral-border rounded-xl text-xs text-charcoal-text font-bold uppercase text-center outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="flex gap-2.5 self-end">
                  <button
                    type="button"
                    onClick={() => setShowClearModal(false)}
                    className="px-4 py-2 rounded-full border border-neutral-border text-charcoal-light hover:text-charcoal-text text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 focus-ring"
                    aria-label="Cancel clearing AI memory"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={clearLoading || clearConfirmText !== "CLEAR"}
                    className="px-5 py-2 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95 focus-ring"
                    aria-label="Confirm clear AI memory and purge files"
                  >
                    {clearLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Purge Memory"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DELETE ACCOUNT */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card-bg p-6 rounded-3xl border border-neutral-border max-w-sm w-full flex flex-col gap-4 shadow-2xl relative"
            >
              <div className="flex items-center gap-2.5 text-rose-600 border-b border-neutral-border pb-3">
                <Trash2 className="w-5 h-5 animate-pulse" />
                <h3 className="text-sm font-extrabold uppercase tracking-tight">Delete Account Permanently</h3>
              </div>
              <p className="text-xs text-charcoal-light leading-relaxed">
                You are about to completely delete your WellWish account and purge all your encrypted settings, databases, and logs. This cannot be undone.
              </p>
              <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-charcoal-light tracking-wide">
                    TYPE <span className="text-rose-600 font-extrabold">DELETE</span> TO CONFIRM
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DELETE"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full p-2.5 bg-warm-bg border border-neutral-border rounded-xl text-xs text-charcoal-text font-bold uppercase text-center outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="flex gap-2.5 self-end">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-full border border-neutral-border text-charcoal-light hover:text-charcoal-text text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 focus-ring"
                    aria-label="Cancel account deletion"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deleteLoading || deleteConfirmText !== "DELETE"}
                    className="px-5 py-2 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95 focus-ring"
                    aria-label="Confirm permanent account deletion"
                  >
                    {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete Account"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
