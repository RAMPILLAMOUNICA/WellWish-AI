import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Absolute toast container portal wrapper */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`p-[1px] rounded-2xl bg-gradient-to-r ${
                toast.type === "success"
                  ? "from-brand-teal/30 to-brand-blue/10"
                  : toast.type === "error"
                  ? "from-rose-500/30 to-rose-500/10"
                  : "from-brand-purple/30 to-brand-purple/10"
              } shadow-lg shadow-black/30`}
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-[#0d121f]/95 backdrop-blur-xl rounded-[15px] border border-white/5">
                {toast.type === "success" && (
                  <CheckCircle className="w-4 h-4 text-brand-teal shrink-0" />
                )}
                {toast.type === "error" && (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                {toast.type === "info" && (
                  <Info className="w-4 h-4 text-brand-purple shrink-0" />
                )}
                
                <span className="text-xs font-medium text-slate-200 flex-1 leading-relaxed">
                  {toast.message}
                </span>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be executed within a ToastProvider");
  }
  return context;
}
