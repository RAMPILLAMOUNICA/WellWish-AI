import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  BookOpen,
  Send,
  Sparkles,
  ArrowLeft,
  Plus,
  Smile,
  Meh,
  Frown,
  Loader2,
  AlertCircle,
  Menu,
  X,
  Activity,
  User,
  Users,
  LogOut,
  ChevronRight
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";

export default function Journal() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addToast } = useToast();
  
  const [entries, setEntries] = useState([]);
  const [newText, setNewText] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchJournalHistory = async () => {
    setApiError("");
    try {
      const res = await api.get("/journal/history");
      setEntries(res.data);
    } catch (err) {
      setApiError("Failed to fetch journal reflections.");
      addToast("Failed to fetch journal logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalHistory();
  }, []);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    
    setSubmitLoading(true);
    setApiError("");
    try {
      const res = await api.post("/journal/", { content: newText });
      setEntries(prev => [res.data, ...prev]);
      setNewText("");
      addToast("Journal entry analyzed and added successfully.", "success");
    } catch (err) {
      setApiError("Failed to save journal reflection.");
      addToast("Failed to save journal log.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    addToast("Vault locked.", "info");
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
            <button onClick={() => navigate("/journal")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between bg-brand-sage/20 border-l-4 border-brand-sage text-charcoal-text transition-all outline-none cursor-pointer">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                <span>Wellbeing Journal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
            <button onClick={() => navigate("/community")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-brand-teal" />
                <span>Impact Circles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
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
                  <button onClick={() => { navigate("/journal"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 bg-brand-sage/20 text-charcoal-text">
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
            <h2 className="text-xs text-charcoal-light font-mono hidden sm:inline">MY WELLBEING JOURNAL // SECURE</h2>
          </div>
          <Link to="/dashboard" className="text-xs font-semibold text-charcoal-light hover:text-charcoal-text flex items-center gap-1.5 px-4 py-2 rounded-full bg-card-bg border border-neutral-border shadow-xs">
            <ArrowLeft className="w-4 h-4 text-charcoal-light" />
            <span>Dashboard</span>
          </Link>
        </header>

        <main className="p-6 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
          
          {/* Error Banner */}
          {apiError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-600 text-xs flex gap-2.5 items-center animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="flex-1 font-semibold">{apiError}</span>
            </div>
          )}

          {/* Input box */}
          <div className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs">
            <h3 className="text-xs font-bold text-charcoal-light tracking-wider">ADD A DAILY REFLECTION</h3>
            <form onSubmit={handleAddEntry} className="flex flex-col gap-3">
              <textarea
                required
                rows="3"
                disabled={submitLoading}
                placeholder="How is your body and mind responding to your routine today?"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full p-4 bg-warm-bg rounded-2xl border border-neutral-border text-charcoal-text text-xs focus:ring-1 focus:ring-brand-sage outline-none placeholder:text-slate-400 resize-none"
              />
              <button
                type="submit"
                disabled={submitLoading || !newText.trim()}
                className="px-5 py-2.5 rounded-full bg-brand-sage text-charcoal-text font-bold text-xs hover:bg-brand-teal transition-all self-end flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-charcoal-text" />}
                <span>Analyze Reflection</span>
              </button>
            </form>
          </div>

          {/* Entries list */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold text-charcoal-light tracking-wider">PREVIOUS ENTRIES</h3>
            {loading ? (
              <SkeletonLoader type="list" />
            ) : entries.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Journal is Empty"
                description="No cognitive reflections logged. Type your mental state in the box above to generate companion decodes."
                actionText=""
              />
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="bg-card-bg p-6 rounded-3xl border border-neutral-border flex gap-4 animate-fade-in shadow-xs">
                  <div className="flex flex-col items-center">
                    <div className={`p-2.5 rounded-full border ${
                      entry.sentiment === "Calm" ? "bg-brand-sage/25 border-brand-sage/40 text-brand-teal" : entry.sentiment === "Strained" ? "bg-brand-purple/20 border-brand-purple/35 text-brand-purple" : "bg-warm-bg border-neutral-border text-charcoal-light"
                    }`}>
                      {entry.sentiment === "Calm" ? <Smile className="w-5 h-5" /> : <Meh className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-mono text-charcoal-light font-bold mt-2">{entry.sentiment_score ? `${Math.round(entry.sentiment_score * 100)}%` : "N/A"}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] text-charcoal-light">
                      <span className="font-mono">RefID: #{entry.id}</span>
                      <span className="text-brand-teal font-bold font-mono uppercase">{entry.sentiment}</span>
                    </div>
                    <p className="text-charcoal-text text-xs leading-relaxed font-light">"{entry.content}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

    </div>
  );
}
