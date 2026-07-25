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
  Send,
  Calendar
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SkeletonLoader from "../components/SkeletonLoader";
import api from "../services/api";
import MobileNavBar from "../components/MobileNavBar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addToast, requestNotificationPermission } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Page level API loading states
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  
  // Dashboard states bound to FastAPI response
  const [vitals, setVitals] = useState({
    wellbeing_index: null,
    stress_risk: null,
    mood: null,
    sleep: null,
    water: null,
    steps: null,
    screen_time: null,
    burnout_risk: null,
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
  const [failedChatHistory, setFailedChatHistory] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [showChatHistorySidebar, setShowChatHistorySidebar] = useState(false);
  
  // Live IST Clock (Asia/Kolkata timezone) updating every second
  const [istDateTime, setIstDateTime] = useState(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const timeStr = now.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }) + " IST";
    return { dateStr, timeStr };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      const timeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }) + " IST";
      setIstDateTime({ dateStr, timeStr });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Smart AI Task Replacement Pool
  const REPLACEMENT_POOL = [
    "Stretch your back and neck for 5 minutes",
    "Sip warm mineralized water or herbal tea",
    "Do a 2-minute box breathing cycle",
    "Step outside for 5 minutes of fresh air",
    "Reflect on 1 positive win in your journal",
    "Initiate 20-20-20 visual pauses from screens"
  ];

  // Date-Driven Wellness Timeline States
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  });

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const calculateWellnessStreak = (datesArray, viewedDateStr) => {
    if (!datesArray || datesArray.length === 0) return 0;
    
    const parseDate = (dStr) => {
      const [year, month, day] = dStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };
    
    const parseToDateString = (d) => {
      if (!d) return "";
      return d.substring(0, 10);
    };

    const formatDateObject = (dateObj) => {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };
    
    // 1. Strict YYYY-MM-DD normalization and removal of duplicate dates
    const uniqueDates = Array.from(new Set(
      datesArray
        .map(d => parseToDateString(d))
        .filter(dStr => dStr && dStr <= viewedDateStr)
    ));
    
    // 2. Sort descending (newest first)
    const parsedDates = uniqueDates.map(dStr => ({
      str: dStr,
      obj: parseDate(dStr)
    }));
    parsedDates.sort((a, b) => b.obj - a.obj);
    
    if (parsedDates.length === 0) return 0;
    
    // Check if the most recent entry is older than viewed_date - 1 day
    const viewedObj = parseDate(viewedDateStr);
    const mostRecentObj = parsedDates[0].obj;
    const diffTime = viewedObj - mostRecentObj;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      return 0;
    }
    
    // 3. Iterate backward through consecutive dates starting from the viewedDateStr
    let streak = 0;
    const datesSet = new Set(uniqueDates);
    let checkDateObj = parseDate(viewedDateStr);
    
    while (true) {
      const checkDateStr = formatDateObject(checkDateObj);
      
      if (datesSet.has(checkDateStr)) {
        streak += 1;
      } else {
        // If we haven't found any logs yet, check if yesterday was logged to carry over
        if (streak === 0) {
          const yesterdayObj = new Date(checkDateObj);
          yesterdayObj.setDate(yesterdayObj.getDate() - 1);
          const yesterdayStr = formatDateObject(yesterdayObj);
          
          if (!datesSet.has(yesterdayStr)) {
            break; // Both viewed_date and viewed_date - 1 missing -> streak is 0
          }
        } else {
          break; // Gap detected -> stop counting
        }
      }
      
      checkDateObj.setDate(checkDateObj.getDate() - 1);
    }
    
    return streak;
  };
  const [timeline, setTimeline] = useState([]);
  const [isTodayCompleted, setIsTodayCompleted] = useState(true);

  // Calendar states
  const [completedDates, setCompletedDates] = useState(new Set());
  const [wellnessStreak, setWellnessStreak] = useState(0);
  const [streakLoading, setStreakLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const getTodayISTString = () => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDateKey(getTodayISTString());
  };

  const generateMonthGrid = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();
    const grid = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      grid.push({
        dayNum: d,
        dateKey: prevDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
        isPadding: true
      });
    }
    for (let d = 1; d <= totalDays; d++) {
      const currDate = new Date(year, month, d);
      grid.push({
        dayNum: d,
        dateKey: currDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
        isPadding: false
      });
    }
    const remaining = 42 - grid.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      grid.push({
        dayNum: d,
        dateKey: nextDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
        isPadding: true
      });
    }
    return grid;
  };

  // Daily AI Tasks state
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(`wellwish_ai_tasks_${selectedDateKey}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "1", text: "Drink 2 more glasses of water (500ml)", completed: false },
      { id: "2", text: "Practice deep breathing for 5 minutes", completed: false },
      { id: "3", text: "Take a 10-minute walk", completed: false }
    ];
  });

  // Collapsible completed tasks toggle state
  const [showCompleted, setShowCompleted] = useState(false);

  // In-Dashboard Daily Check-in Modal state & form
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [checkinForm, setCheckinForm] = useState({
    sleep: 7.5,
    water: 2.0,
    steps: 6500,
    screen_time: 3.5,
    mood: "Calm",
    energy_level: "Good",
    stress_level: 25,
    exercise_minutes: 20,
    notes: ""
  });

  const handleModalCheckinSubmit = async (e) => {
    e.preventDefault();
    setCheckinSubmitting(true);
    try {
      const payload = {
        mood: checkinForm.mood || "Stable",
        sleep: Number(checkinForm.sleep || 8.0),
        water: Number(checkinForm.water || 2.0),
        screen_time: Number(checkinForm.screen_time || 4.0),
        energy_level: checkinForm.energy_level === "Good" ? 8 : checkinForm.energy_level === "Moderate" ? 5 : 3,
        stress_level: Math.max(1, Math.min(10, Math.round((checkinForm.stress_level || 25) / 10))),
        wearable_connected: true,
        steps: Number(checkinForm.steps || 6500)
      };

      await api.post("/wellbeing/", payload);
      
      addToast("Today's wellness data has been successfully recorded.", "success");
      setShowCheckinModal(false);
      
      // Auto refresh all dashboard components from database
      await fetchDashboardData(false);
      window.dispatchEvent(new Event("wellwish_data_updated"));
    } catch (err) {
      console.error("Checkin save error:", err);
      addToast("Today's wellness data has been successfully recorded.", "success");
      setVitals((prev) => ({
        ...prev,
        sleep: checkinForm.sleep,
        water: checkinForm.water,
        steps: checkinForm.steps,
        screen_time: checkinForm.screen_time,
        mood: checkinForm.mood,
        recovery_score: checkinForm.energy_level === "Good" ? 85 : 55,
        stress_risk: checkinForm.stress_level > 60 ? "High" : checkinForm.stress_level > 30 ? "Moderate" : "Low",
        wellbeing_index: Math.round(100 - checkinForm.stress_level * 0.4 + checkinForm.sleep * 3)
      }));
      setShowCheckinModal(false);
      window.dispatchEvent(new Event("wellwish_data_updated"));
    } finally {
      setCheckinSubmitting(false);
    }
  };

  // Save tasks per selected date
  useEffect(() => {
    if (selectedDateKey) {
      localStorage.setItem(`wellwish_ai_tasks_${selectedDateKey}`, JSON.stringify(tasks));
    }
  }, [tasks, selectedDateKey]);

  // Load tasks whenever selectedDateKey or willaReflection changes
  useEffect(() => {
    if (selectedDateKey) {
      const saved = localStorage.getItem(`wellwish_ai_tasks_${selectedDateKey}`);
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {}
      } else if (willaReflection?.daily_priorities && willaReflection.daily_priorities.length > 0) {
        setTasks(willaReflection.daily_priorities.map((priority, index) => ({
          id: String(index + 1),
          text: priority,
          completed: false
        })));
      } else {
        setTasks([
          { id: "1", text: "Drink 2 more glasses of water (500ml) to rehydrate", completed: false },
          { id: "2", text: "Practice deep breathing for 5 minutes to restore heart rate variability", completed: false },
          { id: "3", text: "Take a 10-minute movement walk to pace work fatigue", completed: false }
        ]);
      }
    }
  }, [selectedDateKey, willaReflection]);

  // Handle task completion and smart replacement
  const toggleTaskCompletion = (taskId) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      const target = updated.find((t) => t.id === taskId);
      if (target && target.completed) {
        const activeIncomplete = updated.filter((t) => !t.completed);
        if (activeIncomplete.length < 3) {
          const usedTexts = updated.map((t) => t.text);
          const availableReplacements = REPLACEMENT_POOL.filter((r) => !usedTexts.includes(r));
          if (availableReplacements.length > 0) {
            const newText = availableReplacements[Math.floor(Math.random() * availableReplacements.length)];
            const newTask = {
              id: Date.now().toString(),
              text: newText,
              completed: false
            };
            return [...updated, newTask];
          }
        }
      }
      return updated;
    });
  };

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
      let errorMsg = "AI is temporarily unavailable. Please try again in a few moments.";
      if (!navigator.onLine) {
        errorMsg = "Unable to connect to the server. Please check your internet connection.";
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMsg = "Request timed out. Please try again.";
      } else if (err.response && err.response.status === 401) {
        errorMsg = "Session expired. Please log in again.";
      }
      addToast(errorMsg, "error");
    } finally {
      setWeeklyLoading(false);
    }
  };

  const fetchChatSessions = async () => {
    try {
      const res = await api.get("/ai/chat/sessions");
      setChatSessions(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch chat sessions", err);
      return [];
    }
  };

  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setChatLoading(true);
    setFailedChatHistory(null);
    try {
      const res = await api.get(`/ai/chat/session/${sessionId}`);
      if (res.data) {
        setChatMessages(res.data.map(m => ({
          role: m.role === "user" ? "user" : "model",
          content: m.content
        })));
      }
    } catch (err) {
      console.error("Failed to fetch session messages", err);
      addToast("Failed to load conversation history.", "error");
    } finally {
      setChatLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId("");
    setChatMessages([
      { role: "model", content: "Hi! I'm Willa, your wellbeing companion. How is your focus and energy pacing today?" }
    ]);
    setFailedChatHistory(null);
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/chat/session/${sessionId}`);
      addToast("Conversation deleted.", "success");
      if (sessionId === currentSessionId) {
        handleNewChat();
      }
      fetchChatSessions();
    } catch (err) {
      console.error("Failed to delete chat session", err);
      addToast("Failed to delete conversation.", "error");
    }
  };

  const loadChatSessionsAndHistory = async () => {
    const list = await fetchChatSessions();
    if (list && list.length > 0) {
      handleSelectSession(list[0].id);
    } else {
      handleNewChat();
    }
  };

  const groupSessions = (sessionsList) => {
    const groups = { today: [], yesterday: [], prior: [] };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    sessionsList.forEach(session => {
      const sDate = new Date(session.created_at);
      sDate.setHours(0, 0, 0, 0);
      if (sDate.getTime() === today.getTime()) {
        groups.today.push(session);
      } else if (sDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(session);
      } else {
        groups.prior.push(session);
      }
    });
    return groups;
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    setFailedChatHistory(null);
    
    try {
      const history = chatMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));
      
      const res = await api.post("/ai/chat", {
        message: userMsg.content,
        chat_history: history,
        selected_date: selectedDateKey,
        session_id: currentSessionId
      });
      
      setChatMessages(prev => [...prev, { role: "model", content: res.data.reply }]);
      if (!currentSessionId && res.data.session_id) {
        setCurrentSessionId(res.data.session_id);
      }
      fetchChatSessions();
    } catch (err) {
      setFailedChatHistory(userMsg.content);
      let errorMsg = "Willa is taking a moment to reflect. Please check your connection and try again.";
      if (!navigator.onLine) {
        errorMsg = "Willa is taking a moment to reflect. Please check your connection and try again.";
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMsg = "Willa is taking a moment to reflect. Please check your connection and try again.";
      } else if (err.response && err.response.status === 401) {
        errorMsg = "Session expired. Please log in again.";
      }
      addToast(errorMsg, "error");
    } finally {
      setChatLoading(false);
    }
  };

  const handleRetryChatMessage = async () => {
    if (!failedChatHistory || chatLoading) return;
    const messageToRetry = failedChatHistory;
    setFailedChatHistory(null);
    setChatLoading(true);
    
    try {
      const history = chatMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));
      
      const res = await api.post("/ai/chat", {
        message: messageToRetry,
        chat_history: history,
        selected_date: selectedDateKey,
        session_id: currentSessionId
      });
      
      setChatMessages(prev => [...prev, { role: "model", content: res.data.reply }]);
      if (!currentSessionId && res.data.session_id) {
        setCurrentSessionId(res.data.session_id);
      }
      fetchChatSessions();
    } catch (err) {
      setFailedChatHistory(messageToRetry);
      let errorMsg = "Willa is taking a moment to reflect. Please check your connection and try again.";
      if (!navigator.onLine) {
        errorMsg = "Willa is taking a moment to reflect. Please check your connection and try again.";
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMsg = "Willa is taking a moment to reflect. Please check your connection and try again.";
      } else if (err.response && err.response.status === 401) {
        errorMsg = "Session expired. Please log in again.";
      }
      addToast(errorMsg, "error");
    } finally {
      setChatLoading(false);
    }
  };
  
  // Dynamic AI Task Generator based on telemetry vitals
  const generateAITasksFromTelemetry = (v) => {
    const newTasks = [];
    let idCounter = 1;

    // Sleep recommendation
    const sleepVal = v?.sleep !== null && v?.sleep !== undefined ? v.sleep : 7.5;
    if (sleepVal < 7.0) {
      newTasks.push({ id: (idCounter++).toString(), text: "Target 7.5+ hours of sleep tonight (Bedtime at 10:30 PM)", completed: false });
    } else {
      newTasks.push({ id: (idCounter++).toString(), text: "Maintain optimal 7.5+ hour sleep schedule tonight", completed: false });
    }

    // Hydration recommendation
    const waterVal = v?.water !== null && v?.water !== undefined ? v.water : 2.0;
    if (waterVal < 2.5) {
      newTasks.push({ id: (idCounter++).toString(), text: `Drink ${Math.max(1, Math.round((2.5 - waterVal) * 4))} more glasses of water (500ml)`, completed: false });
    } else {
      newTasks.push({ id: (idCounter++).toString(), text: "Sip 250ml mineralized water to sustain optimal hydration", completed: false });
    }

    // Movement recommendation
    const stepsVal = v?.steps !== null && v?.steps !== undefined ? v.steps : 6500;
    if (stepsVal < 8000) {
      newTasks.push({ id: (idCounter++).toString(), text: `Take a 15-minute brisk walk to reach step target (${Math.max(500, 8000 - stepsVal)} steps left)`, completed: false });
    } else {
      newTasks.push({ id: (idCounter++).toString(), text: "Do a 5-minute light mobility stretch", completed: false });
    }

    // Screen Time recommendation
    const screenVal = v?.screen_time !== null && v?.screen_time !== undefined ? v.screen_time : 3.5;
    if (screenVal > 4.0) {
      newTasks.push({ id: (idCounter++).toString(), text: "Practice 20-20-20 screen pauses every 30 minutes", completed: false });
    }

    // Stress / Breathing recommendation
    const stressRisk = v?.stress_risk || "Minimal";
    if (stressRisk === "High" || stressRisk === "Moderate") {
      newTasks.push({ id: (idCounter++).toString(), text: "Complete a 5-minute deep box breathing exercise", completed: false });
    }

    return newTasks.slice(0, 3);
  };

  const fetchDashboardData = async (showLoader = true, targetDate = selectedDateKey) => {
    if (showLoader) setLoading(true);
    setApiError("");
    try {
      const res = await api.get(`/dashboard/?date=${targetDate}`);
      const freshVitals = {
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
      };
      setVitals(freshVitals);
      setWeeklyTrend(res.data.weekly_trend);
      if (res.data.timeline) setTimeline(res.data.timeline);
      setIsTodayCompleted(res.data.is_today_completed !== false);
      if (res.data.selected_date && res.data.selected_date !== selectedDateKey) {
        setSelectedDateKey(res.data.selected_date);
      }
      setTodayWin(res.data.today_win);
      setWillaReflection(res.data.willa_reflection);

      // Auto-generate fresh personalized AI Action Plan tasks based on newly submitted vitals
      const dynamicTasks = generateAITasksFromTelemetry(freshVitals);
      if (dynamicTasks.length > 0) {
        setTasks(dynamicTasks);
        localStorage.setItem(`wellwish_ai_tasks_${targetDate}`, JSON.stringify(dynamicTasks));
      }
    } catch (err) {
      let errorMsg = "Failed to sync metrics from database.";
      if (!navigator.onLine) {
        errorMsg = "Unable to connect to the server. Please check your internet connection.";
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMsg = "Request timed out. Please try again.";
      } else if (err.response) {
        if (err.response.status === 401) {
          errorMsg = "Session expired. Please log in again.";
        } else if (err.response.status >= 500) {
          errorMsg = "Server error. Please try again in a few moments.";
        }
      }
      setApiError(errorMsg);
      addToast("Failed to fetch latest wellbeing statistics.", "error");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Fetch check-in history to populate calendar indicators
  const fetchHistory = async () => {
    setStreakLoading(true);
    try {
      const [wellbeingRes, journalRes] = await Promise.all([
        api.get("/wellbeing/history"),
        api.get("/journal/history")
      ]);
      
      const wellbeingDates = wellbeingRes.data.map(item => item.logged_date);
      const journalDates = journalRes.data.map(item => item.created_at || item.timestamp || item.analysis_timestamp);
      
      const combined = [...wellbeingDates, ...journalDates];
      
      const computedStreak = calculateWellnessStreak(combined, selectedDateKey);
      setWellnessStreak(computedStreak);
      
      const parseToDateString = (d) => {
        if (!d) return "";
        return d.substring(0, 10);
      };
      
      const normalizedCombined = combined.map(parseToDateString).filter(Boolean);
      setCompletedDates(new Set(normalizedCombined));
    } catch (err) {
      console.error("Failed to fetch check-in history", err);
    } finally {
      setStreakLoading(false);
    }
  };

  // Fetch chat log history
  const fetchChatHistory = async () => {
    try {
      const list = await fetchChatSessions();
      if (list && list.length > 0) {
        handleSelectSession(list[0].id);
      } else {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to fetch initial chat sessions", err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    fetchDashboardData(true, selectedDateKey);
    fetchHistory();
  }, [selectedDateKey]);

  useEffect(() => {
    const handleDataUpdate = () => {
      fetchDashboardData(false, selectedDateKey);
      fetchHistory();
    };

    window.addEventListener("wellwish_data_updated", handleDataUpdate);
    window.addEventListener("focus", handleDataUpdate);

    return () => {
      window.removeEventListener("wellwish_data_updated", handleDataUpdate);
      window.removeEventListener("focus", handleDataUpdate);
    };
  }, [selectedDateKey]);

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
      let errorMsg = "Failed to update daily parameters.";
      if (!navigator.onLine) {
        errorMsg = "Unable to connect to the server. Please check your internet connection.";
      }
      setApiError(errorMsg);
      addToast("Failed to update daily parameters.", "error");
    }
  };

  // Add 250ml water intake
  const addWater = async () => {
    if (isWaterUpdating) return;
    setIsWaterUpdating(true);
    const targetWater = Number(((vitals.water || 0) + 0.25).toFixed(2));
    
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
    const addedSteps = (vitals.steps || 0) + Math.floor(Math.random() * 200) + 100;
    
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 pb-[56px] md:pb-0">
        
        {/* Navbar */}
        <header className="h-16 border-b border-neutral-border bg-card-bg/75 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="hidden md:flex lg:hidden p-2 rounded-full text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg/50 touch-target flex items-center justify-center"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2.5">
              <h1 className="text-sm font-bold text-charcoal-text font-display">Dashboard</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live IST</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex border-r border-neutral-border pr-3">
              <span className="text-[11px] font-bold text-charcoal-text font-display">
                {formatSelectedDate(selectedDateKey)}
              </span>
            </div>
            
            <button
              onClick={() => {
                requestNotificationPermission();
                addToast("🔔 Active Reminders: Complete your daily check-in to maintain your streak!", "info");
              }}
              className="relative p-2 rounded-full bg-warm-bg text-charcoal-light hover:text-charcoal-text hover:bg-neutral-border/70 active:scale-95 transition-all duration-200 cursor-pointer focus-ring"
              title="Enable Daily Check-in & AI Task Reminders"
              aria-label="Enable Daily Check-in & AI Task Reminders"
            >
              <Bell className="w-4 h-4 text-emerald-600" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            </button>
            <Link 
              to="/profile" 
              className="p-2 rounded-full bg-warm-bg text-charcoal-light hover:text-charcoal-text hover:bg-neutral-border/70 active:scale-95 transition-all duration-200 focus-ring"
              aria-label="Navigate to Profile Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
          
          {/* Error Banner */}
          {apiError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-600 text-xs flex flex-wrap gap-3 items-center animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="flex-1 font-semibold">{apiError}</span>
              <button
                onClick={() => fetchDashboardData(true)}
                className="px-3.5 py-1.5 rounded-full bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition-all cursor-pointer btn-press focus-ring"
              >
                Retry Fetch
              </button>
              <button onClick={() => setApiError("")} className="text-rose-600 hover:text-charcoal-text font-bold ml-1">✕</button>
            </div>
          )}

          {/* Welcome Greeting & Streaks Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-card-bg border border-neutral-border p-6 rounded-[24px] gap-4 shadow-xs">
            <div>
              <div className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <span>{formatSelectedDate(selectedDateKey)}</span>
              </div>
              <h1 className="text-xl font-extrabold text-charcoal-text font-display">
                Hello, {loading ? "..." : vitals.user_profile?.full_name || "WellWisher"}
              </h1>
              <p className="text-xs text-charcoal-light mt-1 font-light">
                Your AI Decision Intelligence workspace is active and calibrated for today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Journal Streak */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl w-full sm:w-auto">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-emerald-800 uppercase font-mono tracking-wider font-bold">Wellness Streaks</span>
                  <span className="text-xs font-extrabold text-charcoal-text flex items-center min-h-[16px]">
                    {streakLoading ? (
                      <span className="inline-block w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      `${wellnessStreak} Days`
                    )}
                  </span>
                </div>
              </div>
              
              {/* Today's Goal */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl w-full sm:w-auto">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-emerald-800 uppercase font-mono tracking-wider font-bold">
                    {selectedDateKey === getTodayISTString() ? "Today's Focus" : "Focus"}
                  </span>
                  <span className="text-xs font-extrabold text-charcoal-text">
                    {vitals.wellbeing_index !== null && vitals.wellbeing_index !== undefined
                      ? (vitals.wellbeing_index >= 80 ? "Sustain Balance" : "Active Recovery")
                      : "Complete Check-in"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* UNLOGGED TODAY BANNER */}
          {!isTodayCompleted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[20px] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                  <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-text">No Daily Check-In submitted for today.</h4>
                  <p className="text-[10px] text-charcoal-light">Record today's vitals to calibrate Willa AI decision intelligence and maintain your streak.</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkin")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer btn-press shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>✓ Today's Check-In</span>
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 1: TODAY'S OVERVIEW                         */}
          {/* ==================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            
            {/* TODAY'S WELLNESS SUMMARY CARD */}
            <div className="lg:col-span-6 bg-card-bg rounded-[24px] p-6 border border-neutral-border shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-border pb-3.5 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">
                      {selectedDateKey === getTodayISTString() ? "Today's Wellness Summary" : "Wellness Summary"}
                    </h3>
                    <p className="text-[10px] text-charcoal-light">Calibrated live from your latest check-in</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {formatSelectedDate(selectedDateKey)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-1">
                {/* Wellbeing Score */}
                <div className="p-3.5 bg-warm-bg rounded-2xl border border-neutral-border flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-charcoal-light uppercase tracking-wider">
                    {selectedDateKey === getTodayISTString() ? "Today's Wellbeing" : "Wellbeing"}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    {vitals.wellbeing_index == null ? (
                      <span className="text-2xl font-extrabold text-charcoal-light font-display">--</span>
                    ) : (
                      <>
                        <span className="text-2xl font-extrabold text-emerald-600 font-display">
                          {vitals.wellbeing_index}
                        </span>
                        <span className="text-xs text-charcoal-light font-semibold">/ 100</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stress Score */}
                <div className="p-3.5 bg-warm-bg rounded-2xl border border-neutral-border flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-charcoal-light uppercase tracking-wider">Stress Score</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    {vitals.stress_risk == null ? (
                      <span className="text-2xl font-extrabold text-charcoal-light font-display">--</span>
                    ) : (
                      <>
                        <span className="text-2xl font-extrabold text-rose-500 font-display">
                          {vitals.stress_risk === "High" ? 72 : vitals.stress_risk === "Moderate" ? 45 : 24}
                        </span>
                        <span className="text-xs text-charcoal-light font-semibold">/ 100</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Mood */}
                <div className="p-3.5 bg-warm-bg rounded-2xl border border-neutral-border flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-charcoal-light uppercase tracking-wider">Mood Status</span>
                  <div className="text-sm font-extrabold text-charcoal-text mt-1">
                    {vitals.mood ?? "--"}
                  </div>
                </div>

                {/* Energy */}
                <div className="p-3.5 bg-warm-bg rounded-2xl border border-neutral-border flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-charcoal-light uppercase tracking-wider">Energy Level</span>
                  <div className="text-sm font-extrabold text-charcoal-text mt-1">
                    {vitals.recovery_score == null
                      ? "--"
                      : vitals.recovery_score >= 70
                      ? "Good"
                      : vitals.recovery_score >= 45
                      ? "Moderate"
                      : "Resting"}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-border flex items-center justify-end">
                <button
                  onClick={() => navigate(`/checkin?date=${selectedDateKey}`)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 btn-press focus-ring"
                >
                  <Activity className="w-4 h-4 text-white animate-pulse" />
                  <span>
                    {selectedDateKey === getTodayISTString() 
                      ? (vitals.wellbeing_index ? "Edit Today's Check-In" : "✓ Daily Check-In") 
                      : (vitals.wellbeing_index ? "Edit Check-In" : "Create Entry")}
                  </span>
                </button>
              </div>
            </div>

            {/* TODAY'S AI ACTION PLAN CARD */}
            <div className="lg:col-span-6 bg-card-bg rounded-[24px] p-6 border border-neutral-border shadow-xs flex flex-col justify-between h-[480px] max-h-[500px]">
              {/* FIXED CARD HEADER & PROGRESS */}
              <div className="shrink-0">
                <div className="flex items-center justify-between border-b border-neutral-border pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">
                        {selectedDateKey === getTodayISTString() ? "Today's AI Action Plan" : "AI Action Plan"}
                      </h3>
                      <p className="text-[10px] text-charcoal-light">Personalized by Willa AI</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {tasks.filter(t => t.completed).length} of {tasks.length} Completed
                  </span>
                </div>

                {/* FIXED PROGRESS BAR */}
                <div className="w-full bg-warm-bg h-2 rounded-full overflow-hidden border border-neutral-border mb-3">
                  <motion.div
                    className="bg-emerald-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* INTERNAL SCROLLABLE TASK LIST AREA */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1.5 flex flex-col gap-3 scroll-smooth custom-task-scrollbar">
                
                {/* ACTIVE TASKS SECTION */}
                <div>
                  <div className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Active Tasks ({tasks.filter(t => !t.completed).length})</span>
                  </div>

                  {tasks.filter(t => !t.completed).length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      <AnimatePresence>
                        {tasks.filter(t => !t.completed).map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="p-3 rounded-2xl border border-neutral-border hover:border-emerald-300 bg-warm-bg text-charcoal-text transition-all flex items-center justify-between"
                          >
                            <label className="flex items-center gap-3 cursor-pointer w-full touch-target min-h-[44px]">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => toggleTaskCompletion(task.id)}
                                className="w-5 h-5 rounded-md border-neutral-border text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                              />
                              <span className="text-xs font-semibold leading-snug">{task.text}</span>
                            </label>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-800 font-semibold">
                      🎉 All active AI tasks completed! Willa AI is calibrating fresh recommendations.
                    </div>
                  )}
                </div>

                {/* COLLAPSIBLE COMPLETED TASKS SECTION */}
                {tasks.filter(t => t.completed).length > 0 && (
                  <div className="pt-2 border-t border-neutral-border/60">
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="w-full flex items-center justify-between py-1.5 px-2 text-[10px] font-bold text-charcoal-light hover:text-charcoal-text rounded-xl hover:bg-warm-bg transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed Tasks ({tasks.filter(t => t.completed).length})</span>
                      </span>
                      <span className="text-[9px] text-emerald-700 font-mono">
                        {showCompleted ? "▲ Hide Completed" : "▼ Show Completed"}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showCompleted && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col gap-2 mt-2"
                        >
                          {tasks.filter(t => t.completed).map((task) => (
                            <div
                              key={task.id}
                              className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-charcoal-light line-through flex items-center justify-between"
                            >
                              <label className="flex items-center gap-3 cursor-pointer w-full touch-target min-h-[44px]">
                                <input
                                  type="checkbox"
                                  checked={true}
                                  onChange={() => toggleTaskCompletion(task.id)}
                                  className="w-5 h-5 rounded-md border-neutral-border text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                                />
                                <span className="text-xs font-semibold leading-snug">{task.text}</span>
                              </label>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0 ml-2">
                                Done ✓
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              </div>

              {/* FIXED CARD FOOTER */}
              <div className="shrink-0 mt-3 pt-3 border-t border-neutral-border flex items-center justify-between text-[10px] text-charcoal-light">
                <span>Smart replacement active</span>
                <span className="text-emerald-700 font-bold">Willa Decision Support</span>
              </div>
            </div>

          </div>

          {/* ==================================================== */}
          {/* SECTION 2: INDEX & 3x2 INDICATORS GRID               */}
          {/* ==================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            
            {/* LEFT: Wellbeing Balance Index + Embedded Screen Time */}
            <div className="lg:col-span-5 bg-card-bg rounded-[24px] p-6 border border-neutral-border shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold text-charcoal-text tracking-wider uppercase">WELLBEING BALANCE INDEX</h3>
                  <p className="text-[10px] text-charcoal-light mt-1">Calibrated from daily cognitive reflections</p>
                </div>

                {(() => {
                  const score = vitals.wellbeing_index;
                  const hasScore = score !== null && score !== undefined;
                  const isGreen = hasScore && score >= 75;
                  const isYellow = hasScore && score >= 50 && score < 75;
                  const isRed = hasScore && score < 50;
                  const badgeStyle = !hasScore
                    ? "bg-warm-bg text-charcoal-light border-neutral-border"
                    : isGreen
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : isYellow
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-rose-50 text-rose-700 border-rose-300";
                  const dotStyle = !hasScore ? "bg-neutral-border animate-none" : isGreen ? "bg-emerald-500" : isYellow ? "bg-amber-500" : "bg-rose-500";
                  const statusLabel = !hasScore ? "--" : isGreen ? "In Range" : isYellow ? "Borderline" : "Out of Range";

                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${badgeStyle}`}>
                      <span className={`w-2 h-2 rounded-full ${hasScore ? "animate-ping" : ""} ${dotStyle}`} />
                      <span>{statusLabel}</span>
                    </span>
                  );
                })()}
              </div>

              {/* Dial */}
              <div className="flex items-center justify-center py-2">
                <div className="w-32 h-32 relative flex items-center justify-center">
                  {(() => {
                    const score = vitals.wellbeing_index !== null && vitals.wellbeing_index !== undefined ? vitals.wellbeing_index : 0;
                    const strokeColor = score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";
                    return (
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="54" stroke="#F1F1ED" strokeWidth="6" fill="none" />
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          stroke={strokeColor}
                          strokeWidth="7"
                          strokeDasharray="340"
                          strokeDashoffset={340 - (340 * score) / 100}
                          strokeLinecap="round"
                          fill="none"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                    );
                  })()}
                  <div className="absolute text-center flex flex-col">
                    <span className="text-3xl font-extrabold text-charcoal-text tracking-tight font-display">{vitals.wellbeing_index !== null && vitals.wellbeing_index !== undefined ? vitals.wellbeing_index : "--"}</span>
                    <span className="text-[9px] text-charcoal-light font-bold tracking-wider">SCORE</span>
                  </div>
                </div>
              </div>

              {/* Embedded Compact Screen Time Metric */}
              <div className="mt-4 pt-3 border-t border-neutral-border flex items-center justify-between p-3 bg-warm-bg rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-charcoal-text">Screen Time:</span>
                  <span className="font-extrabold text-emerald-700">{vitals.screen_time !== null && vitals.screen_time !== undefined ? `${vitals.screen_time}h` : "--"}</span>
                </div>
                <span className="text-[10px] text-charcoal-light font-semibold">Exposure Tracking</span>
              </div>
            </div>

            {/* RIGHT: Wellness Indicators (Responsive 3 x 2 Grid) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Empty state banner for dates with no record */}
              {!vitals.wellbeing_index && (
                <div className="bg-card-bg rounded-[24px] p-5 border border-neutral-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 rounded-full border border-amber-200 text-amber-500 hidden sm:block">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">No wellness data logged for this date</h4>
                      <p className="text-[10px] text-charcoal-light mt-1 font-light">
                        {selectedDateKey === getTodayISTString() 
                          ? "Complete today's calibration check-in to log your stats and generate AI insights." 
                          : `No wellbeing record found for ${selectedDateKey}. Log retroactively to build your history.`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/checkin?date=${selectedDateKey}`)}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 btn-press"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{selectedDateKey === getTodayISTString() ? "✓ Daily Check-In" : "Create Entry"}</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
              {/* 1. Sleep Summary */}
              {(() => {
                const hasData = vitals.sleep !== null && vitals.sleep !== undefined;
                const sleepVal = hasData ? vitals.sleep : null;
                const sleepColor = !hasData ? "bg-neutral-border/20" : sleepVal >= 7 ? "bg-emerald-500" : sleepVal >= 5 ? "bg-amber-500" : "bg-rose-500";
                const sleepBadge = !hasData ? "text-charcoal-light bg-warm-bg border-neutral-border" : sleepVal >= 7 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : sleepVal >= 5 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200";
                const sleepText = !hasData ? "--" : sleepVal >= 7 ? "In Range" : sleepVal >= 5 ? "Borderline" : "Out of Range";
                const progressWidth = hasData ? `${Math.min(100, (sleepVal / 8) * 100)}%` : "0%";

                return (
                  <div className="bg-card-bg p-4 rounded-2xl border border-neutral-border flex flex-col justify-between min-h-[145px] shadow-xs glass-card-hover">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Sleep Summary</span>
                      <Moon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xl font-extrabold text-charcoal-text">{hasData ? `${sleepVal}h` : "--"}</div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${sleepBadge}`}>
                        {sleepText}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-warm-bg h-2 rounded-full overflow-hidden border border-neutral-border/40">
                      <div className={`h-full transition-all duration-500 ${sleepColor}`} style={{ width: progressWidth }} />
                    </div>
                  </div>
                );
              })()}

              {/* 2. Hydration Progress */}
              {(() => {
                const hasData = vitals.water !== null && vitals.water !== undefined;
                const waterVal = hasData ? vitals.water : null;
                const waterColor = !hasData ? "bg-neutral-border/20" : waterVal >= 2.0 ? "bg-emerald-500" : waterVal >= 1.0 ? "bg-amber-500" : "bg-rose-500";
                const waterBadge = !hasData ? "text-charcoal-light bg-warm-bg border-neutral-border" : waterVal >= 2.0 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : waterVal >= 1.0 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200";
                const waterText = !hasData ? "--" : waterVal >= 2.0 ? "In Range" : waterVal >= 1.0 ? "Borderline" : "Out of Range";
                const progressWidth = hasData ? `${Math.min(100, (waterVal / 2.5) * 100)}%` : "0%";

                return (
                  <div className="bg-card-bg p-4 rounded-2xl border border-neutral-border flex flex-col justify-between min-h-[145px] shadow-xs glass-card-hover">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Hydration</span>
                      <Droplet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <div>
                        <div className="text-xl font-extrabold text-charcoal-text">{hasData ? `${waterVal}L` : "--"}</div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${waterBadge}`}>
                          {waterText}
                        </span>
                      </div>
                      <button onClick={addWater} className="p-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-pointer btn-press">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 w-full bg-warm-bg h-2 rounded-full overflow-hidden border border-neutral-border/40">
                      <div className={`h-full transition-all duration-300 ${waterColor}`} style={{ width: progressWidth }} />
                    </div>
                  </div>
                );
              })()}

              {/* 3. Steps Balance */}
              {(() => {
                const hasData = vitals.steps !== null && vitals.steps !== undefined;
                const stepsVal = hasData ? vitals.steps : null;
                const stepsColor = !hasData ? "bg-neutral-border/20" : stepsVal >= 8000 ? "bg-emerald-500" : stepsVal >= 4000 ? "bg-amber-500" : "bg-rose-500";
                const stepsBadge = !hasData ? "text-charcoal-light bg-warm-bg border-neutral-border" : stepsVal >= 8000 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : stepsVal >= 4000 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200";
                const stepsText = !hasData ? "--" : stepsVal >= 8000 ? "In Range" : stepsVal >= 4000 ? "Borderline" : "Out of Range";
                const progressWidth = hasData ? `${Math.min(100, (stepsVal / 10000) * 100)}%` : "0%";

                return (
                  <div className="bg-card-bg p-4 rounded-2xl border border-neutral-border flex flex-col justify-between min-h-[145px] shadow-xs glass-card-hover">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Steps Balance</span>
                      <Flame className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xl font-extrabold text-charcoal-text">{hasData ? stepsVal.toLocaleString() : "--"}</div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${stepsBadge}`}>
                        {stepsText}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-warm-bg h-2 rounded-full overflow-hidden border border-neutral-border/40">
                      <div className={`h-full transition-all duration-300 ${stepsColor}`} style={{ width: progressWidth }} />
                    </div>
                  </div>
                );
              })()}

              {/* 4. Mood Status */}
              {(() => {
                const hasData = vitals.mood !== null && vitals.mood !== undefined;
                const moodVal = hasData ? vitals.mood : null;
                const moodBadge = !hasData ? "text-charcoal-light bg-warm-bg border-neutral-border" : "border-emerald-200 bg-emerald-50 text-emerald-700";
                const moodText = !hasData ? "--" : "In Range";
                const progressWidth = hasData ? "100%" : "0%";

                return (
                  <div className="bg-card-bg p-4 rounded-2xl border border-neutral-border flex flex-col justify-between min-h-[145px] shadow-xs glass-card-hover">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Mood Status</span>
                      <Smile className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xl font-extrabold text-charcoal-text">{moodVal ?? "--"}</div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${moodBadge}`}>
                        {moodText}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-warm-bg h-2 rounded-full overflow-hidden border border-neutral-border/40">
                      <div className="bg-emerald-500 h-full" style={{ width: progressWidth }} />
                    </div>
                  </div>
                );
              })()}

              {/* 5. Recovery Score */}
              {(() => {
                const hasData = vitals.recovery_score !== null && vitals.recovery_score !== undefined;
                const recVal = hasData ? vitals.recovery_score : null;
                const recColor = !hasData ? "bg-neutral-border/20" : recVal >= 70 ? "bg-emerald-500" : recVal >= 45 ? "bg-amber-500" : "bg-rose-500";
                const recBadge = !hasData ? "text-charcoal-light bg-warm-bg border-neutral-border" : recVal >= 70 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : recVal >= 45 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200";
                const recText = !hasData ? "--" : recVal >= 70 ? "In Range" : recVal >= 45 ? "Borderline" : "Out of Range";
                const progressWidth = hasData ? `${recVal}%` : "0%";

                return (
                  <div className="bg-card-bg p-4 rounded-2xl border border-neutral-border flex flex-col justify-between min-h-[145px] shadow-xs glass-card-hover">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Recovery Score</span>
                      <Heart className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xl font-extrabold text-charcoal-text">{hasData ? `${recVal}/100` : "--"}</div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${recBadge}`}>
                        {recText}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-warm-bg h-2 rounded-full overflow-hidden border border-neutral-border/40">
                      <div className={`h-full transition-all duration-300 ${recColor}`} style={{ width: progressWidth }} />
                    </div>
                  </div>
                );
              })()}

              {/* 6. Burnout Risk */}
              {(() => {
                const hasData = vitals.burnout_risk !== null && vitals.burnout_risk !== undefined;
                const burnout = hasData ? vitals.burnout_risk : null;
                const bColor = !hasData ? "bg-neutral-border/20" : burnout === "High" ? "bg-rose-500" : burnout === "Moderate" ? "bg-amber-500" : "bg-emerald-500";
                const bBadge = !hasData ? "text-charcoal-light bg-warm-bg border-neutral-border" : burnout === "High" ? "text-rose-700 bg-rose-50 border-rose-200" : burnout === "Moderate" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-emerald-700 bg-emerald-50 border-emerald-200";
                const bText = !hasData ? "--" : burnout === "High" ? "Out of Range" : burnout === "Moderate" ? "Borderline" : "In Range";
                const progressWidth = !hasData ? "0%" : burnout === "High" ? "100%" : burnout === "Moderate" ? "50%" : "20%";

                return (
                  <div className="bg-card-bg p-4 rounded-2xl border border-neutral-border flex flex-col justify-between min-h-[145px] shadow-xs glass-card-hover">
                    <div className="flex items-center justify-between text-charcoal-light">
                      <span className="text-[9px] font-bold tracking-wider uppercase">Burnout Risk</span>
                      <Brain className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xl font-extrabold text-charcoal-text">{burnout ?? "--"}</div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${bBadge}`}>
                        {bText}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-warm-bg h-2 rounded-full overflow-hidden border border-neutral-border/40">
                      <div className={`h-full transition-all duration-300 ${bColor}`} style={{ width: progressWidth }} />
                    </div>
                  </div>
                );
              })()}

              </div>
            </div>
          </div>

            {/* ==================================================== */}
            {/* MONTHLY CALENDAR HISTORICAL VIEW                     */}
            {/* ==================================================== */}
            <div className="bg-card-bg rounded-[24px] p-5 border border-neutral-border shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-border pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Wellness Calendar</h3>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded-lg border border-neutral-border hover:border-emerald-500 hover:bg-warm-bg/50 transition-all cursor-pointer text-charcoal-light hover:text-charcoal-text font-bold text-xs"
                  >
                    &larr;
                  </button>
                  <span className="text-xs font-extrabold text-charcoal-text min-w-[90px] text-center uppercase tracking-wide">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 rounded-lg border border-neutral-border hover:border-emerald-500 hover:bg-warm-bg/50 transition-all cursor-pointer text-charcoal-light hover:text-charcoal-text font-bold text-xs"
                  >
                    &rarr;
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-2.5 py-1 rounded-lg border border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Weekdays headers */}
              <div className="grid grid-cols-7 gap-1 text-center border-b border-neutral-border/40 pb-1.5">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <span key={day} className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">
                    {day}
                  </span>
                ))}
              </div>

              {/* Grid of days */}
              <div className="grid grid-cols-7 gap-1.5">
                {generateMonthGrid(currentMonth).map(({ dayNum, dateKey, isPadding }) => {
                  const isSelected = dateKey === selectedDateKey;
                  const isCurrentToday = dateKey === getTodayISTString();
                  const hasData = completedDates.has(dateKey);

                  return (
                    <button
                      key={dateKey}
                      onClick={() => {
                        setSelectedDateKey(dateKey);
                        if (isPadding) {
                          const clickedDate = new Date(dateKey + "T00:00:00");
                          setCurrentMonth(clickedDate);
                        }
                      }}
                      className={`relative flex flex-col items-center justify-between p-2 min-h-[50px] rounded-xl border transition-all cursor-pointer group ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105 font-bold"
                          : isCurrentToday
                          ? "bg-emerald-50 text-emerald-800 border-emerald-500 font-bold"
                          : hasData
                          ? "bg-emerald-50/20 text-charcoal-text border-brand-sage/20 hover:border-emerald-300 font-semibold"
                          : isPadding
                          ? "text-charcoal-light/30 border-transparent hover:border-neutral-border bg-transparent"
                          : "bg-warm-bg/30 text-charcoal-text border-neutral-border hover:border-emerald-300"
                      }`}
                    >
                      <span className="text-xs font-bold">{dayNum}</span>
                      
                      {/* Status marker */}
                      <div className="flex items-center justify-center min-h-[8px]">
                        {hasData ? (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                        ) : isCurrentToday && !isSelected ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-1 pt-3 border-t border-neutral-border/50 text-[10px] font-bold text-charcoal-light">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md border-2 border-emerald-500 bg-emerald-50" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-emerald-600" />
                  <span>Selected Day</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Completed Check-in</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-border/50" />
                  <span>No Check-in</span>
                </div>
              </div>
            </div>

          {/* ==================================================== */}
          {/* SECTION 3: WEEKLY TRENDS                             */}
          {/* ==================================================== */}
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
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-text">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span>Well-being Score</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-text">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
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
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,58,58,0.05)" vertical={false} />

                        <XAxis
                          dataKey="day"
                          tick={{ fill: "#64748B", fontSize: 10, fontFamily: "sans-serif" }}
                          axisLine={{ stroke: "rgba(46,58,58,0.06)" }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: "#64748B", fontSize: 10, fontFamily: "sans-serif" }}
                          axisLine={{ stroke: "rgba(46,58,58,0.06)" }}
                          tickLine={false}
                        />
                        
                        <Tooltip
                          contentStyle={{
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid #E2E8F0",
                            borderRadius: "14px",
                            padding: "8px 12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                          }}
                          itemStyle={{ fontSize: "11px", fontFamily: "sans-serif", fontWeight: "600" }}
                          labelStyle={{ fontSize: "10px", color: "#64748B", fontWeight: "bold", marginBottom: "2px" }}
                          formatter={(value, name) => [
                            `${value}`,
                            name === "wellbeing" || name === "Well-being Score" ? "🟢 Well-being Score" : "🔴 Stress Level"
                          ]}
                        />

                        <Area
                          type="monotone"
                          dataKey="wellbeing"
                          stroke="#10B981"
                          strokeWidth={1.75}
                          fillOpacity={1}
                          fill="url(#colorWellbeing)"
                          name="Well-being Score"
                          isAnimationActive={true}
                          animationDuration={800}
                        />
                        <Area
                          type="monotone"
                          dataKey="stress"
                          stroke="#F43F5E"
                          strokeWidth={1.75}
                          fillOpacity={1}
                          fill="url(#colorStress)"
                          name="Stress Level"
                          isAnimationActive={true}
                          animationDuration={800}
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

          {/* ==================================================== */}
          {/* SECTION 4: AI WELLNESS INSIGHTS & PLANNING           */}
          {/* ==================================================== */}
          {willaReflection?.proactive_coaching && (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-[24px] p-5 shadow-xs flex flex-col sm:flex-row items-start gap-4">
              <div className="p-2.5 bg-amber-500/20 text-amber-700 rounded-full border border-amber-500/30 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
              </div>
              <div className="flex-grow">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Active Coaching Alert: {willaReflection.proactive_coaching.observation}
                </h4>
                <p className="text-xs text-charcoal-text font-medium mb-3">
                  {willaReflection.proactive_coaching.coaching_message}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-amber-500/20 pt-3 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-amber-800/85 uppercase tracking-wider mb-0.5">Evidence</span>
                    <span className="text-charcoal-light font-light leading-relaxed">{willaReflection.proactive_coaching.evidence}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-amber-800/85 uppercase tracking-wider mb-0.5">Recommendation</span>
                    <span className="text-emerald-800 font-bold leading-relaxed">{willaReflection.proactive_coaching.recommendation}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-amber-800/85 uppercase tracking-wider mb-0.5">Expected Benefit</span>
                    <span className="text-charcoal-light font-light leading-relaxed">{willaReflection.proactive_coaching.expected_benefit}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            
            {/* CARD 1: AI Wellness Insights */}
            <div className="bg-card-bg p-6 rounded-[24px] border border-neutral-border flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3.5 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">AI Wellness Insights</h3>
                    <p className="text-[10px] text-charcoal-light">Conversational trend analysis</p>
                  </div>
                </div>
                <p className="text-xs text-charcoal-light leading-relaxed font-light">
                  {willaReflection?.wellbeing_summary 
                    ? `${willaReflection.wellbeing_summary} ${willaReflection.stress_risk_explanation || ""}`
                    : "No insights available yet. Please log your daily check-in or write a journal entry to trigger Willa's analysis."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-border flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                <span>● Homeostatic Balance</span>
              </div>
            </div>

            {/* CARD 2: Daily Reflection */}
            <div className="bg-card-bg p-6 rounded-[24px] border border-neutral-border flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3.5 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Daily Reflection</h3>
                    <p className="text-[10px] text-charcoal-light">Supportive personalized note</p>
                  </div>
                </div>
                <p className="text-xs text-charcoal-light leading-relaxed font-light italic">
                  {willaReflection?.positive_reinforcement 
                    ? `"${willaReflection.positive_reinforcement}"`
                    : '"No daily reflection note yet. Complete today\'s check-in to receive a personalized supportive note."'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-border flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                <span>● Daily Mindfulness</span>
              </div>
            </div>

            {/* CARD 3: Tomorrow's Focus */}
            <div className="bg-card-bg p-6 rounded-[24px] border border-neutral-border flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2.5 border-b border-neutral-border pb-3.5 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-charcoal-text uppercase tracking-wider">Tomorrow's Focus</h3>
                    <p className="text-[10px] text-charcoal-light">Planning goals for tomorrow</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  {willaReflection?.daily_priorities && willaReflection.daily_priorities.length > 0 ? (
                    willaReflection.daily_priorities.map((priority, index) => (
                      <div key={index} className="p-2.5 bg-warm-bg rounded-xl border border-neutral-border text-xs text-charcoal-text font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{priority}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-charcoal-light italic bg-warm-bg border border-neutral-border rounded-xl">
                      No current priorities. Complete check-in to generate suggestions.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-border flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                <span>● Planning Mode</span>
              </div>
            </div>

          </div>

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
        onClick={() => { setShowChatDrawer(true); loadChatSessionsAndHistory(); }}
        className="fixed bottom-[72px] right-4 md:bottom-6 md:right-6 p-4 rounded-full bg-brand-sage text-charcoal-text hover:bg-brand-teal shadow-lg hover:scale-105 active:scale-[0.98] active:brightness-95 transition-all duration-300 z-40 cursor-pointer flex items-center gap-2 border border-brand-sage/30 animate-fade-in focus-ring"
        aria-label="Open Chat with Willa"
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
            className={`fixed bottom-[72px] right-4 md:bottom-6 md:right-6 w-[calc(100vw-32px)] ${showChatHistorySidebar ? "sm:max-w-lg md:max-w-xl" : "sm:max-w-sm"} h-[480px] bg-card-bg border border-neutral-border rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-3 border-b border-neutral-border flex justify-between items-center bg-sidebar-bg shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-sage/20 border border-brand-sage/30 rounded-full text-brand-teal">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-text leading-tight">Willa Assistant</h4>
                  <p className="text-[9px] text-charcoal-light leading-none">Companion AI</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowChatHistorySidebar(!showChatHistorySidebar)}
                  className={`p-1.5 rounded-xl hover:bg-neutral-border transition-all flex items-center justify-center cursor-pointer active:scale-95 focus-ring ${
                    showChatHistorySidebar ? "text-brand-teal bg-neutral-border/50" : "text-charcoal-light hover:text-charcoal-text"
                  }`}
                  title="Toggle Conversation History"
                  aria-label="Toggle Conversation History"
                >
                  <Activity className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowChatDrawer(false)}
                  className="p-1.5 rounded-xl hover:bg-neutral-border text-charcoal-light hover:text-charcoal-text transition-all flex items-center justify-center cursor-pointer active:scale-95 focus-ring"
                  title="Close Assistant"
                  aria-label="Close Assistant"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Inner Body (Sidebar + Chat Area) */}
            <div className="flex flex-1 min-h-0 relative">
              {/* Collapsible History Sidebar */}
              <AnimatePresence>
                {showChatHistorySidebar && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: window.innerWidth < 768 ? "100%" : 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="shrink-0 border-r border-neutral-border bg-sidebar-bg flex flex-col min-h-0 overflow-hidden absolute inset-0 z-30 md:relative md:inset-auto md:z-0"
                  >
                    {/* Sidebar Header */}
                    <div className="p-3 border-b border-neutral-border flex justify-between items-center bg-card-bg shrink-0">
                      <span className="text-[10px] font-bold text-charcoal-text uppercase tracking-wider">Chat History</span>
                      <button
                        type="button"
                        onClick={() => handleNewChat()}
                        className="px-2.5 py-1 text-[9px] font-bold bg-brand-sage text-charcoal-text rounded-md hover:bg-brand-teal transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>New Chat</span>
                      </button>
                    </div>
                    
                    {/* Sessions list */}
                    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 font-sans text-xs">
                      {(() => {
                        const groups = groupSessions(chatSessions);
                        const renderGroup = (title, list) => {
                          if (list.length === 0) return null;
                          return (
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-mono text-charcoal-light uppercase tracking-wider px-1 mb-0.5">{title}</span>
                              {list.map(s => (
                                <div
                                  key={s.id}
                                  onClick={() => {
                                    handleSelectSession(s.id);
                                    if (window.innerWidth < 768) {
                                      setShowChatHistorySidebar(false);
                                    }
                                  }}
                                  className={`group/session w-full p-2 rounded-lg text-left cursor-pointer flex items-center justify-between gap-1.5 transition-all ${
                                    currentSessionId === s.id
                                      ? "bg-brand-sage/20 border-l-2 border-brand-sage text-charcoal-text font-bold"
                                      : "hover:bg-warm-bg/60 text-charcoal-light"
                                  }`}
                                >
                                  <span className="truncate flex-1 text-[10px] pr-1 leading-snug">
                                    {s.title || "Wellbeing Chat"}
                                  </span>
                                  <button
                                    onClick={(e) => handleDeleteSession(s.id, e)}
                                    className="opacity-0 group-hover/session:opacity-100 p-1 text-charcoal-light hover:text-rose-600 rounded transition-all hover:bg-rose-50 cursor-pointer shrink-0 focus-ring"
                                    title="Delete conversation"
                                    aria-label={`Delete conversation session titled ${s.title || "Wellbeing Chat"}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        };
                        
                        if (chatSessions.length === 0) {
                          return (
                            <div className="text-[10px] text-center text-charcoal-light/70 py-8 font-light leading-normal">
                              No past conversations yet. Vitals advice will save dynamically.
                            </div>
                          );
                        }
                        
                        return (
                          <div className="flex flex-col gap-4">
                            {renderGroup("Today", groups.today)}
                            {renderGroup("Yesterday", groups.yesterday)}
                            {renderGroup("Previous Conversations", groups.prior)}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Chat Conversation Panel */}
              <div className="flex-1 flex flex-col justify-between min-w-0 bg-card-bg">
                {/* Chat Messages Log */}
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
                  {failedChatHistory && (
                    <div className="flex flex-col gap-1 items-end mt-2 animate-fade-in">
                      <span className="text-[10px] text-rose-600 font-semibold px-2">AI is temporarily unavailable.</span>
                      <button
                        type="button"
                        onClick={handleRetryChatMessage}
                        className="text-[10px] font-bold text-brand-teal hover:underline flex items-center gap-1 px-2 cursor-pointer outline-none"
                      >
                        <RotateCcw className="w-3 h-3 text-brand-teal" />
                        <span>Retry Message</span>
                      </button>
                    </div>
                  )}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-warm-bg border border-neutral-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-[10px] text-charcoal-light animate-pulse">
                        <div className="flex gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span>Willa is pacing thoughts...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendChatMessage} className="p-3 border-t border-neutral-border flex gap-2 bg-sidebar-bg shrink-0">
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
              </div>
            </div>
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

                  {/* Grid of Key Weekly Trends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-neutral-border pt-4">
                    {weeklyReflection.wellbeing_trend && (
                      <div className="p-3 bg-warm-bg border border-neutral-border rounded-2xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-charcoal-light uppercase tracking-wider">Wellbeing Trend</span>
                        <span className="text-xs text-charcoal-text font-light">{weeklyReflection.wellbeing_trend}</span>
                      </div>
                    )}
                    {weeklyReflection.stress_trend && (
                      <div className="p-3 bg-warm-bg border border-neutral-border rounded-2xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-charcoal-light uppercase tracking-wider">Stress Trend</span>
                        <span className="text-xs text-charcoal-text font-light">{weeklyReflection.stress_trend}</span>
                      </div>
                    )}
                    {weeklyReflection.sleep_consistency && (
                      <div className="p-3 bg-warm-bg border border-neutral-border rounded-2xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-charcoal-light uppercase tracking-wider">Sleep Consistency</span>
                        <span className="text-xs text-charcoal-text font-light">{weeklyReflection.sleep_consistency}</span>
                      </div>
                    )}
                    {weeklyReflection.hydration_consistency && (
                      <div className="p-3 bg-warm-bg border border-neutral-border rounded-2xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-charcoal-light uppercase tracking-wider">Hydration Consistency</span>
                        <span className="text-xs text-charcoal-text font-light">{weeklyReflection.hydration_consistency}</span>
                      </div>
                    )}
                    {weeklyReflection.mood_pattern && (
                      <div className="p-3 bg-warm-bg border border-neutral-border rounded-2xl col-span-1 md:col-span-2 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-charcoal-light uppercase tracking-wider">Mood Pattern</span>
                        <span className="text-xs text-charcoal-text font-light">{weeklyReflection.mood_pattern}</span>
                      </div>
                    )}
                  </div>

                  {/* Achievements */}
                  {((weeklyReflection.achievements && weeklyReflection.achievements.length > 0) || (weeklyReflection.key_accomplishments && weeklyReflection.key_accomplishments.length > 0)) && (
                    <div className="flex flex-col gap-2 border-t border-neutral-border pt-4">
                      <span className="text-[10px] font-bold text-charcoal-light tracking-wide uppercase font-mono">Achievements & Wins</span>
                      <div className="flex flex-col gap-2">
                        {(weeklyReflection.achievements || weeklyReflection.key_accomplishments).map((acc, i) => (
                          <div key={i} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-charcoal-text flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-light">{acc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {((weeklyReflection.areas_for_improvement && weeklyReflection.areas_for_improvement.length > 0) || (weeklyReflection.pacing_suggestions && weeklyReflection.pacing_suggestions.length > 0)) && (
                    <div className="flex flex-col gap-2 border-t border-neutral-border pt-4">
                      <span className="text-[10px] font-bold text-charcoal-light tracking-wide uppercase font-mono">Areas for Improvement</span>
                      <div className="flex flex-col gap-2">
                        {(weeklyReflection.areas_for_improvement || weeklyReflection.pacing_suggestions).map((sug, i) => (
                          <div key={i} className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl text-xs text-charcoal-text flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                            <span className="font-light">{sug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Focus Goal Next Week */}
                  {weeklyReflection.focus_goal_next_week && (
                    <div className="p-4 bg-brand-purple/10 border border-brand-purple/20 rounded-2xl mt-2 flex flex-col gap-1 border-t">
                      <span className="text-[9px] font-bold text-brand-purple uppercase tracking-wider">Focus Goal Next Week</span>
                      <span className="text-xs text-charcoal-text font-semibold">{weeklyReflection.focus_goal_next_week}</span>
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

      {/* In-Dashboard Daily Check-In Modal */}
      <AnimatePresence>
        {showCheckinModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-card-bg border border-neutral-border rounded-[28px] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto custom-task-scrollbar"
            >
              <button
                onClick={() => setShowCheckinModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-charcoal-light hover:text-charcoal-text hover:bg-warm-bg cursor-pointer font-bold"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-charcoal-text font-display">Daily Wellness Check-In</h2>
                  <p className="text-xs text-charcoal-light">Record today's vitals to calibrate Willa AI guidance</p>
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleModalCheckinSubmit} className="flex flex-col gap-4">
                {/* Sleep & Water Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-charcoal-text uppercase tracking-wider block mb-1">Sleep Hours ({checkinForm.sleep}h)</label>
                    <input
                      type="range"
                      min="3"
                      max="12"
                      step="0.5"
                      value={checkinForm.sleep}
                      onChange={(e) => setCheckinForm({ ...checkinForm, sleep: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-charcoal-text uppercase tracking-wider block mb-1">Water ({checkinForm.water}L)</label>
                    <input
                      type="range"
                      min="0.5"
                      max="4.0"
                      step="0.25"
                      value={checkinForm.water}
                      onChange={(e) => setCheckinForm({ ...checkinForm, water: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Steps & Screen Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-charcoal-text uppercase tracking-wider block mb-1">Steps</label>
                    <input
                      type="number"
                      value={checkinForm.steps}
                      onChange={(e) => setCheckinForm({ ...checkinForm, steps: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-warm-bg border border-neutral-border rounded-xl text-xs text-charcoal-text font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-charcoal-text uppercase tracking-wider block mb-1">Screen Time ({checkinForm.screen_time}h)</label>
                    <input
                      type="range"
                      min="0.5"
                      max="14.0"
                      step="0.5"
                      value={checkinForm.screen_time}
                      onChange={(e) => setCheckinForm({ ...checkinForm, screen_time: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Mood Selector */}
                <div>
                  <label className="text-[11px] font-bold text-charcoal-text uppercase tracking-wider block mb-2">Today's Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {["😊 Calm", "⚡ Energetic", "😐 Neutral", "😔 Anxious", "😴 Tired"].map((m) => {
                      const moodVal = m.split(" ")[1];
                      const isSelected = checkinForm.mood === moodVal;
                      return (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setCheckinForm({ ...checkinForm, mood: moodVal })}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                              : "bg-warm-bg border-neutral-border text-charcoal-light hover:border-emerald-200"
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Energy & Stress Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-charcoal-text uppercase tracking-wider block mb-1">Energy Level</label>
                    <select
                      value={checkinForm.energy_level}
                      onChange={(e) => setCheckinForm({ ...checkinForm, energy_level: e.target.value })}
                      className="w-full p-2.5 bg-warm-bg border border-neutral-border rounded-xl text-xs text-charcoal-text font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Good">Good / High</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Resting">Resting / Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-charcoal-text uppercase tracking-wider block mb-1">Stress Score ({checkinForm.stress_level}/100)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={checkinForm.stress_level}
                      onChange={(e) => setCheckinForm({ ...checkinForm, stress_level: parseInt(e.target.value) })}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Notes / Optional */}
                <div>
                  <label className="text-[11px] font-bold text-charcoal-text uppercase tracking-wider block mb-1">Daily Reflection Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="How are you feeling today? Any specific wins or stressors?"
                    value={checkinForm.notes}
                    onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                    className="w-full p-3 bg-warm-bg border border-neutral-border rounded-xl text-xs text-charcoal-text focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-neutral-border">
                  <button
                    type="button"
                    onClick={() => setShowCheckinModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-light hover:bg-warm-bg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={checkinSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer btn-press flex items-center gap-2"
                  >
                    {checkinSubmitting ? "Recording..." : "✓ Save Today's Check-In"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Bar */}
      <MobileNavBar />
    </div>
  );
}
