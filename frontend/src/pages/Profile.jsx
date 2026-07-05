import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  User,
  ArrowLeft,
  Shield,
  Sparkles,
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
      setFullName(user.full_name);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      await api.put("/auth/profile", { full_name: fullName });
      setProfileSuccess("Profile details updated.");
      addToast("Profile details successfully updated.", "success");
      // Soft refresh context
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      setProfileError(err.response?.data?.detail || "Failed to update profile details.");
      addToast("Failed to save profile changes.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
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
          <Link to="/" className="flex items-center gap-2.5 group">
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
            <button onClick={() => navigate("/dashboard")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-brand-teal" />
                <span>My Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>
            <button onClick={() => navigate("/journal")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                <span>Wellbeing Journal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>
            <button onClick={() => navigate("/community")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-brand-teal" />
                <span>Impact Circles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between bg-brand-sage/20 border-l-4 border-brand-sage text-charcoal-text transition-all outline-none cursor-pointer">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-brand-purple" />
                <span>Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
          </nav>
        </div>
        <div className="flex flex-col gap-4 border-t border-neutral-border pt-6">
          <button onClick={handleLogoutClick} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-charcoal-light hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-3 cursor-pointer outline-none">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Navbar */}
        <header className="h-16 border-b border-neutral-border bg-card-bg/75 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-full text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xs text-charcoal-light font-mono hidden sm:inline">ACCOUNT SETTINGS</h2>
          </div>
          <Link to="/dashboard" className="text-xs font-semibold text-charcoal-light hover:text-charcoal-text flex items-center gap-1.5 px-4 py-2 rounded-full bg-card-bg border border-neutral-border shadow-xs">
            <ArrowLeft className="w-4 h-4 text-charcoal-light" />
            <span>Dashboard</span>
          </Link>
        </header>

        <main className="p-6 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column A: Edit Profile & Password */}
            <div className="flex flex-col gap-8">
              
              {/* Edit Profile */}
              <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-5 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <User className="w-4.5 h-4.5 text-brand-teal" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Profile Details</h3>
                </div>

                {profileSuccess && (
                  <div className="p-3 bg-brand-teal/15 border border-brand-teal/30 text-charcoal-text text-[11px] rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-teal" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[11px] rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full p-3 bg-warm-bg rounded-xl border border-neutral-border text-slate-400 text-xs cursor-not-allowed outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light">FULL NAME</label>
                    <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-3 bg-warm-bg rounded-[11px] text-charcoal-text text-xs outline-none border-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-5 py-2.5 rounded-full bg-brand-sage text-charcoal-text font-bold text-xs hover:bg-brand-teal self-end transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {profileLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-5 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Lock className="w-4.5 h-4.5 text-brand-purple" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Change Password</h3>
                </div>

                {passwordSuccess && (
                  <div className="p-3 bg-brand-teal/15 border border-brand-teal/30 text-charcoal-text text-[11px] rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-teal" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[11px] rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light">CURRENT PASSWORD</label>
                    <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all">
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full p-3 bg-warm-bg rounded-[11px] text-charcoal-text text-xs outline-none border-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light">NEW PASSWORD</label>
                    <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all">
                      <div className="flex bg-warm-bg rounded-[11px] px-3 items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full py-3 bg-transparent text-charcoal-text text-xs outline-none border-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-charcoal-light hover:text-charcoal-text outline-none focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 rounded-full bg-brand-purple text-charcoal-text font-bold text-xs hover:scale-[1.01] self-end transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Update Password</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Column B: Toggles for Devices, Alerts, Privacy */}
            <div className="flex flex-col gap-8">
              
              {/* Wearable Sync */}
              <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Smartphone className="w-4.5 h-4.5 text-brand-teal" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Device Connections</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Apple Watch</span>
                    <input
                      type="checkbox"
                      checked={appleWatch}
                      onChange={(e) => {
                        setAppleWatch(e.target.checked);
                        addToast(e.target.checked ? "Apple Watch linked." : "Apple Watch unlinked.", "info");
                      }}
                      className="w-4 h-4 rounded border-neutral-border bg-card-bg text-brand-teal focus:ring-brand-sage cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Oura Ring</span>
                    <input
                      type="checkbox"
                      checked={ouraRing}
                      onChange={(e) => {
                        setOuraRing(e.target.checked);
                        addToast(e.target.checked ? "Oura Ring linked." : "Oura Ring unlinked.", "info");
                      }}
                      className="w-4 h-4 rounded border-neutral-border bg-card-bg text-brand-teal focus:ring-brand-sage cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Fitbit App</span>
                    <input
                      type="checkbox"
                      checked={fitbit}
                      onChange={(e) => {
                        setFitbit(e.target.checked);
                        addToast(e.target.checked ? "Fitbit linked." : "Fitbit unlinked.", "info");
                      }}
                      className="w-4 h-4 rounded border-neutral-border bg-card-bg text-brand-teal focus:ring-brand-sage cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Rules */}
              <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Bell className="w-4.5 h-4.5 text-brand-purple" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Reminders Settings</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Weekly Wellbeing Digests</span>
                    <input
                      type="checkbox"
                      checked={weeklyDigest}
                      onChange={(e) => {
                        setWeeklyDigest(e.target.checked);
                        addToast("Preferences updated.", "success");
                      }}
                      className="w-4 h-4 rounded border-neutral-border bg-card-bg text-brand-teal focus:ring-brand-sage cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Stress Level Indicators</span>
                    <input
                      type="checkbox"
                      checked={stressAlerts}
                      onChange={(e) => {
                        setStressAlerts(e.target.checked);
                        addToast("Preferences updated.", "success");
                      }}
                      className="w-4 h-4 rounded border-neutral-border bg-card-bg text-brand-teal focus:ring-brand-sage cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Mindful breathing Breaks</span>
                    <input
                      type="checkbox"
                      checked={restReminders}
                      onChange={(e) => {
                        setRestReminders(e.target.checked);
                        addToast("Preferences updated.", "success");
                      }}
                      className="w-4 h-4 rounded border-neutral-border bg-card-bg text-brand-teal focus:ring-brand-sage cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Security Shield details */}
              <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3">
                  <Key className="w-4.5 h-4.5 text-brand-teal" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Account Data Privacy</h3>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between items-center p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-charcoal-light font-mono text-[10px]">SECURITY LEVEL</span>
                    <span className="text-charcoal-text font-bold font-mono">Browser Local storage</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-2xl border border-neutral-border">
                    <span className="text-xs font-bold text-charcoal-text">Anonymous Workspace Sync</span>
                    <input
                      type="checkbox"
                      checked={anonymousSync}
                      onChange={(e) => {
                        setAnonymousSync(e.target.checked);
                        addToast("Data preferences saved.", "info");
                      }}
                      className="w-4 h-4 rounded border-neutral-border bg-card-bg text-brand-teal focus:ring-brand-sage cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-4 bg-brand-purple/5 border border-brand-purple/10 rounded-2xl flex gap-2.5 text-[10px] text-charcoal-light leading-normal">
                  <Shield className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                  <span>Your reflections and check-ins are encrypted locally in your browser cache.</span>
                </div>
              </div>

              {/* Logout Row */}
              <button
                onClick={handleLogoutClick}
                className="w-full py-4 bg-rose-50 border border-rose-100 hover:bg-rose-100/50 text-xs font-bold text-rose-600 rounded-3xl flex items-center justify-center gap-2 transition-all cursor-pointer outline-none"
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
