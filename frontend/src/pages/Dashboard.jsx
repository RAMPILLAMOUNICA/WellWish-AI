import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import {
  Heart,
  Brain,
  Sparkles,
  Activity,
  Smile,
  Compass,
  User,
  LogOut,
  Moon,
  Droplet,
  Flame,
  Smartphone,
  CheckCircle,
  Plus,
  Bell,
  Settings,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  TrendingUp,
  Menu,
  X,
  Loader2,
  AlertCircle,
  RotateCcw,
  MessageSquare,
  Send
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SkeletonLoader from "../components/SkeletonLoader";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Page level API loading states
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  
  // Dashboard states bound to FastAPI response
  const [vitals, setVitals] = useState({
    wellbeing_index: null,
    stress_risk: "Minimal",
    mood: "Stable",
    sleep: null,
    water: 0,
    steps: null,
    screen_time: null,
    burnout_risk: "Low",
    recovery_score: null,
    wearable_connected: false,
    journal_streak: 0,
    user_profile: null
  });
  
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [todayWin, setTodayWin] = useState("");
  const [willaReflection, setWillaReflection] = useState(null);

  // Weekly reflection modal states
  const [weeklyReflection, setWeeklyReflection] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);

  // Chat with Willa states
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "model", content: "Hi! I'm Willa, your wellbeing companion. How is your focus and energy pacing today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  // Interaction loaders
  const [isSyncing, setIsSyncing] = useState(false);
  const [isWaterUpdating, setIsWaterUpdating] = useState(false);

  const fetchWeeklyReflection = async () => {
    setWeeklyLoading(true);
    setShowWeeklyModal(true);
    try {
      const res = await api.get("/ai/weekly-reflection");
      setWeeklyReflection(res.data);
    } catch (err) {
      addToast("Failed to fetch weekly wellness reflection.", "error");
    } finally {
      setWeeklyLoading(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    
    try {
      const history = chatMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));
      
      const res = await api.post("/ai/chat", {
        message: userMsg.content,
        chat_history: history
      });
      
      setChatMessages(prev => [...prev, { role: "model", content: res.data.reply }]);
    } catch (err) {
      addToast("Failed to connect to Willa. Please try again.", "error");
      setChatMessages(prev => [...prev, { role: "model", content: "Oops, I had a brief network glitch, but I'm still here! How is your hydration pacing today?" }]);
    } finally {
      setChatLoading(false);
    }
  };
  
  const fetchDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setApiError("");
    try {
      const res = await api.get("/dashboard/");
      setVitals({
        wellbeing_index: res.data.wellbeing_index,
        stress_risk: res.data.stress_risk,
        mood: res.data.mood,
        sleep: res.data.sleep,
        water: res.data.water,
        steps: res.data.steps,
        screen_time: res.data.screen_time,
        burnout_risk: res.data.burnout_risk,
        recovery_score: res.data.recovery_score,
        wearable_connected: res.data.wearable_connected,
        journal_streak: res.data.journal_streak,
        user_profile: res.data.user_profile
      });
      setWeeklyTrend(res.data.weekly_trend);
      setTodayWin(res.data.today_win);
      setWillaReflection(res.data.willa_reflection);
    } catch (err) {
      setApiError(err.response?.data?.detail || "Failed to sync metrics from database.");
      addToast("Failed to fetch latest wellbeing statistics.", "error");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  // Post new biometrics log to database
  const logUpdatedBiometrics = async (updatedFields) => {
    try {
      const payload = {
        mood: updatedFields.mood ?? vitals.mood,
        sleep: updatedFields.sleep ?? vitals.sleep,
        steps: updatedFields.steps ?? vitals.steps,
        water: updatedFields.water ?? vitals.water,
        screen_time: updatedFields.screen_time ?? vitals.screen_time,
        wearable_connected: vitals.wearable_connected
      };
      
      const res = await api.post("/wellbeing/", payload);
      
      // Update values with computed scores from response
      setVitals(prev => ({
        ...prev,
        ...res.data
      }));
      
      // Silently refresh dashboard aggregates to update trend graphics & Willa advisory
      fetchDashboardData(false);
    } catch (err) {
      setApiError("Failed to save updated telemetry metrics.");
      addToast("Failed to update daily parameters.", "error");
    }
  };

  // Add 250ml water intake
  const addWater = async () => {
    if (isWaterUpdating) return;
    setIsWaterUpdating(true);
    const targetWater = Number((vitals.water + 0.25).toFixed(2));
    
    // Optimistic UI update
    setVitals(prev => ({ ...prev, water: targetWater }));
    addToast("Hydration metrics logged (+250ml).", "success");
    
    await logUpdatedBiometrics({ water: targetWater });
    setIsWaterUpdating(false);
  };

  // Reset water log
  const resetWater = async () => {
    setVitals(prev => ({ ...prev, water: 0 }));
    addToast("Hydration metrics cleared.", "info");
    await logUpdatedBiometrics({ water: 0 });
  };

  // Sync wearables simulated steps
  const simulateStepSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const addedSteps = vitals.steps + Math.floor(Math.random() * 200) + 100;
    
    // Optimistic UI update
    setVitals(prev => ({ ...prev, steps: addedSteps }));
    addToast("Synced steps count from companion app.", "success");
    
    await logUpdatedBiometrics({ steps: addedSteps });
    setIsSyncing(false);
  };

  const handleLogoutClick = () => {
    logout();
    addToast("Account locked.", "info");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-warm-bg text-charcoal-text flex relative overflow-hidden font-sans">
      
      {/* Soft Calming Mesh Glows */}
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-brand-sage/10 blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none animate-pulse-slow" />
      
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-neutral-border bg-sidebar-bg hidden lg:flex flex-col justify-between p-6 shrink-0 z-30 relative shadow-xs">
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
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all outline-none cursor-pointer ${
                activeTab === "overview"
                  ? "bg-brand-sage/25 border-l-4 border-brand-sage text-charcoal-text"
                  : "text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-brand-teal" />
                <span>My Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-45" />
            </button>

            <button
              onClick={() => navigate("/journal")}
              className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                <span>Wellbeing Journal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>

            <button
              onClick={() => navigate("/community")}
              className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-brand-teal" />
                <span>Impact Circles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-brand-purple" />
                <span>Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-neutral-border pt-6">
          <button
            onClick={handleLogoutClick}
            className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-charcoal-light hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-3 cursor-pointer outline-none"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
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
                  <Link to="/" className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-brand-teal" />
                    <span className="font-display font-bold text-charcoal-text">WellWish AI</span>
                  </Link>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-full text-charcoal-light hover:text-charcoal-text">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  <button
                    onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 bg-brand-sage/20 text-charcoal-text"
                  >
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
                  <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-charcoal-light hover:text-charcoal-text">
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
            <h2 className="text-xs text-charcoal-light font-mono hidden sm:inline">WELLWISH WORKSPACE COMPANION // LIVE</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-full bg-warm-bg text-charcoal-light hover:text-charcoal-text cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-teal rounded-full" />
            </div>
            <Link to="/profile" className="p-2 rounded-full bg-warm-bg text-charcoal-light hover:text-charcoal-text">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
          
          {/* Error Banner */}
          {apiError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-600 text-xs flex gap-2.5 items-center animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="flex-1 font-semibold">{apiError}</span>
              <button onClick={() => setApiError("")} className="text-rose-600 hover:text-charcoal-text font-bold ml-2">✕</button>
            </div>
          )}

          {/* Welcome Greeting & Streaks Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-card-bg border border-neutral-border p-6 rounded-[24px] gap-4 shadow-xs">
            <div>
              <h1 className="text-xl font-extrabold text-charcoal-text font-display">
                Hello, {loading ? "..." : vitals.user_profile?.full_name || "WellWisher"}
              </h1>
              <p className="text-xs text-charcoal-light mt-1 font-light">
                Your AI Decision Intelligence workspace is active and calibrated.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Journal Streak */}
              <div className="flex items-center gap-2.5 px-4 py-2 bg-brand-purple/10 border border-brand-purple/20 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-charcoal-light uppercase font-mono tracking-wider">Journal Streak</span>
                  <span className="text-xs font-bold text-charcoal-text">{vitals.journal_streak || 0} Days</span>
                </div>
              </div>
              
              {/* Today's Goal */}
              <div className="flex items-center gap-2.5 px-4 py-2 bg-brand-teal/10 border border-brand-teal/20 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-brand-teal" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-charcoal-light uppercase font-mono tracking-wider">Today's Focus</span>
                  <span className="text-xs font-bold text-charcoal-text">
                    {vitals.wellbeing_index !== null && vitals.wellbeing_index !== undefined
                      ? (vitals.wellbeing_index >= 80 ? "Sustain Balance" : "Active Recovery")
                      : "Complete Check-in"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 1: Wellbeing Index, AI Willa Reflection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            
            {/* Index card */}
            <div className="lg:col-span-5 relative p-[1px] rounded-3xl bg-neutral-border shadow-xs">
              {loading ? (
                <SkeletonLoader type="index" />
              ) : (
                (() => {
                  const hasVitalsData = vitals && vitals.wellbeing_index !== null && vitals.wellbeing_index !== undefined;
                  return (
                    <div className="relative h-full bg-card-bg rounded-[23px] p-6 flex flex-col justify-between overflow-hidden border border-neutral-border">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-sage/10 blur-[40px] pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xs font-bold text-charcoal-text tracking-wider">WELLBEING BALANCE INDEX</h3>
                          <p className="text-[10px] text-charcoal-light mt-1">Calibrated from {vitals.wearable_connected ? "5 wellness indicators" : "cognitive & psychological reflections"}</p>
                        </div>
                        
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sage/20 text-charcoal-text border border-brand-sage/30 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-sage animate-ping" />
                          <span>{hasVitalsData ? (vitals.stress_risk === "Minimal" ? "Calm & Centered" : vitals.stress_risk) : "No log today"}</span>
                        </span>
                      </div>

                      {/* Score Dial */}
                      <div className="flex items-center justify-center py-4">
                        <div className="w-36 h-36 relative flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="72" cy="72" r="62" stroke="#F1F1ED" strokeWidth="6" fill="none" />
                            <circle
                              cx="72"
                              cy="72"
                              r="62"
                              stroke="url(#calm-gradient)"
                              strokeWidth="8"
                              strokeDasharray="390"
                              strokeDashoffset={hasVitalsData ? 390 - (390 * vitals.wellbeing_index) / 100 : 390}
                              strokeLinecap="round"
                              fill="none"
                              className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                              <linearGradient id="calm-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#A8D5BA" />
                                <stop offset="50%" stopColor="#8FD3D1" />
                                <stop offset="100%" stopColor="#DCCEF9" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute text-center flex flex-col">
                            <span className="text-4xl font-extrabold text-charcoal-text tracking-tight font-display">{hasVitalsData ? vitals.wellbeing_index : "--"}</span>
                            <span className="text-[10px] text-charcoal-light font-semibold tracking-wider mt-0.5">SCORE</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 text-[10px] text-charcoal-light p-2.5 bg-warm-bg border border-neutral-border rounded-xl">
                        <CheckCircle className="w-4 h-4 text-brand-teal shrink-0" />
                        <span>
                          {hasVitalsData ? (
                            `Your index is active (${vitals.wearable_connected ? "Wearable Mode" : "Standalone Mode"}). Burnout: ${vitals.burnout_risk || "Low"}, Recovery: ${vitals.recovery_score || "--"}/100.`
                          ) : (
                            "Calibrate your index by logging your first check-in today."
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Willa AI Reflection & Today's Win */}
            <div className="lg:col-span-7 flex flex-col gap-6 justify-between animate-fade-in">
              
              <div className="relative p-[1px] rounded-3xl bg-neutral-border flex-1 shadow-xs">
                {loading ? (
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 h-full min-h-[180px] animate-pulse flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-40 bg-white/5 rounded" />
                      <div className="h-3 w-full bg-white/5 rounded" />
                      <div className="h-3 w-3/4 bg-white/5 rounded" />
                    </div>
                    <div className="h-7 w-24 bg-white/5 rounded-lg" />
                  </div>
                ) : (
                  <div className="relative h-full bg-card-bg rounded-[23px] p-6 flex flex-col justify-between overflow-hidden border border-neutral-border">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-sage/10 blur-[40px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-neutral-border pb-3.5 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-brand-sage/20 border border-brand-sage/30 rounded-full text-charcoal-text">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-charcoal-text">Reflections from Willa</h4>
                          <p className="text-[9px] text-charcoal-light">Your supportive wellness companion</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-charcoal-light/75 font-mono">Calming Guidance</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <p className="text-charcoal-light text-xs leading-relaxed font-light italic">
                        {willaReflection ? `"${willaReflection.wellbeing_summary} ${willaReflection.stress_risk_explanation}"` : '"Complete your daily check-in or log a journal entry to generate custom companion reflections."'}
                      </p>

                      {willaReflection?.positive_reinforcement && (
                        <div className="p-3 bg-brand-sage/10 border border-brand-sage/20 rounded-2xl text-[11px] text-charcoal-text leading-relaxed font-light flex items-start gap-2.5">
                          <Sparkles className="w-4.5 h-4.5 text-brand-teal shrink-0 mt-0.5" />
                          <span>{willaReflection.positive_reinforcement}</span>
                        </div>
                      )}

                      {willaReflection?.personalized_suggestions && willaReflection.personalized_suggestions.length > 0 && (
                        <div className="pt-3 border-t border-neutral-border flex flex-col gap-2">
                          <h5 className="text-[10px] font-bold text-charcoal-text uppercase tracking-wider">Suggested Micro-habits</h5>
                          <div className="flex flex-col gap-2">
                            {willaReflection.personalized_suggestions.map((sug, i) => (
                              <div key={i} className="p-2.5 bg-warm-bg border border-neutral-border rounded-xl text-xs text-charcoal-text leading-normal font-light flex items-start gap-2">
                                <span className="text-brand-teal font-bold shrink-0 mt-0.5">•</span>
                                <span>{sug}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => navigate("/checkin")}
                        className="px-4 py-2 rounded-full bg-brand-sage hover:bg-brand-teal text-charcoal-text font-bold text-[10px] transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                      >
                        <Smile className="w-3.5 h-3.5" />
                        <span>Daily Check-in</span>
                      </button>
                      <span className="text-[10px] text-charcoal-light/70 font-medium">Safe & Supported</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Today's Win */}
              <div className="p-[1px] rounded-3xl bg-neutral-border shadow-xs">
                {loading ? (
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5" />
                      <div className="flex flex-col gap-1.5">
                        <div className="h-3 w-16 bg-white/5 rounded" />
                        <div className="h-2.5 w-32 bg-white/5 rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-12 bg-white/5 rounded" />
                  </div>
                ) : (
                  <div className="rounded-[23px] p-5 flex items-center justify-between bg-card-bg border border-neutral-border">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 bg-brand-purple/20 rounded-full text-charcoal-text">
                        <Award className="w-4.5 h-4.5 text-brand-purple" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-charcoal-text">Today's Win</h4>
                        <p className="text-[10px] text-charcoal-light font-light mt-0.5">{todayWin || "Let's track parameters and log a journal reflections today."}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-teal font-bold bg-brand-teal/20 px-2.5 py-1 rounded-full border border-brand-teal/30">Active</span>
                  </div>
                )}
              </div>

            </div>

          </div>
          {/* Row 2: Interactive Health Metrics Grid */}
          <div>
            <h3 className="text-xs font-bold text-charcoal-light tracking-wider mb-5">WELLNESS INDICATORS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
              
              {loading ? (
                <>
                  <SkeletonLoader type="metric" />
                  <SkeletonLoader type="metric" />
                  <SkeletonLoader type="metric" />
                  <SkeletonLoader type="metric" />
                  <SkeletonLoader type="metric" />
                  <SkeletonLoader type="metric" />
                  <SkeletonLoader type="metric" />
                </>
              ) : (
                <>
                  {/* Sleep */}
                  <div className="bg-card-bg p-5 rounded-3xl border border-neutral-border hover:border-brand-sage transition-colors flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Sleep Summary</span>
                      <Moon className="w-4 h-4 text-brand-purple" />
                    </div>
                    <div className="mt-4">
                      <div className="text-xl font-extrabold text-charcoal-text">{vitals.sleep !== null && vitals.sleep !== undefined ? `${vitals.sleep}h` : "-- h"}</div>
                      <div className="text-[9px] text-charcoal-light mt-1 font-medium">Daily rest duration</div>
                    </div>
                    <div className="mt-3 w-full bg-warm-bg h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-purple h-full" style={{ width: `${Math.min(100, ((vitals.sleep || 0) / 8) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Water */}
                  <div className="bg-card-bg p-5 rounded-3xl border border-neutral-border hover:border-brand-sage transition-colors flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Hydration Progress</span>
                      <Droplet className="w-4 h-4 text-brand-teal" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <div>
                        <div className="text-xl font-extrabold text-charcoal-text">{vitals.water !== null && vitals.water !== undefined ? `${vitals.water}L` : "0 L"}</div>
                        <div className="text-[9px] text-charcoal-light mt-0.5">Target: 2.5L</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={addWater}
                          disabled={isWaterUpdating}
                          className="p-1 rounded-full bg-warm-bg hover:bg-neutral-border border border-neutral-border text-brand-teal hover:text-charcoal-text cursor-pointer transition-colors"
                          title="Add 250ml"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        {vitals.water > 0 && (
                          <button
                            onClick={resetWater}
                            className="p-1 rounded-full bg-warm-bg hover:bg-neutral-border border border-neutral-border text-charcoal-light hover:text-charcoal-text cursor-pointer transition-colors"
                            title="Reset Log"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-warm-bg h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-teal h-full transition-all duration-300" style={{ width: `${Math.min(100, ((vitals.water || 0) / 2.5) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Card 3: Steps or Wearables link */}
                  {vitals.wearable_connected ? (
                    <div className="bg-card-bg p-5 rounded-3xl border border-neutral-border hover:border-brand-sage transition-colors flex flex-col justify-between min-h-[140px] shadow-xs">
                      <div className="flex items-center justify-between text-charcoal-light">
                        <span className="text-[9px] font-bold tracking-wider uppercase">Steps Balance</span>
                        <Flame className="w-4 h-4 text-brand-teal" />
                      </div>
                      <div className="mt-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-extrabold text-charcoal-text">{vitals.steps !== null && vitals.steps !== undefined ? vitals.steps.toLocaleString() : "0"}</span>
                          <button
                            disabled={isSyncing}
                            onClick={simulateStepSync}
                            className={`text-[8px] font-bold bg-brand-sage/20 border border-brand-sage/30 px-2 py-0.5 rounded-full cursor-pointer hover:bg-brand-sage transition-all ${isSyncing && "animate-pulse"}`}
                          >
                            {isSyncing ? "Syncing..." : "Sync"}
                          </button>
                        </div>
                        <div className="text-[9px] text-charcoal-light mt-1">Goal: 10,000 steps</div>
                      </div>
                      <div className="mt-3 w-full bg-warm-bg h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-sage h-full transition-all duration-300" style={{ width: `${Math.min(100, ((vitals.steps || 0) / 10000) * 100)}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card-bg p-5 rounded-3xl border border-neutral-border hover:border-brand-sage transition-colors flex flex-col justify-between min-h-[140px] shadow-xs">
                      <div className="flex items-center justify-between text-charcoal-light">
                        <span className="text-[9px] font-bold tracking-wider uppercase">Steps / Wearables</span>
                        <Flame className="w-4 h-4 text-charcoal-light" />
                      </div>
                      <div className="mt-2">
                        <div className="text-[13px] font-bold text-charcoal-text">No Device Sync</div>
                        <button
                          onClick={() => navigate("/profile")}
                          className="mt-1 text-[8px] font-bold text-brand-purple hover:underline cursor-pointer"
                        >
                          Sync Apple Watch / Fitbit
                        </button>
                      </div>
                      <div className="mt-3 w-full bg-warm-bg h-1.5 rounded-full overflow-hidden">
                        <div className="bg-neutral-border h-full" style={{ width: "0%" }} />
                      </div>
                    </div>
                  )}

                  {/* Mood Status */}
                  <div className="bg-card-bg p-5 rounded-3xl border border-neutral-border hover:border-brand-sage transition-colors flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Mood Status</span>
                      <Smile className="w-4 h-4 text-brand-teal" />
                    </div>
                    <div className="mt-4">
                      <div className="text-xl font-extrabold text-charcoal-text">{vitals.mood !== null && vitals.mood !== undefined ? vitals.mood : "Not Calibrated"}</div>
                      <div className="text-[9px] text-charcoal-light mt-1 font-semibold">{vitals.mood ? "Mood rhythm stable" : "Complete check-in"}</div>
                    </div>
                    <div className="mt-3 w-full bg-warm-bg h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-teal h-full" style={{ width: vitals.mood ? "100%" : "0%" }} />
                    </div>
                  </div>

                  {/* Recovery Score */}
                  <div className="bg-card-bg p-5 rounded-3xl border border-neutral-border hover:border-brand-sage transition-colors flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Recovery Score</span>
                      <Heart className="w-4 h-4 text-brand-teal animate-pulse" />
                    </div>
                    <div className="mt-4">
                      <div className="text-xl font-extrabold text-charcoal-text">{vitals.recovery_score !== null && vitals.recovery_score !== undefined ? `${vitals.recovery_score}/100` : "--"}</div>
                      <div className="text-[9px] text-charcoal-light mt-1 font-semibold">Homeostatic recharge</div>
                    </div>
                    <div className="mt-3 w-full bg-warm-bg h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-teal h-full transition-all duration-300" style={{ width: `${vitals.recovery_score || 0}%` }} />
                    </div>
                  </div>

                  {/* Burnout Risk */}
                  <div className="bg-card-bg p-5 rounded-3xl border border-neutral-border hover:border-brand-sage transition-colors flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Burnout Risk</span>
                      <Brain className="w-4 h-4 text-brand-purple" />
                    </div>
                    <div className="mt-4">
                      <div className="text-xl font-extrabold text-charcoal-text">{vitals.burnout_risk !== null && vitals.burnout_risk !== undefined ? vitals.burnout_risk : "Low"}</div>
                      <div className="text-[9px] text-charcoal-light mt-1 font-semibold">{vitals.burnout_risk === "High" ? "High fatigue markers" : "Rhythms stable"}</div>
                    </div>
                    <div className="mt-3 w-full bg-warm-bg h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-purple h-full" style={{ width: vitals.burnout_risk === "High" ? "100%" : vitals.burnout_risk === "Moderate" ? "50%" : "20%" }} />
                    </div>
                  </div>

                  {/* Screen Time */}
                  <div className="bg-card-bg p-5 rounded-3xl border border-neutral-border hover:border-brand-sage transition-colors flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Screen Time</span>
                      <Smartphone className="w-4 h-4 text-brand-purple" />
                    </div>
                    <div className="mt-4">
                      <div className="text-xl font-extrabold text-charcoal-text">{vitals.screen_time !== null && vitals.screen_time !== undefined ? `${vitals.screen_time}h` : "-- h"}</div>
                      <div className="text-[9px] text-charcoal-light mt-1 font-light">Screens exposure limit</div>
                    </div>
                    <div className="mt-3 w-full bg-warm-bg h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-purple h-full" style={{ width: `${Math.min(100, ((vitals.screen_time || 0) / 6) * 100)}%` }} />
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Row 3: Weekly Homeostasis trend chart */}
          <div className="p-[1px] rounded-3xl bg-neutral-border shadow-xs">
            {loading ? (
              <SkeletonLoader type="graph" />
            ) : (
              <div className="bg-card-bg rounded-[23px] p-6 border border-neutral-border">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-border pb-4 mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-brand-teal" />
                      <h3 className="text-sm font-bold text-charcoal-text">Weekly Wellbeing Trends</h3>
                    </div>
                    <p className="text-[10px] text-charcoal-light mt-1">Calibrated from daily indicators</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-charcoal-light">
                    <button
                      onClick={fetchWeeklyReflection}
                      className="px-3.5 py-1.5 rounded-full bg-brand-purple/20 hover:bg-brand-purple/30 text-charcoal-text font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1.5 border border-brand-purple/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                      <span>Analyze Weekly Rhythm</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-brand-sage" />
                      <span>Wellbeing Score</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-brand-purple/60" />
                      <span>Stress Level</span>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full">
                  {weeklyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={weeklyTrend}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorWellbeing" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A8D5BA" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#A8D5BA" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DCCEF9" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#DCCEF9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,58,58,0.05)" vertical={false} />

                        <XAxis
                          dataKey="day"
                          tick={{ fill: "#4F5E5E", fontSize: 10, fontFamily: "monospace" }}
                          axisLine={{ stroke: "rgba(46,58,58,0.06)" }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: "#4F5E5E", fontSize: 10, fontFamily: "monospace" }}
                          axisLine={{ stroke: "rgba(46,58,58,0.06)" }}
                          tickLine={false}
                        />
                        
                        <Tooltip
                          contentStyle={{
                            background: "rgba(252, 250, 246, 0.95)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid var(--color-neutral-border)",
                            borderRadius: "16px",
                            padding: "10px",
                          }}
                          itemStyle={{ fontSize: "11px", fontFamily: "sans-serif", color: "#1F2929" }}
                          labelStyle={{ fontSize: "10px", color: "#455252", fontWeight: "bold", marginBottom: "4px" }}
                        />

                        <Area
                          type="monotone"
                          dataKey="wellbeing"
                          stroke="#A8D5BA"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorWellbeing)"
                          name="Wellbeing Score"
                        />
                        <Area
                          type="monotone"
                          dataKey="stress"
                          stroke="#DCCEF9"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorStress)"
                          name="Stress Level"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-charcoal-light py-10">
                      <TrendingUp className="w-8 h-8 text-neutral-border mb-2" />
                      <span className="text-xs font-semibold">Not enough history logs to show weekly trend yet.</span>
                      <span className="text-[10px] text-charcoal-light/70 mt-1">Complete your check-in logs over the week to populate this chart.</span>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Row 4: Willa AI Decision Intelligence Blueprint */}
          {!loading && willaReflection && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h3 className="text-xs font-bold text-charcoal-light tracking-wider uppercase">Willa AI Decision Intelligence</h3>
              
              {/* Rhythm Shift Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Wellbeing Shift */}
                <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 text-charcoal-light">
                    <TrendingUp className="w-4 h-4 text-brand-teal" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">Wellbeing Trend Decoder</span>
                  </div>
                  <p className="text-xs text-charcoal-text font-light leading-relaxed">
                    {willaReflection.wellbeing_trend_analysis || "Your wellbeing rhythm shows steady parameters today. Keep logging to identify long-term improvements."}
                  </p>
                  <div className="text-[9px] font-mono text-brand-teal mt-1 font-semibold uppercase">Explainable Insight</div>
                </div>

                {/* Stress Shift */}
                <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 text-charcoal-light">
                    <Brain className="w-4 h-4 text-brand-purple" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">Stress Load Decoder</span>
                  </div>
                  <p className="text-xs text-charcoal-text font-light leading-relaxed">
                    {willaReflection.stress_trend_analysis || "Cortisol baseline and stress fatigue markers are holding within normal parameters."}
                  </p>
                  <div className="text-[9px] font-mono text-brand-purple mt-1 font-semibold uppercase">Explainable Insight</div>
                </div>
              </div>

              {/* Action Blueprint Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Daily Priorities */}
                <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-neutral-border pb-3">
                    <CheckCircle className="w-4 h-4 text-brand-teal" />
                    <h4 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Today's Action Priorities</h4>
                  </div>
                  <div className="flex flex-col gap-3 flex-1 justify-center">
                    {willaReflection.daily_priorities && willaReflection.daily_priorities.length > 0 ? (
                      willaReflection.daily_priorities.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-2 bg-warm-bg/50 border border-neutral-border/55 rounded-xl text-xs text-charcoal-text">
                          <input type="checkbox" className="mt-0.5 rounded text-brand-teal focus:ring-brand-teal cursor-pointer" />
                          <span className="font-light leading-normal">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-charcoal-light italic font-light">No daily priorities calibrated. Complete your check-in.</p>
                    )}
                  </div>
                </div>

                {/* Vitals Calibration */}
                <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-neutral-border pb-3">
                    <Moon className="w-4 h-4 text-brand-purple" />
                    <h4 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Vitals Optimization</h4>
                  </div>
                  <div className="flex flex-col gap-4 flex-1 justify-between">
                    {/* Sleep Advice */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-charcoal-light tracking-wide uppercase">Sleep Recommendation</span>
                      <p className="text-xs text-charcoal-text font-light leading-relaxed">
                        {willaReflection.sleep_recommendations || "Prioritize a dark, quiet environment and limit screens 30 minutes before rest."}
                      </p>
                    </div>
                    {/* Hydration Advice */}
                    <div className="flex flex-col gap-1.5 border-t border-neutral-border/60 pt-3">
                      <span className="text-[9px] font-bold text-charcoal-light tracking-wide uppercase">Hydration Protocol</span>
                      <p className="text-xs text-charcoal-text font-light leading-relaxed">
                        {willaReflection.hydration_advice || "Log your water intake to receive real-time cellular hydration advice."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Workplace Pacing */}
                <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-neutral-border pb-3">
                    <Smartphone className="w-4 h-4 text-brand-teal" />
                    <h4 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Workplace Pacing</h4>
                  </div>
                  <div className="flex flex-col gap-4 flex-1 justify-between">
                    {/* Break Reminders */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-charcoal-light tracking-wide uppercase">Break Reminder</span>
                      <p className="text-xs text-charcoal-text font-light leading-relaxed">
                        {willaReflection.break_reminders || "Observe visual rest periods between computer tasks to restore focus."}
                      </p>
                    </div>
                    {/* Recovery Suggestions */}
                    <div className="flex flex-col gap-1.5 border-t border-neutral-border/60 pt-3">
                      <span className="text-[9px] font-bold text-charcoal-light tracking-wide uppercase">Recovery Blueprint</span>
                      <p className="text-xs text-charcoal-text font-light leading-relaxed">
                        {willaReflection.recovery_suggestions || "Balance your stress load with box breathing cycles."}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Responsible AI Disclaimer Footer */}
          {!loading && willaReflection && (
            <div className="text-center text-[10px] text-charcoal-light/70 font-mono tracking-wider max-w-2xl mx-auto border-t border-neutral-border pt-6 mt-4 leading-relaxed">
              ⚠ NOTE: {willaReflection.responsible_ai_disclaimer}
            </div>
          )}

        </main>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChatDrawer(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-brand-sage text-charcoal-text hover:bg-brand-teal shadow-lg hover:scale-105 transition-all duration-300 z-40 cursor-pointer flex items-center gap-2 border border-brand-sage/30 animate-fade-in"
      >
        <MessageSquare className="w-5 h-5 text-charcoal-text" />
        <span className="text-xs font-bold font-display tracking-tight text-charcoal-text">Chat with Willa</span>
      </button>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {showChatDrawer && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 w-full max-w-sm h-[450px] bg-card-bg border border-neutral-border rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-border flex justify-between items-center bg-sidebar-bg">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-sage/20 border border-brand-sage/30 rounded-full text-brand-teal">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-text">Willa Assistant</h4>
                  <p className="text-[9px] text-charcoal-light">Companion AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatDrawer(false)}
                className="p-1 rounded-full hover:bg-neutral-border text-charcoal-light hover:text-charcoal-text transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed font-light ${
                      msg.role === "user"
                        ? "bg-brand-sage text-charcoal-text rounded-tr-none"
                        : "bg-warm-bg border border-neutral-border text-charcoal-text rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-warm-bg border border-neutral-border p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-[10px] text-charcoal-light">
                    <Loader2 className="w-3 h-3 animate-spin text-brand-purple" />
                    <span>Willa is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-neutral-border flex gap-2 bg-sidebar-bg">
              <input
                type="text"
                disabled={chatLoading}
                placeholder="Ask Willa about sleep, hydration, screen breaks..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-card-bg text-xs border border-neutral-border rounded-xl outline-none focus:border-brand-sage text-charcoal-text placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 bg-brand-sage hover:bg-brand-teal text-charcoal-text rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Reflection Modal */}
      <AnimatePresence>
        {showWeeklyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-card-bg border border-neutral-border rounded-[32px] p-6 shadow-xl relative overflow-hidden flex flex-col gap-5 max-h-[90vh]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 blur-[40px] pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-neutral-border pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-purple" />
                  <h3 className="font-display font-bold text-base text-charcoal-text">Willa's Weekly Reflections</h3>
                </div>
                <button
                  onClick={() => setShowWeeklyModal(false)}
                  className="p-1.5 rounded-full hover:bg-warm-bg text-charcoal-light hover:text-charcoal-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {weeklyLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-charcoal-light">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                  <span className="text-xs font-medium">Synthesizing weekly telemetry...</span>
                </div>
              ) : weeklyReflection ? (
                <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                  
                  {/* Summary */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-charcoal-light tracking-wide">WEEKLY RHYTHM REPORT</span>
                    <p className="text-xs text-charcoal-text leading-relaxed font-light italic">
                      "{weeklyReflection.weekly_summary}"
                    </p>
                  </div>

                  {/* Accomplishments */}
                  {weeklyReflection.key_accomplishments && (
                    <div className="flex flex-col gap-2 border-t border-neutral-border pt-4">
                      <span className="text-[10px] font-bold text-charcoal-light tracking-wide uppercase font-mono">Key Accomplishments</span>
                      <div className="flex flex-col gap-2">
                        {weeklyReflection.key_accomplishments.map((acc, i) => (
                          <div key={i} className="p-3 bg-brand-sage/10 border border-brand-sage/20 rounded-2xl text-xs text-charcoal-text flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-brand-sage shrink-0" />
                            <span className="font-light">{acc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {weeklyReflection.pacing_suggestions && (
                    <div className="flex flex-col gap-2 border-t border-neutral-border pt-4">
                      <span className="text-[10px] font-bold text-charcoal-light tracking-wide uppercase font-mono">Suggested Pacing Actions</span>
                      <div className="flex flex-col gap-2">
                        {weeklyReflection.pacing_suggestions.map((sug, i) => (
                          <div key={i} className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-2xl text-xs text-charcoal-text flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-brand-purple shrink-0" />
                            <span className="font-light">{sug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Encouragement */}
                  {weeklyReflection.encouragement && (
                    <p className="text-[11px] text-brand-teal font-medium mt-2 border-t border-neutral-border pt-4">
                      ★ {weeklyReflection.encouragement}
                    </p>
                  )}
                  
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-charcoal-light">
                  No reflection summaries generated. Click close and try again.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
