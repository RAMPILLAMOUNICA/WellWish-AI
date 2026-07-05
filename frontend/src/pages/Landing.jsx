import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Impact from "../components/Impact";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-warm-bg text-charcoal-text flex flex-col font-sans overflow-x-hidden selection:bg-brand-sage/20 selection:text-charcoal-text">
      {/* Top Banner Alert (calming style) */}
      <div className="w-full bg-brand-sage/10 border-b border-neutral-border py-2.5 text-center px-4 relative z-50">
        <p className="text-[10px] sm:text-xs text-charcoal-light font-medium flex items-center justify-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-brand-sage/35 text-charcoal-text text-[9px] font-bold border border-brand-sage/40">ANNOUNCEMENT</span>
          <span>WellWish AI companion app is now in developer preview.</span>
          <a href="#" className="text-brand-teal hover:underline inline-flex items-center gap-0.5 font-bold">
            Read Blog <ArrowRight className="w-3 h-3" />
          </a>
        </p>
      </div>

      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Sections */}
      <main className="flex-1">
        <Hero />
        
        <Features />
        
        <HowItWorks />
        
        <Impact />

        {/* Bottom CTA Block */}
        <section className="relative py-28 overflow-hidden bg-card-bg border-t border-neutral-border">
          {/* Subtle glow nodes */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#FAFAF7_95%)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-brand-sage/10 blur-[100px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-warm-bg border border-neutral-border text-xs font-semibold text-charcoal-light mb-6 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
              <span>Get Free Early Access</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-charcoal-text tracking-tight leading-[1.1] mb-6"
            >
              Start Cultivating Your <br />
              <span className="bg-gradient-to-r from-brand-sage via-brand-teal to-brand-purple bg-clip-text text-transparent font-black">
                Wellbeing Intelligence
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-charcoal-light text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-10 font-light"
            >
              Join others tracking daily check-ins and listening to warm, encouraging guidance. Initialize your secure personal dashboard today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-sage text-center font-bold text-sm text-charcoal-text shadow-sm hover:bg-brand-teal transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Initialize Platform Free</span>
                <ArrowRight className="w-4 h-4 text-charcoal-text" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-card-bg text-center font-bold text-sm text-charcoal-light border border-neutral-border hover:bg-warm-bg/50 transition-all flex items-center justify-center"
              >
                Sign In to Platform
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
