/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  Heart,
  Brain,
  Sparkles,
  Shield,
  Activity,
  Smile,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Hero() {
  const { user } = useAuth();
  const [pulseScale, setPulseScale] = useState(1);
  const [wellbeingScore, setWellbeingScore] = useState(86);

  // Animate pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.08 : 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Simulating live data fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setWellbeingScore((prev) => {
        const diff = Math.floor(Math.random() * 3) - 1;
        const next = prev + diff;
        return Math.max(80, Math.min(94, next));
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-24 overflow-hidden flex items-center justify-center bg-warm-bg grid-bg">
      {/* Soft Calming Mesh Glows */}
      <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] rounded-full bg-brand-sage/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-brand-purple/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Soft Wellness Tag */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card-bg border border-neutral-border text-xs font-semibold text-charcoal-light mb-8 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
              <span>A Kind Space for Mindful Work</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-sage animate-ping" />
            </motion.div>
 
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-charcoal-text leading-[1.15] mb-6"
            >
              Understand your wellbeing with AI <br />
              <span className="bg-gradient-to-r from-brand-sage via-brand-teal to-brand-purple bg-clip-text text-transparent font-black">
                that supports, not judges.
              </span>
            </motion.h1>
 
            {/* Value pillars communicating problem, solution, AI benefit, and trust */}
            <div className="flex flex-col gap-4 mb-10 max-w-xl text-charcoal-light">
              <p className="text-sm leading-relaxed font-light">
                <strong className="text-charcoal-text block font-semibold mb-0.5">The Challenge</strong>
                Daily routines make it easy to ignore the build-up of mental fatigue until we feel completely drained.
              </p>
              <p className="text-sm leading-relaxed font-light">
                <strong className="text-charcoal-text block font-semibold mb-0.5">Our Solution</strong>
                WellWish is a friendly check-in companion helping you track sleep, water, screen exposure, and daily reflections.
              </p>
              <p className="text-sm leading-relaxed font-light">
                <strong className="text-charcoal-text block font-semibold mb-0.5">Why AI Helps</strong>
                By connecting written journals with daily statistics, Willa detects subtle energy shifts to offer supportive advice.
              </p>
              <p className="text-sm leading-relaxed font-light flex items-start gap-2">
                <Shield className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                <span>
                  <strong className="text-charcoal-text block font-semibold mb-0.5">Built on Trust</strong>
                  All logs are safely processed using secure cloud-based AI and protected by standard JWT authentication, ensuring complete privacy.
                </span>
              </p>
            </div>
 
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 rounded-full bg-brand-sage text-center font-bold text-sm text-charcoal-text shadow-sm hover:bg-brand-teal hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-charcoal-text group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-full bg-brand-sage text-center font-bold text-sm text-charcoal-text shadow-sm hover:bg-brand-teal hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <span>Begin My Journey</span>
                  <ArrowRight className="w-4 h-4 text-charcoal-text group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-full bg-card-bg text-center font-bold text-sm text-charcoal-light border border-neutral-border hover:bg-warm-bg/50 hover:text-charcoal-text transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-brand-teal fill-brand-teal/10" />
                <span>Learn How It Works</span>
              </a>
            </motion.div>
 
          </div>
 
          {/* Visual Platform Playground (Floating Cards) */}
          <div className="lg:col-span-5 relative h-[480px] w-full flex items-center justify-center">
            
            {/* Center soft glow */}
            <div className="absolute w-[200px] h-[200px] rounded-full bg-brand-sage/10 blur-[30px] pointer-events-none" />
            
            {/* Card 1: Heart biometrics */}
            <motion.div
              initial={{ opacity: 0, x: -40, y: "-5%" }}
              animate={{ opacity: 1, x: 0, y: ["-5%", "-3%", "-5%"] }}
              transition={{
                opacity: { duration: 0.8, ease: "easeOut", delay: 0.2 },
                x: { duration: 0.8, ease: "easeOut", delay: 0.2 },
                y: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              }}
              className="absolute top-4 left-4 sm:left-8 w-[230px] bg-card-bg rounded-3xl p-5 border border-neutral-border shadow-md flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-sage/20 p-2 rounded-full">
                    <Heart
                      className="w-4 h-4 text-brand-teal fill-brand-teal/10 transition-transform duration-500"
                      style={{ transform: `scale(${pulseScale})` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-charcoal-text">Heart Rhythm</span>
                </div>
                <span className="text-[9px] text-brand-sage font-bold bg-brand-sage/15 px-2 py-0.5 rounded-full">Optimal</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-charcoal-text font-display">72 <span className="text-xs text-charcoal-light font-light">bpm</span></div>
                <div className="text-[10px] text-charcoal-light mt-0.5">HRV is gentle and balanced</div>
              </div>
              
              <div className="h-8 w-full mt-1 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                  <path
                    d="M0,15 L20,15 L25,10 L30,20 L35,15 L45,15 L48,5 L52,25 L56,15 L70,15 L74,12 L78,18 L82,15 L100,15"
                    stroke="var(--color-brand-teal)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>
 
            {/* Card 2: Wellbeing Index Card */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: "10%" }}
              animate={{ opacity: 1, x: 0, y: ["10%", "8%", "10%"] }}
              transition={{
                opacity: { duration: 0.8, ease: "easeOut", delay: 0.4 },
                x: { duration: 0.8, ease: "easeOut", delay: 0.4 },
                y: {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }
              }}
              className="absolute right-0 sm:right-4 w-[250px] bg-card-bg rounded-3xl p-5 border border-neutral-border shadow-md flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="bg-brand-purple/20 p-2 rounded-full">
                  <Brain className="w-4 h-4 text-brand-purple" />
                </div>
                <span className="text-xs font-semibold text-charcoal-text">Wellbeing Index</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-extrabold text-charcoal-text font-display">{wellbeingScore}%</div>
                  <p className="text-[10px] text-brand-teal mt-0.5 font-bold uppercase">Optimal Zone</p>
                </div>
                
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#F1F1ED" strokeWidth="4" fill="none" />
                    <circle cx="24" cy="24" r="20" stroke="var(--color-brand-teal)" strokeWidth="4" fill="none" strokeDasharray="125" strokeDashoffset={125 - (125 * wellbeingScore) / 100} className="transition-all duration-1000" />
                  </svg>
                  <span className="absolute text-[8px] font-mono text-charcoal-light font-bold">OK</span>
                </div>
              </div>
              <div className="text-[10px] text-charcoal-light bg-warm-bg/70 p-2.5 rounded-xl border border-neutral-border/50">
                Cognitive energy levels are stable and calm.
              </div>
            </motion.div>
 
            {/* Card 3: Willa recommendation */}
            <motion.div
              initial={{ opacity: 0, y: "30%" }}
              animate={{ opacity: 1, y: ["30%", "32%", "30%"] }}
              transition={{
                opacity: { duration: 0.8, ease: "easeOut", delay: 0.5 },
                y: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }
              }}
              className="absolute bottom-4 left-6 sm:left-10 w-[270px] bg-card-bg rounded-3xl p-5 border border-neutral-border shadow-md flex items-start gap-3"
            >
              <div className="bg-brand-purple/20 p-2 rounded-full shrink-0">
                <Sparkles className="w-4 h-4 text-brand-purple" />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-charcoal-text">Willa Reflection</span>
                  <span className="text-[9px] text-charcoal-light/70 font-mono">Companion</span>
                </div>
                <p className="text-[10px] text-charcoal-light leading-relaxed font-light">
                  "Your logs reflect stable, gentle focus today. Let's maintain this baseline by stepping away from screens for a 2-minute tea pause."
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button className="px-3 py-1 rounded-full bg-brand-sage text-charcoal-text font-bold text-[9px] hover:bg-brand-teal transition-all cursor-pointer">
                    Take Pause
                  </button>
                  <button className="px-3 py-1 rounded-full bg-warm-bg text-charcoal-light border border-neutral-border text-[9px]">
                    Snooze
                  </button>
                </div>
              </div>
            </motion.div>
 
          </div>
 
        </div>
      </div>
    </section>
  );
}
