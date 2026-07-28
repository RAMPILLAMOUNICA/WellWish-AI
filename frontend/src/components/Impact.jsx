/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ArrowLeft, ArrowRight, ShieldCheck, Heart } from "lucide-react";

export default function Impact() {
  const highlights = [
    { title: "Daily Grounding", desc: "Form healthy check-in habits to align your body and thoughts." },
    { title: "Mindful Focus", desc: "Take timely intervals to stretch, breathe, and step away from screens." },
    { title: "Absolute Privacy", desc: "Your personal logs are protected by secure cloud-based AI and JWT authentication." },
    { title: "Supportive Prompts", desc: "Receive gentle advice and suggestions from Willa, your companion." }
  ];

  return (
    <section id="impact" className="relative py-32 bg-card-bg overflow-hidden border-t border-neutral-border">
      {/* Soft Decorative Spotlights */}
      <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-brand-purple/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-brand-sage/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Title */}
        <div className="max-w-3xl mb-20 text-left">
          <span className="text-brand-sage font-display font-semibold text-xs tracking-wider uppercase block mb-3">Mindful Community</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-charcoal-text tracking-tight leading-[1.2] mb-5">
            Support for Your{" "}
            <span className="bg-gradient-to-r from-brand-sage via-brand-teal to-brand-purple bg-clip-text text-transparent font-black">
              Daily Well-being.
            </span>
          </h2>
          <p className="text-charcoal-light text-base font-light">
            We focus on creating a trusted space where you can pace yourself and protect your peace.
          </p>
        </div>

        {/* Highlights Checklist Instead of Fake Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-warm-bg p-6 rounded-3xl border border-neutral-border flex flex-col gap-2 hover:border-brand-sage transition-colors shadow-xs"
            >
              <div className="p-1.5 bg-card-bg text-brand-teal rounded-full w-fit border border-neutral-border shadow-xs">
                <Heart className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-charcoal-text text-sm tracking-wide mt-2">
                {item.title}
              </h4>
              <p className="text-[11px] text-charcoal-light leading-relaxed font-light">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Privacy Stance section (Replaces Testimonials) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            <div className="p-2.5 bg-brand-sage/20 border border-brand-sage/30 text-charcoal-text rounded-full w-fit">
              <ShieldCheck className="w-5 h-5 text-brand-teal" />
            </div>
            <h3 className="font-display font-bold text-2xl text-charcoal-text tracking-tight leading-tight">
              Community Privacy First
            </h3>
            <p className="text-charcoal-light text-sm leading-relaxed font-light">
              WellWish AI is designed as a secure space for your personal wellness logs. Your reflections, journals, and health indicators are processed using secure cloud-based AI and authenticated with standard JWT, ensuring your data is always private and protected.
            </p>
          </div>

          {/* Privacy Empty State Card */}
          <div className="lg:col-span-7">
            <div className="relative min-h-[240px] w-full p-[1px] rounded-3xl bg-neutral-border shadow-xs">
              <div className="relative h-full w-full bg-card-bg rounded-[23px] p-8 md:p-10 flex flex-col justify-between border border-neutral-border">
                <div className="flex flex-col gap-6">
                  <div>
                    <Quote className="w-8 h-8 text-brand-teal opacity-10 mb-4" />
                    <h4 className="font-bold text-charcoal-text text-sm mb-2">Zero Telemetry Collection</h4>
                    <p className="text-charcoal-text text-xs md:text-sm leading-relaxed italic font-light">
                      "Because your telemetry data is protected via secure personal accounts, we do not gather public reviews or testimonials. Your mental pacing, daily hydration levels, and secure reflections are entirely yours."
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-neutral-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-warm-bg border border-neutral-border flex items-center justify-center text-brand-teal font-bold font-display text-xs">
                        🔒
                      </div>
                      <div>
                        <div className="font-bold text-charcoal-text text-xs tracking-wide">
                          WellWish AI Vault
                        </div>
                        <div className="text-[10px] text-charcoal-light font-medium">
                          Secure & Private
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-bold text-charcoal-text bg-brand-teal/20 px-2.5 py-1 rounded-full border border-brand-teal/30">
                        100% Encrypted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
