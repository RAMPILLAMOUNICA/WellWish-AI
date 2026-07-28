/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-6 relative overflow-hidden grid-bg">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-brand-purple/5 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-teal/5 blur-[80px]" />

      <div className="text-center relative z-10 max-w-md flex flex-col items-center gap-6">
        
        {/* Animated Icon */}
        <div className="bg-slate-900 border border-white/10 p-4 rounded-full text-brand-teal mb-2">
          <HelpCircle className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <h1 className="font-display font-extrabold text-4xl text-white">404 Vault Error</h1>
          <p className="text-xs text-slate-500 mt-2 font-mono">ENCRYPTED_PATH_NOT_RESOLVED</p>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed font-light">
            The telemetry vault coordinates you requested do not exist or have been recycled into local memory.
          </p>
        </div>

        <Link
          to="/"
          className="mt-4 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Safe Area</span>
        </Link>

      </div>
    </div>
  );
}
