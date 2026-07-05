import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ArrowRight, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsOpen(false);
    
    // If we're not on the landing page, navigate to landing first, then scroll
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navLinks = [
    { name: "Features", href: "features", id: "features" },
    { name: "How It Works", href: "how-it-works", id: "how-it-works" },
    { name: "Impact", href: "impact", id: "impact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card-bg/85 backdrop-blur-md border-b border-neutral-border py-4 shadow-sm"
          : "bg-transparent py-6 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-brand-sage/20 opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-card-bg p-2 rounded-full border border-neutral-border shadow-xs">
              <Heart className="w-4.5 h-4.5 text-brand-teal fill-brand-teal/20 group-hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-charcoal-text">
            WellWish <span className="text-brand-sage font-extrabold">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={`#${link.href}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className="text-sm font-medium text-charcoal-light hover:text-brand-sage transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs text-charcoal-light font-medium">Hello, {user.full_name.split(" ")[0]}</span>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-full bg-brand-sage text-charcoal-text font-bold text-xs shadow-xs hover:bg-brand-teal transition-all duration-300 flex items-center gap-1.5"
              >
                <span>My Dashboard</span>
                <ArrowRight className="w-4 h-4 text-charcoal-text" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-charcoal-light hover:text-brand-sage transition-colors duration-200 px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-full bg-brand-sage text-charcoal-text font-bold text-xs shadow-xs hover:bg-brand-teal transition-all duration-300 flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-charcoal-text" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-full border border-neutral-border bg-card-bg text-charcoal-light hover:text-charcoal-text transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-card-bg/95 border-b border-neutral-border backdrop-blur-lg"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={`#${link.href}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className="text-lg font-medium text-charcoal-light hover:text-brand-sage transition-colors border-b border-neutral-border/50 pb-2"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-4 mt-4">
                {user ? (
                  <>
                    <span className="text-xs text-charcoal-light font-medium text-center">Hello, {user.full_name}</span>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 rounded-xl bg-brand-sage text-center font-bold text-xs text-charcoal-text shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>My Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-3 rounded-xl border border-neutral-border text-charcoal-light hover:text-charcoal-text transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 rounded-xl bg-brand-sage text-center font-bold text-xs text-charcoal-text shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
