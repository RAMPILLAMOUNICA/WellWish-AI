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
  ChevronRight,
  Lock,
  Edit,
  Trash2,
  Check
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import MobileNavBar from "../components/MobileNavBar";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";

export default function Journal() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addToast } = useToast();
  
  const [entries, setEntries] = useState([]);
  const [newText, setNewText] = useState(() => {
    return localStorage.getItem("wellwish_journal_draft") || "";
  });
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [lastFailedEntry, setLastFailedEntry] = useState("");

  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const getTodayISTString = () => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  };

  const getEntryDateISTString = (entry) => {
    const dateStr = entry.created_at || entry.timestamp || entry.analysis_timestamp;
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    } catch (e) {
      return "";
    }
  };

  const [selectedLogDate, setSelectedLogDate] = useState(() => getTodayISTString());
  const hasEntryForSelectedDate = entries.some(entry => getEntryDateISTString(entry) === selectedLogDate);
  const existingEntryForSelectedDate = entries.find(entry => getEntryDateISTString(entry) === selectedLogDate);

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reflection? This action cannot be undone.")) return;
    try {
      await api.delete(`/journal/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
      addToast("Journal entry deleted successfully.", "success");
      // Notify active pages to auto-refresh statistics
      window.dispatchEvent(new Event("wellwish_data_updated"));
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to delete journal reflection.";
      addToast(errorMsg, "error");
    }
  };

  const handleStartEdit = (entry) => {
    setEditingEntryId(entry.id);
    setEditingText(entry.content);
  };

  const handleSaveEdit = async (id) => {
    const cleanText = editingText.trim();
    if (!cleanText) {
      addToast("Journal entry content cannot be empty.", "error");
      return;
    }
    setEditLoading(true);
    try {
      const res = await api.put(`/journal/${id}`, { content: cleanText });
      setEntries(prev => {
        const updated = prev.map(e => e.id === id ? res.data : e);
        updated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return updated;
      });
      setEditingEntryId(null);
      setEditingText("");
      addToast("Journal entry updated and re-analyzed successfully.", "success");
      // Notify active pages to auto-refresh statistics
      window.dispatchEvent(new Event("wellwish_data_updated"));
    } catch (err) {
      const errorMsg = "Willa is taking a moment to reflect. Please check your connection and try again.";
      addToast(errorMsg, "error");
    } finally {
      setEditLoading(false);
    }
  };

  const MAX_CHARS = 500;

  // Auto-save draft while typing
  useEffect(() => {
    localStorage.setItem("wellwish_journal_draft", newText);
  }, [newText]);

  const fetchJournalHistory = async () => {
    setApiError("");
    try {
      const res = await api.get("/journal/history");
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setApiError(err.response?.data?.detail || "Failed to fetch journal reflections.");
      addToast("Failed to fetch journal logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalHistory();
  }, []);

  const handleAddEntry = async (e, retryText = "") => {
    if (e) e.preventDefault();
    setValidationErrors({});
    const cleanText = (retryText || newText).trim();
    
    if (!cleanText) {
      setValidationErrors({ content: "Journal entry content cannot be empty." });
      addToast("Please write a reflection before submitting.", "error");
      return;
    }
    
    setSubmitLoading(true);
    setApiError("");
    try {
      const payload = {
        content: cleanText,
        created_at: selectedLogDate ? `${selectedLogDate}T12:00:00Z` : undefined
      };
      const res = await api.post("/journal/", payload);
      setEntries(prev => {
        const updated = [res.data, ...prev];
        updated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return updated;
      });
      setNewText("");
      setLastFailedEntry("");
      setSelectedLogDate(getTodayISTString());
      localStorage.removeItem("wellwish_journal_draft");
      addToast("Journal entry analyzed and added successfully.", "success");
      // Notify active pages to auto-refresh statistics
      window.dispatchEvent(new Event("wellwish_data_updated"));
    } catch (err) {
      setLastFailedEntry(cleanText);
      const errorMsg = "Willa is taking a moment to reflect. Please check your connection and try again.";
      setApiError(errorMsg);
      addToast(errorMsg, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    addToast("Vault locked.", "info");
    navigate("/login");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recent entry";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
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
            <button onClick={() => navigate("/journal")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between bg-brand-sage/20 border-l-4 border-brand-sage text-charcoal-text transition-all outline-none cursor-pointer focus-ring">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                <span>Wellbeing Journal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
            <button onClick={() => navigate("/community")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer focus-ring">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-brand-teal" />
                <span>Impact Circles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold flex items-center justify-between text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 transition-all outline-none cursor-pointer focus-ring">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-brand-purple" />
                <span>Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-20" />
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
                  <button onClick={() => { navigate("/journal"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 bg-brand-sage/20 text-charcoal-text touch-target">
                    <BookOpen className="w-4 h-4 text-brand-purple" />
                    <span>Wellbeing Journal</span>
                  </button>
                  <button onClick={() => { navigate("/community"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-charcoal-light hover:text-charcoal-text touch-target">
                    <Users className="w-4 h-4 text-brand-teal" />
                    <span>Impact Circles</span>
                  </button>
                  <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-charcoal-light hover:text-charcoal-text touch-target">
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
              <h1 className="text-sm font-bold text-charcoal-text font-display">Wellbeing Journal</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Encrypted</span>
              </span>
            </div>
          </div>
          <Link to="/dashboard" className="text-xs font-semibold text-charcoal-light hover:text-charcoal-text flex items-center gap-1.5 px-4 py-2 rounded-full bg-card-bg border border-neutral-border shadow-xs hover:border-brand-sage transition-all">
            <ArrowLeft className="w-4 h-4 text-charcoal-light" />
            <span>Dashboard</span>
          </Link>
        </header>

        <main className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
          
          {/* Error Banner */}
          {apiError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-600 text-xs flex gap-2.5 items-center animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="flex-1 font-semibold">{apiError}</span>
              <button onClick={() => setApiError("")} className="font-bold text-rose-600 hover:text-charcoal-text">✕</button>
            </div>
          )}

          {/* Input box */}
          <div className="bg-card-bg p-5 sm:p-6 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs glass-card">
            {/* Date Selector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-border/60 pb-3 mb-1">
              <h3 className="text-xs font-bold text-charcoal-light tracking-wider uppercase">
                {selectedLogDate === getTodayISTString() ? "ADD A DAILY REFLECTION" : `Logging Reflection for ${selectedLogDate}`}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-charcoal-light font-medium">Select Date:</span>
                <input
                  type="date"
                  max={getTodayISTString()}
                  value={selectedLogDate}
                  onChange={(e) => setSelectedLogDate(e.target.value)}
                  className="text-[11px] font-bold text-charcoal-text bg-warm-bg border border-neutral-border rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-brand-sage outline-none"
                />
              </div>
            </div>

            {hasEntryForSelectedDate ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Reflection Logged</h3>
                <p className="text-xs text-charcoal-light max-w-md leading-relaxed font-light">
                  You have already logged your reflection for {selectedLogDate}. See your timeline below or edit it.
                </p>
                {existingEntryForSelectedDate && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(existingEntryForSelectedDate)}
                    className="mt-2 px-4 py-1.5 rounded-full bg-brand-sage text-charcoal-text hover:bg-brand-teal transition-all cursor-pointer text-xs font-bold shadow-xs hover:scale-105 active:scale-95"
                  >
                    Edit this Entry
                  </button>
                )}
              </div>
            ) : (
              <>
                {lastFailedEntry && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-600 text-xs flex justify-between items-center animate-shake">
                    <span className="font-semibold">{apiError || "Failed to save your journal."}</span>
                    <button
                      type="button"
                      onClick={() => handleAddEntry(null, lastFailedEntry)}
                      disabled={submitLoading}
                      className="px-3 py-1 bg-brand-sage hover:bg-brand-teal text-charcoal-text font-bold rounded-full transition-all text-[10px] cursor-pointer disabled:opacity-50"
                    >
                      Retry Save
                    </button>
                  </div>
                )}

                <form onSubmit={handleAddEntry} className="flex flex-col gap-3">
                  <div className="relative">
                    <textarea
                      required
                      rows="4"
                      maxLength={MAX_CHARS}
                      disabled={submitLoading}
                      placeholder="How is your body and mind responding to your routine today?"
                      value={newText}
                      onChange={(e) => {
                        setNewText(e.target.value);
                        if (validationErrors.content) {
                          setValidationErrors({});
                        }
                      }}
                      className="w-full p-4 bg-warm-bg rounded-2xl border border-neutral-border text-charcoal-text text-xs focus:ring-2 focus:ring-brand-sage outline-none placeholder:text-slate-400 resize-y transition-all leading-relaxed"
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] font-mono text-charcoal-light/70 bg-card-bg/80 px-2 py-0.5 rounded-full border border-neutral-border/60">
                      {newText.length} / {MAX_CHARS}
                    </div>
                  </div>

                  {validationErrors.content && (
                    <span className="text-[10px] text-rose-600 font-medium px-1 animate-fade-in">{validationErrors.content}</span>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-charcoal-light font-light hidden sm:inline">
                      AI will analyze sentiment & emotional patterns safely.
                    </span>
                    <button
                      type="submit"
                      disabled={submitLoading || !newText.trim()}
                      className="px-6 py-2.5 rounded-full bg-brand-sage text-charcoal-text font-bold text-xs hover:bg-brand-teal transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs hover:scale-105 active:scale-95 focus-ring ml-auto"
                    >
                      {submitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-charcoal-text" />}
                      <span>{submitLoading ? "Analyzing Reflection..." : "Analyze Reflection"}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Entries list with timeline aesthetics */}
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-charcoal-light tracking-wider uppercase">TIMELINE REFLECTIONS</h3>
              {entries.length > 0 && (
                <span className="text-[10px] text-charcoal-light/70 font-mono">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"} logged
                </span>
              )}
            </div>

            {loading ? (
              <SkeletonLoader type="list" />
            ) : entries.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Journal is Empty"
                description="No cognitive reflections logged yet. Type your mental state in the box above to generate companion decodes."
                actionText=""
              />
            ) : (
              <div className="flex flex-col gap-4 relative pl-3.5 sm:pl-6 border-l-2 border-brand-sage/30 my-2">
                {entries.map((entry, idx) => (
                  <div key={entry.id || idx} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[21px] sm:-left-[31px] top-6 w-3 h-3 rounded-full bg-card-bg border-2 border-brand-teal group-hover:bg-brand-teal transition-all shadow-xs" />
                    
                    <div className="bg-card-bg p-4 sm:p-6 rounded-3xl border border-neutral-border flex flex-col sm:flex-row gap-4 animate-fade-in-up shadow-xs glass-card-hover">
                      <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 shrink-0">
                        {(() => {
                          const s = entry.sentiment;
                          const isGreen = s === "Calm" || s === "Positive";
                          const isYellow = s === "Neutral" || s === "Stable";
                          const iconBg = isGreen ? "bg-emerald-50 border-emerald-200" : isYellow ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200";
                          
                          return (
                            <div className={`p-2.5 rounded-full border ${iconBg}`}>
                              {isGreen ? <Smile className="w-5 h-5 text-emerald-600" /> : isYellow ? <Meh className="w-5 h-5 text-amber-600" /> : <Frown className="w-5 h-5 text-rose-600" />}
                            </div>
                          );
                        })()}
                        <span className="text-[10px] font-mono text-charcoal-light font-bold">
                          {entry.sentiment_score !== undefined && entry.sentiment_score !== null ? `${Math.round(entry.sentiment_score * 100)}% Match` : "Logged"}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] text-charcoal-light border-b border-neutral-border/60 pb-2">
                          <span className="font-mono text-[9px] sm:text-[10px] text-charcoal-light/70">{formatDate(entry.created_at || entry.timestamp)}</span>
                          <div className="flex items-center gap-3">
                            {(() => {
                              const s = entry.sentiment;
                              const isGreen = s === "Calm" || s === "Positive";
                              const isYellow = s === "Neutral" || s === "Stable";
                              const badgeTag = isGreen
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : isYellow
                                ? "bg-amber-50 text-amber-700 border-amber-300"
                                : "bg-rose-50 text-rose-700 border-rose-300";
                                
                              return (
                                <span className={`font-bold font-mono uppercase px-2.5 py-0.5 rounded-full border ${badgeTag}`}>
                                  {entry.sentiment || "Neutral"}
                                </span>
                              );
                            })()}
                            
                            <div className="flex items-center gap-1 ml-1 border-l border-neutral-border/60 pl-1 sm:ml-2 sm:pl-2">
                              <button
                                onClick={() => handleStartEdit(entry)}
                                title="Edit reflection"
                                className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-xl text-charcoal-light hover:text-emerald-600 transition-all hover:bg-emerald-50 cursor-pointer active:scale-95 focus-ring"
                                aria-label={`Edit journal reflection logged on ${formatDate(entry.created_at || entry.timestamp)}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                title="Delete reflection"
                                className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-xl text-charcoal-light hover:text-rose-600 transition-all hover:bg-rose-50 cursor-pointer active:scale-95 focus-ring"
                                aria-label={`Delete journal reflection logged on ${formatDate(entry.created_at || entry.timestamp)}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {entry.id === editingEntryId ? (
                          <div className="flex flex-col gap-2 mt-2">
                            <textarea
                              rows="3"
                              maxLength={MAX_CHARS}
                              disabled={editLoading}
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full p-3 bg-warm-bg rounded-xl border border-neutral-border text-charcoal-text text-xs focus:ring-2 focus:ring-brand-sage outline-none resize-none leading-relaxed"
                            />
                            <div className="flex justify-end gap-2 text-[10px]">
                              <button
                                onClick={() => {
                                  setEditingEntryId(null);
                                  setEditingText("");
                                }}
                                disabled={editLoading}
                                className="px-3 py-1.5 rounded-full border border-neutral-border text-charcoal-light hover:text-charcoal-text transition-all cursor-pointer font-bold disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(entry.id)}
                                disabled={editLoading || !editingText.trim()}
                                className="px-4 py-1.5 rounded-full bg-brand-sage text-charcoal-text hover:bg-brand-teal transition-all cursor-pointer font-bold flex items-center gap-1 disabled:opacity-50"
                              >
                                {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3 h-3" />}
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-charcoal-text text-xs sm:text-sm leading-relaxed font-light mt-1">"{entry.content}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        
        {/* Mobile Tab Bar */}
        <MobileNavBar />
      </div>

    </div>
  );
}
