import { motion } from "framer-motion";
import { Gift, Map, LayoutDashboard, Plus, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const MotionNavLink = motion(NavLink);

const NAV_ITEMS = [
  { to: "/map", label: "Map", icon: Map },
  { to: "/report/new", label: "Report", icon: Plus },
  { to: "/donations", label: "Donations", icon: Gift },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[2000] w-[min(95vw,32rem)]">
      <div className="relative flex items-center justify-between gap-1 rounded-full px-3 py-2 bg-white/30 dark:bg-white/[0.06] backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-nav">
        <div className="pointer-events-none absolute inset-0 rounded-full overflow-hidden bg-gradient-to-br from-white/40 via-transparent to-sage-200/20 dark:to-sage-400/5" />

        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || (to !== "/map" && location.pathname.startsWith(to));

          return (
            <MotionNavLink
              key={to}
              to={to}
              aria-label={label}
              whileTap={{ scale: 0.88, y: 3 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium"
            >
              <span className="relative flex h-9 w-9 items-center justify-center">
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 rounded-full bg-gradient-primary shadow-md shadow-sage-600/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`relative z-10 transition-colors ${isActive ? "text-white" : "text-charcoal-900/50 dark:text-sage-50/50"}`}
                />
              </span>
              <span
                className={`relative z-10 transition-colors ${isActive ? "text-sage-700 dark:text-sage-300" : "text-charcoal-900/50 dark:text-sage-50/50"}`}
              >
                {label}
              </span>
            </MotionNavLink>
          );
        })}
      </div>
    </nav>
  );
}
