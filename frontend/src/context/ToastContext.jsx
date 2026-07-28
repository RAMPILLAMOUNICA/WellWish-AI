/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X, Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        new Notification("WellWish AI Notifications Active", {
          body: "You will receive daily check-in reminders and AI task micro-habits!",
          icon: "/favicon.ico"
        });
      }
      return permission;
    }
    return "denied";
  }, []);

  const sendNotification = useCallback((title, body) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico"
      });
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Also send native Web Notification if permitted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("WellWish AI Notice", { body: message });
      } catch (e) {
        // Fallback silently if notification throws
      }
    }
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  // Periodic reminder for daily check-in streak maintenance & AI micro-habits
  useEffect(() => {
    const timer = setTimeout(() => {
      addToast("🔥 Maintain your streak! Remember to complete your daily check-in today.", "info");
    }, 12000);

    return () => clearTimeout(timer);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, requestNotificationPermission, sendNotification, notificationPermission }}>
      {children}
      
      {/* Toast container portal wrapper */}
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
                  ? "from-emerald-500/40 to-teal-500/20"
                  : toast.type === "error"
                  ? "from-rose-500/40 to-rose-500/20"
                  : "from-amber-500/40 to-amber-500/20"
              } shadow-lg shadow-black/10`}
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-xl rounded-[15px] border border-neutral-200 text-charcoal-text shadow-sm">
                {toast.type === "success" && (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                {toast.type === "error" && (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                {toast.type === "info" && (
                  <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                
                <span className="text-xs font-semibold text-charcoal-text flex-1 leading-relaxed">
                  {toast.message}
                </span>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-charcoal-light hover:text-charcoal-text p-0.5 rounded cursor-pointer"
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
