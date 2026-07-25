import { motion } from "framer-motion";
import { MessageSquare, Heart, Compass, Shield, Eye, Sparkles } from "lucide-react";

export default function Features() {
  const features = [
    {
      id: "analysis",
      icon: Heart,
      iconBg: "bg-brand-sage/25 border-brand-sage/35 text-charcoal-text",
      title: "AI Wellbeing Analysis",
      description: "Manually log your sleep, daily steps, screen time, and hydration to receive AI-driven wellbeing insights on your secure personal dashboard.",
      interactive: {
        title: "Daily Balance View",
        detail: "Visualizes manually logged wellbeing metrics."
      }
    },
    {
      id: "reflection",
      icon: MessageSquare,
      iconBg: "bg-brand-purple/20 border-brand-purple/30 text-charcoal-text",
      title: "Daily Reflection Logs",
      description: "Manually input your daily thoughts in a secure space. Our AI analyzes your written reflections to show mood trends on your secure personal dashboard.",
      interactive: {
        title: "Reflection Scanning",
        detail: "Analyzes manual journal logs to map emotional trends."
      }
    },
    {
      id: "guidance",
      icon: Compass,
      iconBg: "bg-brand-teal/20 border-brand-teal/30 text-charcoal-text",
      title: "Personalized Guidance",
      description: "Receive AI-driven suggestions from Willa, your wellbeing companion, based on your manually logged data, visible on your secure personal dashboard.",
      interactive: {
        title: "Companion Suggestions",
        detail: "AI reminders based on manually tracked daily logs."
      }
    },
    {
      id: "privacy",
      icon: Shield,
      iconBg: "bg-brand-sage/25 border-brand-sage/35 text-charcoal-text",
      title: "Privacy First Architecture",
      description: "Your raw parameters and written diaries are kept private using secure cloud-based AI processing. Your data is protected by standard JWT authentication and never sold.",
      interactive: {
        title: "Cloud Data Privacy",
        detail: "Standard JWT authentication and secure HTTPS transit."
      }
    },
    {
      id: "explainable",
      icon: Eye,
      iconBg: "bg-brand-purple/20 border-brand-purple/30 text-charcoal-text",
      title: "Explainable wellbeing AI",
      description: "See precisely why Willa makes a recommendation, showing the exact links between your vitals and suggested pauses.",
      interactive: {
        title: "Reasoning Transparency",
        detail: "Explains how sleep dips directly trigger mindfulness prompts."
      }
    }
  ];

  return (
    <section id="features" className="relative py-32 bg-card-bg border-t border-neutral-border overflow-hidden">
      {/* Soft Spotlights */}
      <div className="absolute top-1/4 right-0 w-[30%] h-[30%] rounded-full bg-brand-purple/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[30%] h-[30%] rounded-full bg-brand-sage/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-bg border border-neutral-border text-xs text-charcoal-light mb-4 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>Supportive System Capabilities</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-charcoal-text tracking-tight leading-[1.15] mb-6"
          >
            Understand your wellbeing with AI <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-sage via-brand-teal to-brand-purple bg-clip-text text-transparent font-black">
              that supports, not judges.
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-charcoal-light text-base sm:text-lg leading-relaxed font-sans font-light"
          >
            Explore the core components designed to help you balance your routine, keep your mind clear, and protect your data.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative overflow-hidden rounded-3xl p-[1px] bg-neutral-border focus-within:ring-2 focus-within:ring-brand-sage transition-all duration-500 shadow-xs hover:shadow-md flex flex-col h-full"
              >
                <div className="relative flex-1 bg-card-bg rounded-[23px] p-6 flex flex-col justify-between transition-all duration-300">
                  <div>
                    {/* Icon header */}
                    <div className="mb-5">
                      <div className={`p-2.5 rounded-full border w-fit ${feature.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Title & Desc */}
                    <h3 className="font-display font-bold text-base text-charcoal-text mb-2.5">
                      {feature.title}
                    </h3>
                    <p className="text-charcoal-light text-xs leading-relaxed font-light mb-4">
                      {feature.description}
                    </p>
                  </div>

                  {/* Soft highlight detail */}
                  <div className="mt-4 p-3 bg-warm-bg rounded-2xl border border-neutral-border text-[10px] text-charcoal-light flex flex-col gap-1">
                    <span className="font-bold text-charcoal-text">{feature.interactive.title}</span>
                    <span>{feature.interactive.detail}</span>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
