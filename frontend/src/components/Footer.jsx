import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-card-bg border-t border-neutral-border pt-16 pb-10 overflow-hidden">
      {/* Decorative Spotlights */}
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-brand-sage/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12">
          
          {/* Logo & Description */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-brand-sage/20 p-2 rounded-full border border-brand-sage/30 shadow-xs">
                <Heart className="w-4.5 h-4.5 text-brand-teal fill-brand-teal/20" />
              </div>
              <span className="font-display font-bold text-lg text-charcoal-text">
                WellWish <span className="text-brand-sage font-extrabold">AI</span>
              </span>
            </Link>
            <p className="text-charcoal-light text-sm leading-relaxed max-w-md font-light">
              A gentle, privacy-first wellness companion helping you monitor daily biometrics and reflections to build balance and peace of mind.
            </p>
          </div>

          {/* Links Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h4 className="font-display font-bold text-charcoal-text text-sm uppercase tracking-wider">Product</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#features" className="text-charcoal-light hover:text-brand-sage text-sm transition-colors font-light">Features</a></li>
              <li><a href="#how-it-works" className="text-charcoal-light hover:text-brand-sage text-sm transition-colors font-light">How it Works</a></li>
              <li><Link to="/login" className="text-charcoal-light hover:text-brand-sage text-sm transition-colors font-light">Dashboard</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-neutral-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-charcoal-light">
          <p>© {new Date().getFullYear()} WellWish AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-charcoal-text transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-charcoal-text transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
