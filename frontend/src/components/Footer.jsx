import { Link } from "react-router-dom";
import { Heart, Send } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative bg-card-bg border-t border-neutral-border pt-20 pb-10 overflow-hidden">
      {/* Decorative Spotlights */}
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-brand-sage/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16">
          
          {/* Logo & Description */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-brand-sage/20 p-2 rounded-full border border-brand-sage/30 shadow-xs">
                <Heart className="w-4.5 h-4.5 text-brand-teal fill-brand-teal/20" />
              </div>
              <span className="font-display font-bold text-lg text-charcoal-text">
                WellWish <span className="text-brand-sage font-extrabold">AI</span>
              </span>
            </Link>
            <p className="text-charcoal-light text-sm leading-relaxed max-w-sm font-light">
              A gentle wellness companion helping you monitor daily biometrics and reflections to build balance and peace of mind.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-warm-bg hover:bg-neutral-border/50 border border-neutral-border flex items-center justify-center text-charcoal-light hover:text-charcoal-text transition-all">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-warm-bg hover:bg-neutral-border/50 border border-neutral-border flex items-center justify-center text-charcoal-light hover:text-charcoal-text transition-all">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-warm-bg hover:bg-neutral-border/50 border border-neutral-border flex items-center justify-center text-charcoal-light hover:text-charcoal-text transition-all">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="col-span-2 flex flex-col gap-4">
            <h4 className="font-display font-bold text-charcoal-text text-sm uppercase tracking-wider">Product</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#features" className="text-charcoal-light hover:text-brand-sage text-sm transition-colors font-light">Features</a></li>
              <li><a href="#how-it-works" className="text-charcoal-light hover:text-brand-sage text-sm transition-colors font-light">How it Works</a></li>
              <li><Link to="/login" className="text-charcoal-light hover:text-brand-sage text-sm transition-colors font-light">Dashboard</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="col-span-2 flex flex-col gap-4">
            <h4 className="font-display font-bold text-charcoal-text text-sm uppercase tracking-wider">Resources</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-charcoal-light hover:text-brand-sage text-sm transition-colors font-light">Self-Care Blog</a></li>
              <li><a href="#" className="text-charcoal-light hover:text-brand-sage text-sm transition-colors font-light">Documentation</a></li>
              <li><a href="#" className="text-charcoal-light hover:text-brand-sage text-sm transition-colors font-light">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h4 className="font-display font-bold text-charcoal-text text-sm uppercase tracking-wider">Stay Mindful</h4>
            <p className="text-charcoal-light text-sm font-light">
              Get the latest essays on self-care and mental pacing sent to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <div className="relative overflow-hidden rounded-xl p-[1px] bg-neutral-border focus-within:bg-brand-sage transition-all duration-300">
                <div className="flex bg-warm-bg rounded-[11px] overflow-hidden">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent text-charcoal-text text-sm outline-none border-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-card-bg hover:bg-warm-bg text-brand-teal border-l border-neutral-border transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
            {subscribed && (
              <p className="text-xs text-brand-sage font-bold">
                ✓ Thank you for subscribing to our wellness essays!
              </p>
            )}
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
