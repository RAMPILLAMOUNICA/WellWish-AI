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
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Heart,
  Users,
  ArrowLeft,
  Shield,
  Sparkles,
  TrendingUp,
  Brain,
  Smile,
  Activity,
  Award,
  Loader2,
  AlertCircle,
  Menu,
  X,
  LogOut,
  User,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SkeletonLoader from "../components/SkeletonLoader";
import api from "../services/api";

export default function Community() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Community aggregated statistics states
  const [workspaceAvgIndex, setWorkspaceAvgIndex] = useState(84.6);
  const [moodData, setMoodData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [stressFactors, setStressFactors] = useState([]);
  const [highlights, setHighlights] = useState([]);

  // Fetch insights
  useEffect(() => {
    const fetchCommunityInsights = async () => {
      setApiError("");
      try {
        const res = await api.get("/community/insights");
        setWorkspaceAvgIndex(res.data.average_wellbeing_index);
        setMoodData(res.data.mood_distribution);
        setTrendsData(res.data.weekly_trends);
        setStressFactors(res.data.common_stress_factors);
        setHighlights(res.data.positive_insights);
      } catch (err) {
        setApiError("Failed to synchronize workspace community statistics.");
        addToast("Failed to sync workspace aggregates.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityInsights();
  }, []);

  const handleLogoutClick = () => {
    logout();
    addToast("Vault locked.", "info");
    navigate("/login");
  };

  // Theme colors for PieChart sections: Sage green, Soft teal, Lavender
  const COLORS = ["#8CB89F", "#6CA6A4", "#AB99D4"];

  return (
    <div className="min-h-screen bg-warm-bg text-charcoal-text flex relative overflow-hidden font-sans">
      
      {/* Dynamic Mesh Glows */}
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-brand-sage/10 blur-[100px] pointer-events-none animate-pulse-slow" />
      
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
            <button onClick={() => navigate("/community")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between bg-brand-sage/20 border-l-4 border-brand-sage text-charcoal-text transition-all outline-none cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-brand-teal" />
                <span>Impact Circles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-brand-purple" />
                <span>Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
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
                  <button onClick={() => { navigate("/community"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 bg-brand-sage/20 text-charcoal-text">
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
            <h2 className="text-xs text-charcoal-light font-mono hidden sm:inline">WORKSPACE COMMUNITY ANALYTICS // READ ONLY</h2>
          </div>
          <Link to="/dashboard" className="text-xs font-semibold text-charcoal-light hover:text-charcoal-text flex items-center gap-1.5 px-4 py-2 rounded-full bg-card-bg border border-neutral-border shadow-xs">
            <ArrowLeft className="w-4 h-4 text-charcoal-light" />
            <span>Dashboard</span>
          </Link>
        </header>

        <main className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
          
          {/* Error Banner */}
          {apiError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-600 text-xs flex gap-2.5 items-center">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="flex-1 font-semibold">{apiError}</span>
            </div>
          )}

          {/* Row 1: Workspace Stats & Mood Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            
            {/* Index dial */}
            <div className="lg:col-span-4 relative p-[1px] rounded-3xl bg-neutral-border shadow-xs">
              {loading ? (
                <SkeletonLoader type="index" />
              ) : (
                (() => {
                  const hasWorkspaceData = workspaceAvgIndex !== null && workspaceAvgIndex !== undefined && workspaceAvgIndex !== 0;
                  return (
                    <div className="relative h-full bg-card-bg rounded-[23px] p-6 flex flex-col justify-between overflow-hidden min-h-[220px] border border-neutral-border animate-fade-in">
                      <div>
                        <h3 className="text-xs font-bold text-charcoal-text tracking-wider">WORKSPACE WELLBEING SCORE</h3>
                        <p className="text-[10px] text-charcoal-light mt-0.5">Average score across active members</p>
                      </div>

                      <div className="my-4 text-center flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-charcoal-text tracking-tighter bg-gradient-to-r from-brand-sage to-brand-teal bg-clip-text text-transparent font-display">{hasWorkspaceData ? workspaceAvgIndex : "--"}</span>
                        <span className="text-[10px] text-brand-teal font-bold uppercase mt-1.5 px-2.5 py-0.5 rounded-full bg-brand-teal/20 border border-brand-teal/30">{hasWorkspaceData ? "Balanced State" : "No Data Yet"}</span>
                      </div>

                      <div className="text-[10px] text-charcoal-light flex gap-2 items-center bg-warm-bg border border-neutral-border p-3 rounded-2xl leading-relaxed">
                        <Shield className="w-4 h-4 text-brand-teal shrink-0" />
                        <span>Identity details are stored locally and kept private.</span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Mood distribution */}
            <div className="lg:col-span-8 relative p-[1px] rounded-3xl bg-neutral-border shadow-xs">
              {loading ? (
                <div className="glass-panel p-6 rounded-3xl border border-white/5 h-full min-h-[220px] animate-pulse flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-40 bg-white/5 rounded" />
                    <div className="h-2.5 w-48 bg-white/5 rounded" />
                  </div>
                  <div className="h-6 w-32 bg-white/5 rounded" />
                </div>
              ) : (
                <div className="bg-card-bg rounded-[23px] p-6 border border-neutral-border h-full flex flex-col sm:flex-row justify-between items-center gap-6 animate-fade-in">
                  {moodData && moodData.length > 0 ? (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Smile className="w-4 h-4 text-brand-teal" />
                          <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Mood Distribution</h3>
                        </div>
                        <p className="text-[10px] text-charcoal-light leading-relaxed font-light mb-4">
                          Workspace mood statistics show stable baseline patterns, suggesting consistent focus.
                        </p>
                        <div className="flex flex-col gap-2.5">
                          {moodData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              <span className="text-xs text-charcoal-light font-medium">{item.name === "Stable" ? "Calm & Stable" : item.name}:</span>
                              <span className="text-xs font-mono font-bold text-charcoal-text">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-40 h-40 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={moodData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {moodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: "rgba(252, 250, 246, 0.95)",
                                border: "1px solid var(--color-neutral-border)",
                                borderRadius: "16px",
                                padding: "6px 10px"
                              }}
                              itemStyle={{ color: "#1F2929", fontSize: "11px" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 w-full text-charcoal-light">
                      <Smile className="w-8 h-8 text-neutral-border mb-2" />
                      <span className="text-xs font-semibold">No mood distributions logged yet.</span>
                      <span className="text-[10px] text-charcoal-light/70 mt-1">Workspace statistics are aggregated anonymously.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Row 2: Team trend graph */}
          <div className="p-[1px] rounded-3xl bg-neutral-border shadow-xs">
            {loading ? (
              <SkeletonLoader type="graph" />
            ) : (
              <div className="bg-card-bg rounded-[23px] p-6 border border-neutral-border animate-fade-in">
                
                <div className="flex items-center gap-2 mb-4 border-b border-neutral-border pb-4">
                  <TrendingUp className="w-4 h-4 text-brand-teal" />
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-text">Collective Homeostasis Trends</h3>
                    <p className="text-[10px] text-charcoal-light mt-0.5">Average weekly wellbeing indices compiled anonymously</p>
                  </div>
                </div>

                <div className="h-60 w-full">
                  {trendsData && trendsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCommunity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8CB89F" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8CB89F" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fill: "#455252", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#455252", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(252, 250, 246, 0.95)",
                            border: "1px solid var(--color-neutral-border)",
                            borderRadius: "16px",
                            padding: "10px"
                          }}
                          itemStyle={{ color: "#1F2929", fontSize: "11px" }}
                        />
                        <Area type="monotone" dataKey="wellbeing" stroke="#8CB89F" strokeWidth={2} fillOpacity={1} fill="url(#colorCommunity)" name="Average Wellbeing" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-charcoal-light py-10">
                      <TrendingUp className="w-8 h-8 text-neutral-border mb-2" />
                      <span className="text-xs font-semibold">No team trend data available.</span>
                      <span className="text-[10px] text-charcoal-light/70 mt-1">Aggregated logs will populate weekly graphs here once active.</span>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Row 3: Stress factors & Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Stress factors */}
            <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col justify-between gap-4 shadow-xs">
              {loading ? (
                <div className="animate-pulse flex flex-col gap-3 w-full">
                  <div className="h-4 w-32 bg-white/5 rounded" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-5/6 bg-white/5 rounded" />
                </div>
              ) : (
                <div className="animate-fade-in w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-brand-purple" />
                    <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Workspace Stress Factors</h3>
                  </div>
                  <p className="text-[10px] text-charcoal-light font-light mb-4">
                    Identified from biometric metrics across the team (e.g. sleep deficits, hydration gaps).
                  </p>
                  
                  {stressFactors && stressFactors.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {stressFactors.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-charcoal-light">
                            <span>{item.factor}</span>
                            <span className="font-mono">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-warm-bg h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-purple h-full" style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 w-full text-charcoal-light">
                      <Brain className="w-7 h-7 text-neutral-border mb-1.5" />
                      <span className="text-xs font-semibold">No stress markers logged yet.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* highlights */}
            <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs">
              {loading ? (
                <div className="animate-pulse flex flex-col gap-3 w-full">
                  <div className="h-4 w-32 bg-white/5 rounded" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-5/6 bg-white/5 rounded" />
                </div>
              ) : (
                <div className="animate-fade-in w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-brand-teal" />
                    <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Positive Workspace Trends</h3>
                  </div>
                  <p className="text-[10px] text-charcoal-light font-light mb-2">
                    Encouraging metrics highlighting healthy routines.
                  </p>
                  
                  {highlights && highlights.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {highlights.map((item, idx) => (
                        <div key={idx} className="p-3 bg-warm-bg border border-neutral-border rounded-2xl text-xs text-charcoal-text leading-relaxed font-light flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 w-full text-charcoal-light">
                      <Award className="w-7 h-7 text-neutral-border mb-1.5" />
                      <span className="text-xs font-semibold">No positive trends tracked yet.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
