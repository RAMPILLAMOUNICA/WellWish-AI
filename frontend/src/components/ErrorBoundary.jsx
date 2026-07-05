import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center px-6 relative overflow-hidden grid-bg font-sans">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-rose-500/5 blur-[90px] pointer-events-none" />
          
          <div className="w-full max-w-md relative z-10">
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-rose-500/20 via-white/5 to-transparent shadow-2xl">
              <div className="glass-panel rounded-[23px] p-8 bg-[#090d16]/95 flex flex-col gap-6 text-center">
                
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-white">Vault Interface Collision</h2>
                    <p className="text-xs text-slate-400 mt-1">A critical error occurred while rendering telemetry panels</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 border border-white/5 rounded-xl text-left">
                  <span className="text-[9px] font-mono text-slate-500 block mb-1">EXCEPTION REPORT:</span>
                  <p className="text-[11px] font-mono text-rose-400/90 leading-relaxed break-all select-all">
                    {this.state.error?.message || "Render exception details unavailable."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Vault</span>
                  </button>
                  <a
                    href="/"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-teal text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Exit to Home</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
