import { Link, useLocation } from "react-router-dom";
import { Activity, BookOpen, Users, Settings } from "lucide-react";

export default function MobileNavBar() {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: Activity,
    },
    {
      label: "Journal",
      path: "/journal",
      icon: BookOpen,
    },
    {
      label: "Circles",
      path: "/community",
      icon: Users,
    },
    {
      label: "Settings",
      path: "/profile",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card-bg/95 backdrop-blur-md border-t border-neutral-border md:hidden flex justify-around items-center py-2 px-2 shadow-[0_-4px_24px_rgba(31,41,41,0.06)] min-h-[52px]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || (item.path === "/dashboard" && pathname === "/");
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
              isActive
                ? "text-brand-teal font-extrabold bg-brand-sage/12"
                : "text-charcoal-light/75 hover:text-charcoal-text"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-brand-teal stroke-[2.25]" : "text-charcoal-light/70"}`} />
            <span className="text-[9px] tracking-wider uppercase font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
