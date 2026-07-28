/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Check, ArrowLeft, Smile, Meh, Frown, Activity, Moon, Droplet, Flame, Smartphone, Sparkles, Loader2, AlertCircle, Brain } from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

export default function DailyCheckin() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // Resolve target date from query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const targetDate = queryParams.get("date") || todayStr;
  const isToday = targetDate === todayStr;

  const [mood, setMood] = useState("Stable");
  const [sleep, setSleep] = useState(8.0);
  const [water, setWater] = useState(2.0);
  const [steps, setSteps] = useState(8000);
  const [screenTime, setScreenTime] = useState(4.0);
  const [heartRate, setHeartRate] = useState(72);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);
  
  // Standalone Mode 2 parameters
  const [wearableConnected, setWearableConnected] = useState(true);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [workPressure, setWorkPressure] = useState(3);
  const [anxietyLevel, setAnxietyLevel] = useState(3);
  const [motivation, setMotivation] = useState(7);
  const [appetite, setAppetite] = useState(7);
  const [socialInteraction, setSocialInteraction] = useState(7);
  const [physicalActivity, setPhysicalActivity] = useState(5);
  
  const [completed, setCompleted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Preload existing log if present
  useEffect(() => {
    const fetchExistingRecord = async () => {
      setLoadingRecord(true);
      try {
        const res = await api.get(`/wellbeing/date/${targetDate}`);
        if (res.data) {
          const rec = res.data;
          setMood(rec.mood || "Stable");
          setSleep(rec.sleep !== null ? rec.sleep : 8.0);
          setWater(rec.water !== null ? rec.water : 2.0);
          setSteps(rec.steps !== null ? rec.steps : 8000);
          setScreenTime(rec.screen_time !== null ? rec.screen_time : 4.0);
          setHeartRate(rec.heart_rate !== null ? rec.heart_rate : 72);
          setEnergyLevel(rec.energy_level !== null ? rec.energy_level : 7);
          setStressLevel(rec.stress_level !== null ? rec.stress_level : 3);
          
          setWearableConnected(rec.wearable_connected || false);
          setSleepQuality(rec.sleep_quality !== null ? rec.sleep_quality : 7);
          setWorkPressure(rec.work_pressure !== null ? rec.work_pressure : 3);
          setAnxietyLevel(rec.anxiety_level !== null ? rec.anxiety_level : 3);
          setMotivation(rec.motivation !== null ? rec.motivation : 7);
          setAppetite(rec.appetite !== null ? rec.appetite : 7);
          setSocialInteraction(rec.social_interaction !== null ? rec.social_interaction : 7);
          setPhysicalActivity(rec.physical_activity !== null ? rec.physical_activity : 5);
        }
      } catch (err) {
        console.error("Failed to preload check-in values", err);
      } finally {
        setLoadingRecord(false);
      }
    };
    fetchExistingRecord();
  }, [targetDate]);

  const validateForm = () => {
    const errors = {};
    if (wearableConnected) {
      const hr = Number(heartRate);
      if (heartRate === "" || heartRate === null || heartRate === undefined) {
        errors.heartRate = "Resting heart rate is required.";
      } else if (!Number.isInteger(hr) || hr < 40 || hr > 150) {
        errors.heartRate = "Resting heart rate must be a whole number between 40 and 150.";
      }

      const parsedSteps = Number(steps);
      if (isNaN(parsedSteps) || parsedSteps < 0 || parsedSteps > 20000) {
        errors.steps = "Steps must be a number between 0 and 20,000.";
      }
    }

    const sleepNum = Number(sleep);
    if (isNaN(sleepNum) || sleepNum < 4 || sleepNum > 12) {
      errors.sleep = "Sleep duration must be between 4 and 12 hours.";
    }

    const waterNum = Number(water);
    if (isNaN(waterNum) || waterNum < 0 || waterNum > 4) {
      errors.water = "Water intake must be between 0 and 4 Liters.";
    }

    const screenNum = Number(screenTime);
    if (isNaN(screenNum) || screenNum < 0 || screenNum > 12) {
      errors.screenTime = "Screen time must be between 0 and 12 hours.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setApiError("");
    setValidationErrors({});

    if (!validateForm()) {
      setSubmitLoading(false);
      addToast("Please correct the validation errors.", "error");
      return;
    }

    try {
      const payload = {
        mood,
        sleep: Number(sleep),
        water: Number(water),
        screen_time: Number(screenTime),
        energy_level: Number(energyLevel),
        stress_level: Number(stressLevel),
        wearable_connected: wearableConnected,
        steps: wearableConnected ? Number(steps) : null,
        heart_rate: (wearableConnected && heartRate) ? Number(heartRate) : null,
        sleep_quality: !wearableConnected ? Number(sleepQuality) : null,
        work_pressure: !wearableConnected ? Number(workPressure) : null,
        anxiety_level: !wearableConnected ? Number(anxietyLevel) : null,
        motivation: !wearableConnected ? Number(motivation) : null,
        appetite: !wearableConnected ? Number(appetite) : null,
        social_interaction: !wearableConnected ? Number(socialInteraction) : null,
        physical_activity: !wearableConnected ? Number(physicalActivity) : null,
      };

      await api.put(`/wellbeing/date/${targetDate}`, payload);

      addToast("Wellbeing check-in logged successfully.", "success");
      window.dispatchEvent(new Event("wellwish_data_updated"));
      setCompleted(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      let errorMsg = "Failed to submit check-in. Please try again.";
      if (!navigator.onLine) {
        errorMsg = "Unable to connect to the server. Please check your internet connection.";
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMsg = "Request timed out. Please try again.";
      } else if (err.response) {
        if (err.response.status === 401) {
          errorMsg = "Session expired. Please log in again.";
        } else if (err.response.status >= 500) {
          errorMsg = "Internal server error. Please try again later.";
        } else if (err.response.data?.detail) {
          errorMsg = err.response.data.detail;
        }
      }
      addToast(errorMsg, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg text-charcoal-text flex items-center justify-center py-12 px-6 relative overflow-hidden grid-bg font-sans">
      
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-brand-sage/10 blur-[90px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-brand-purple/5 blur-[90px] pointer-events-none animate-pulse-slow" />

      <Link
        to="/dashboard"
        className="absolute top-6 left-6 text-sm font-semibold text-charcoal-light hover:text-charcoal-text flex items-center gap-2 px-4 py-2 rounded-full bg-card-bg border border-neutral-border hover:bg-warm-bg/50 transition-all z-20 shadow-xs"
      >
        <ArrowLeft className="w-4 h-4 text-charcoal-light" />
        <span>Dashboard</span>
      </Link>

      <div className="w-full max-w-2xl relative z-10">
        
        <div className="flex flex-col items-center gap-3 mb-8 text-center animate-fade-in">
          <div className="bg-brand-sage/20 p-2.5 rounded-full border border-brand-sage/35 shadow-xs">
            <Heart className="w-5 h-5 text-brand-teal fill-brand-teal/20" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-charcoal-text">
              {isToday ? "Daily Calibration" : `Edit Check-In (${targetDate})`}
            </h2>
            <p className="text-xs text-charcoal-light mt-1">Submit your indicators to refresh your wellbeing suggestions</p>
          </div>
        </div>

        <div className="p-[1px] rounded-[32px] bg-neutral-border shadow-xs">
          <div className="bg-card-bg rounded-[31px] p-8 flex flex-col gap-6 border border-neutral-border">
            
            {apiError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-600 text-xs rounded-xl flex gap-2.5 items-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{apiError}</span>
              </div>
            )}

            {loadingRecord ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-charcoal-light font-semibold">Preloading your check-in metrics...</p>
              </div>
            ) : completed ? (
              <div className="py-16 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-sage/20 border border-brand-sage/30 text-brand-teal flex items-center justify-center animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal-text">Check-in Completed</h3>
                  <p className="text-xs text-charcoal-light mt-1">Aligning your daily support prompts...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Wearable Connection Toggle */}
                <div className="flex items-center justify-between p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-charcoal-text">Steps & Heart Rate Logging</span>
                    <span className="text-[10px] text-charcoal-light">Manually log step counts and resting heart rate alongside daily wellness metrics.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWearableConnected(!wearableConnected)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 flex items-center cursor-pointer outline-none ${
                      wearableConnected ? "bg-brand-teal justify-end" : "bg-neutral-border justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-card-bg shadow-sm animate-fade-in" />
                  </button>
                </div>

                {/* 1. Mood */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-charcoal-light tracking-wider">HOW ARE YOU FEELING?</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setMood("Stable")}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer outline-none ${
                        mood === "Stable"
                          ? "bg-brand-sage/25 border-brand-sage text-charcoal-text"
                          : "bg-warm-bg border-neutral-border text-charcoal-light hover:text-charcoal-text"
                      }`}
                    >
                      <Smile className="w-5 h-5 text-brand-teal" />
                      <span className="text-[10px] font-bold">Stable / Calm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMood("Neutral")}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer outline-none ${
                        mood === "Neutral"
                          ? "bg-brand-blue/20 border-brand-blue text-charcoal-text"
                          : "bg-warm-bg border-neutral-border text-charcoal-light hover:text-charcoal-text"
                      }`}
                    >
                      <Meh className="w-5 h-5 text-brand-teal" />
                      <span className="text-[10px] font-bold">Neutral</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMood("Strained")}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer outline-none ${
                        mood === "Strained"
                          ? "bg-brand-purple/20 border-brand-purple text-charcoal-text"
                          : "bg-warm-bg border-neutral-border text-charcoal-light hover:text-charcoal-text"
                      }`}
                    >
                      <Frown className="w-5 h-5 text-brand-purple" />
                      <span className="text-[10px] font-bold">Strained</span>
                    </button>
                  </div>
                </div>

                {/* Sliders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Sleep hours (Common) */}
                  <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                    <div className="flex justify-between items-center text-charcoal-light">
                      <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-brand-purple" />
                        <span>Sleep duration</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-charcoal-text">{sleep} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      step="0.5"
                      value={sleep}
                      onChange={(e) => setSleep(e.target.value)}
                      className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-purple"
                    />
                  </div>

                  {/* Sleep Quality (Mode 2 Standalone Only) */}
                  {!wearableConnected && (
                    <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                      <div className="flex justify-between items-center text-charcoal-light">
                        <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                          <Moon className="w-3.5 h-3.5 text-brand-purple" />
                          <span>Sleep Quality</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-charcoal-text">{sleepQuality} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={sleepQuality}
                        onChange={(e) => setSleepQuality(e.target.value)}
                        className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-purple"
                      />
                    </div>
                  )}

                  {/* Water Intake (Common) */}
                  <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                    <div className="flex justify-between items-center text-charcoal-light">
                      <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Hydration log</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-charcoal-text">{water} Liters</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="0.25"
                      value={water}
                      onChange={(e) => setWater(e.target.value)}
                      className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-teal"
                    />
                  </div>

                  {/* Steps (Mode 1 Wearable Only) */}
                  {wearableConnected && (
                    <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                      <div className="flex justify-between items-center text-charcoal-light">
                        <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-brand-teal" />
                          <span>Daily Steps</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-charcoal-text">{Number(steps).toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20000"
                        step="500"
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                        className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-teal"
                      />
                    </div>
                  )}

                  {/* Screen Time (Common) */}
                  <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                    <div className="flex justify-between items-center text-charcoal-light">
                      <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-brand-purple" />
                        <span>Screen exposure</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-charcoal-text">{screenTime} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="0.5"
                      value={screenTime}
                      onChange={(e) => setScreenTime(e.target.value)}
                      className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-purple"
                    />
                  </div>

                  {/* Energy level (Common) */}
                  <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                    <div className="flex justify-between items-center text-charcoal-light">
                      <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Energy level</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-charcoal-text">{energyLevel} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(e.target.value)}
                      className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-teal"
                    />
                  </div>

                  {/* Stress level (Common) */}
                  <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                    <div className="flex justify-between items-center text-charcoal-light">
                      <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-brand-purple" />
                        <span>Stress level</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-charcoal-text">{stressLevel} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value)}
                      className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-purple"
                    />
                  </div>

                  {/* Standalone Check-in Fields (Mode 2 Only) */}
                  {!wearableConnected && (
                    <>
                      {/* Physical Activity */}
                      <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                        <div className="flex justify-between items-center text-charcoal-light">
                          <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-brand-teal" />
                            <span>Physical Activity</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-charcoal-text">{physicalActivity} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={physicalActivity}
                          onChange={(e) => setPhysicalActivity(e.target.value)}
                          className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-teal"
                        />
                      </div>

                      {/* Work/Study Pressure */}
                      <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                        <div className="flex justify-between items-center text-charcoal-light">
                          <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-brand-purple" />
                            <span>Work/Study Pressure</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-charcoal-text">{workPressure} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={workPressure}
                          onChange={(e) => setWorkPressure(e.target.value)}
                          className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-purple"
                        />
                      </div>

                      {/* Anxiety Level */}
                      <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                        <div className="flex justify-between items-center text-charcoal-light">
                          <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-brand-purple" />
                            <span>Anxiety Level</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-charcoal-text">{anxietyLevel} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={anxietyLevel}
                          onChange={(e) => setAnxietyLevel(e.target.value)}
                          className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-purple"
                        />
                      </div>

                      {/* Motivation */}
                      <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                        <div className="flex justify-between items-center text-charcoal-light">
                          <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                            <span>Motivation</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-charcoal-text">{motivation} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={motivation}
                          onChange={(e) => setMotivation(e.target.value)}
                          className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-teal"
                        />
                      </div>

                      {/* Appetite */}
                      <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                        <div className="flex justify-between items-center text-charcoal-light">
                          <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-brand-teal" />
                            <span>Appetite Score</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-charcoal-text">{appetite} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={appetite}
                          onChange={(e) => setAppetite(e.target.value)}
                          className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-teal"
                        />
                      </div>

                      {/* Social Interaction */}
                      <div className="flex flex-col gap-2.5 p-4 bg-warm-bg border border-neutral-border rounded-2xl">
                        <div className="flex justify-between items-center text-charcoal-light">
                          <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5 text-brand-teal" />
                            <span>Social Interaction</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-charcoal-text">{socialInteraction} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={socialInteraction}
                          onChange={(e) => setSocialInteraction(e.target.value)}
                          className="w-full h-1 bg-[#E8E8E4] rounded-lg appearance-none cursor-pointer accent-brand-teal"
                        />
                      </div>
                    </>
                  )}

                </div>

                {/* Resting Heart rate (Mode 1 Only) */}
                {wearableConnected && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-charcoal-light tracking-wide">RESTING HEART RATE (BPM)</label>
                    <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all">
                      <div className="flex bg-warm-bg rounded-[11px] px-3 items-center">
                        <Activity className="w-4 h-4 text-charcoal-light mr-2 shrink-0" />
                        <input
                          type="number"
                          min="40"
                          max="150"
                          placeholder="70"
                          value={heartRate}
                          onChange={(e) => {
                            setHeartRate(e.target.value);
                            if (validationErrors.heartRate) {
                              setValidationErrors(prev => ({ ...prev, heartRate: "" }));
                            }
                          }}
                          className="w-full py-3 bg-transparent text-charcoal-text text-xs outline-none border-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    {validationErrors.heartRate && (
                      <span className="text-[10px] text-rose-600 font-medium px-1 animate-fade-in">{validationErrors.heartRate}</span>
                    )}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-4 rounded-full bg-brand-sage text-charcoal-text font-bold text-xs hover:bg-brand-teal shadow-sm hover:scale-[1.025] active:scale-[0.98] transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 outline-none"
                >
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin text-charcoal-text" /> : <Sparkles className="w-4 h-4 text-charcoal-text" />}
                  <span>{submitLoading ? "Aligning check-in indicators..." : "Submit Check-in"}</span>
                </button>

              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
