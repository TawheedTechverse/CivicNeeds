import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";

const TOTAL_DURATION_MS = 1900;

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login", { replace: true }), TOTAL_DURATION_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-app-light dark:bg-gradient-app-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Logo size={104} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        className="mt-6 text-3xl font-semibold tracking-tight text-charcoal-900 dark:text-sage-50"
      >
        CivicNeeds
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.6, ease: "easeOut" }}
        className="mt-2 text-sm uppercase tracking-[0.2em] text-sage-700 dark:text-sage-300"
      >
        Develop your own community
      </motion.p>
    </div>
  );
}
