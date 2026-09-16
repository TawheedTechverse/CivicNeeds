import { motion } from "framer-motion";
import { Map, LayoutDashboard, Plus, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/map", label: "Map", icon: Map },
  { to: "/report/new", label: "Report", icon: Plus, primary: true },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,26rem)]">
      <div className="relative flex items-center justify-between gap-1 rounded-full px-3 py-2 bg-white/30 dark:bg-white/[0.06] backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-nav overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-sage-200/20 dark:to-sage-400/5" />

        {NAV_ITEMS.map(({ to, label, icon: Icon, primary }) => {
          const isActive = location.pathname === to || (to !== "/map" && location.pathname.startsWith(to));

          if (primary) {
            return (
              <NavLink
                key={to}
                to={to}
                className="relative z-10 -translate-y-4 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-primary shadow-lg shadow-sage-600/30 text-white"
                aria-label={label}
              >
                <Icon size={26} strokeWidth={2.5} />
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className="relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-full bg-white/50 dark:bg-white/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={`relative z-10 ${isActive ? "text-sage-700 dark:text-sage-300" : "text-charcoal-900/50 dark:text-sage-50/50"}`}
              />
              <span
                className={`relative z-10 ${isActive ? "text-sage-700 dark:text-sage-300" : "text-charcoal-900/50 dark:text-sage-50/50"}`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
