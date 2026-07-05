import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Sparkles, Smartphone, CheckCircle, Watch, Compass } from "lucide-react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Sync Wearables & Inputs",
      description: "Easily integrate Apple Health, Fitbit, Garmin, or Oura Ring. WellWish AI securely channels your core health variables without battery drain.",
      icon: Watch,
      color: "text-charcoal-text",
      borderColor: "border-brand-purple/20",
      bg: "bg-brand-purple/20",
    },
    {
      title: "Continuous Local Analysis",
      description: "Our on-device models analyze micro-fluctuations in sleep patterns, screen exposure, and journal metrics to identify energy depletion.",
      icon: Cpu,
      color: "text-charcoal-text",
      borderColor: "border-brand-sage/20",
      bg: "bg-brand-sage/25",
    },
    {
      title: "Receive Gentle Reflections",
      description: "Receive micro-habit invitations (e.g. stretching, hydration, or breathing breaks) precisely when your energy metrics begin to drop.",
      icon: Compass,
      color: "text-charcoal-text",
      borderColor: "border-brand-teal/20",
      bg: "bg-brand-teal/20",
    }
  ];

  // Auto transition steps every 8s if user is not clicking
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const renderMockScreen = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 w-full text-charcoal-text"
          >
            <div className="flex items-center justify-between border-b border-neutral-border pb-4">
              <div>
                <h4 className="text-sm font-bold text-charcoal-text">Integrate Wearables</h4>
                <p className="text-[10px] text-charcoal-light">Zero credentials stored on cloud</p>
              </div>
              <span className="text-[9px] text-charcoal-text px-2.5 py-0.5 bg-brand-purple/20 rounded-full font-bold">3 Connected</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-warm-bg border border-neutral-border rounded-xl flex items-center gap-2.5">
                <div className="p-1.5 bg-card-bg text-brand-teal rounded-full border border-neutral-border shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5 fill-brand-teal/10" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-charcoal-text">Apple Health</div>
                  <div className="text-[9px] text-brand-teal">Synced 1m ago</div>
                </div>
              </div>
              <div className="p-3 bg-warm-bg border border-neutral-border rounded-xl flex items-center gap-2.5">
                <div className="p-1.5 bg-card-bg text-brand-purple rounded-full border border-neutral-border shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5 fill-brand-purple/10" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-charcoal-text">Oura Ring</div>
                  <div className="text-[9px] text-brand-purple">Synced 5m ago</div>
                </div>
              </div>
              <div className="p-3 bg-warm-bg border border-neutral-border rounded-xl flex items-center gap-2.5 opacity-60">
                <div className="p-1.5 bg-card-bg text-slate-400 rounded-full border border-neutral-border">
                  <Watch className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-charcoal-text">Fitbit App</div>
                  <div className="text-[9px] text-slate-400">Tap to link</div>
                </div>
              </div>
              <div className="p-3 bg-warm-bg border border-neutral-border rounded-xl flex items-center gap-2.5">
                <div className="p-1.5 bg-card-bg text-brand-teal rounded-full border border-neutral-border shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5 fill-brand-teal/10" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-charcoal-text">Garmin Link</div>
                  <div className="text-[9px] text-brand-teal">Synced 10m ago</div>
                </div>
              </div>
            </div>

            <div className="mt-2 text-center text-[10px] text-charcoal-light p-2.5 bg-brand-purple/5 border border-brand-purple/10 rounded-xl leading-relaxed">
              Biometric indicators synced and validated locally.
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-5 w-full text-xs text-charcoal-text"
          >
            <div className="flex items-center justify-between border-b border-neutral-border pb-4">
              <div>
                <h4 className="text-sm font-bold text-charcoal-text">Local Calibrations</h4>
                <p className="text-[10px] text-charcoal-light">Continuous background sync</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-ping" />
                <span className="text-[9px] text-brand-teal font-bold uppercase">Processing</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center bg-warm-bg border border-neutral-border p-2.5 rounded-xl">
                <span className="text-[10px] text-charcoal-light">Resting Heart Rate</span>
                <span className="text-brand-teal font-bold text-[10px]">72 bpm (Optimal)</span>
              </div>
              <div className="flex justify-between items-center bg-warm-bg border border-neutral-border p-2.5 rounded-xl">
                <span className="text-[10px] text-charcoal-light">Cognitive Focus Rhythm</span>
                <span className="text-brand-purple font-bold text-[10px]">Stable Balance</span>
              </div>
              <div className="flex justify-between items-center bg-warm-bg border border-neutral-border p-2.5 rounded-xl">
                <span className="text-[10px] text-charcoal-light">Sleep Recovery Score</span>
                <span className="text-brand-teal font-bold text-[10px]">88% Restored</span>
              </div>
            </div>

            <div className="h-10 w-full bg-warm-bg rounded-xl p-2.5 flex items-center justify-between border border-neutral-border">
              <span className="text-[9px] text-charcoal-light font-medium">Wellbeing Index Forecast</span>
              <span className="text-brand-teal font-bold text-[10px]">Stable & Calm</span>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 w-full text-charcoal-text"
          >
            <div className="flex items-center justify-between border-b border-neutral-border pb-4">
              <div>
                <h4 className="text-sm font-bold text-charcoal-text">Mindful Reminders</h4>
                <p className="text-[10px] text-charcoal-light">Delivered directly on watch or mobile</p>
              </div>
              <span className="text-[9px] text-brand-teal bg-brand-teal/15 px-2.5 py-0.5 rounded-full font-bold">Companion</span>
            </div>

            <div className="relative p-4 rounded-2xl bg-gradient-to-r from-brand-purple/10 to-brand-teal/10 border border-brand-teal/20 shadow-xs flex gap-3">
              <div className="bg-brand-teal text-charcoal-text p-2.5 rounded-full self-start shadow-xs">
                <Sparkles className="w-4 h-4 text-charcoal-text" />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h5 className="text-[11px] font-bold text-charcoal-text">Willa Compass Advisory</h5>
                  <span className="text-[9px] text-charcoal-light/70">Now</span>
                </div>
                <p className="text-[10px] text-charcoal-light leading-relaxed">
                  "Your sleep duration indicators are slightly low today. Let's practice a 2-minute box breathing session to refresh your energy."
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button className="px-3 py-1.5 rounded-full bg-brand-sage text-charcoal-text font-bold text-[9px] hover:bg-brand-teal transition-all cursor-pointer">
                    Breathe
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-card-bg text-charcoal-light border border-neutral-border text-[9px]">
                    Snooze
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-charcoal-light text-center font-mono">
              ✓ Active heart rate reduced to resting target average.
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="how-it-works" className="relative py-32 bg-warm-bg overflow-hidden border-t border-neutral-border">
      {/* Background glow highlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-teal/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-charcoal-text tracking-tight leading-[1.2] mb-5">
            Three Steps to{" "}
            <span className="bg-gradient-to-r from-brand-sage via-brand-teal to-brand-purple bg-clip-text text-transparent font-black">
              Wellbeing Foresight
            </span>
          </h2>
          <p className="text-charcoal-light text-sm sm:text-base font-light">
            WellWish AI works continuously and silently to keep your mind and body balanced.
          </p>
        </div>

        {/* Content Splitter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Steps List */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isSelected = activeStep === index;
              return (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 flex items-start gap-4 cursor-pointer outline-none ${
                    isSelected
                      ? "bg-card-bg border-neutral-border shadow-xs scale-[1.01]"
                      : "bg-transparent border-transparent opacity-50 hover:opacity-85"
                  }`}
                >
                  <div className={`p-3 rounded-full border border-neutral-border/10 ${step.bg} ${step.color} shrink-0`}>
                    <Icon className="w-5 h-5 text-charcoal-text" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-charcoal-text flex items-center gap-2">
                      <span>{step.title}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-ping" />
                      )}
                    </h3>
                    <p className="text-charcoal-light text-sm mt-2 leading-relaxed font-light">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Graphic Simulator */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="relative w-full max-w-sm h-[380px] rounded-[32px] p-6 bg-card-bg border border-neutral-border shadow-sm overflow-hidden flex items-center justify-center">
              {/* Backglow inside phone card */}
              <div className="absolute top-0 left-1/4 right-1/4 h-24 bg-gradient-to-b from-brand-teal/5 to-transparent blur-[20px] pointer-events-none" />
              
              {/* Simulated Device Screen content */}
              <div className="w-full">
                <AnimatePresence mode="wait">
                  {renderMockScreen()}
                </AnimatePresence>
              </div>

              {/* Decorative border gloss */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-neutral-border rounded-full pointer-events-none" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
