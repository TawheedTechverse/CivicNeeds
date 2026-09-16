import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { useState } from "react";

type Status = "idle" | "ringing" | "notified";

export function NotifyDonorButton() {
  const [status, setStatus] = useState<Status>("idle");

  const handleClick = () => {
    if (status !== "idle") return;
    setStatus("ringing");
    setTimeout(() => setStatus("notified"), 650);
  };

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={status !== "idle"}
        whileTap={status === "idle" ? { scale: 0.82 } : undefined}
        className={`relative flex h-11 w-11 items-center justify-center overflow-visible rounded-full border transition-colors ${
          status === "notified"
            ? "border-transparent bg-gradient-primary text-white"
            : "border-white/50 bg-white/40 text-sage-700 hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-sage-300 dark:hover:bg-white/10"
        }`}
        aria-label={status === "notified" ? "Donor notified" : "Notify donor for pickup"}
      >
        <AnimatePresence>
          {status === "ringing" && (
            <motion.span
              key="ripple"
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-sage-400/70"
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {status === "notified" ? (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="relative z-10"
            >
              <Check size={20} strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="bell"
              className="relative z-10"
              animate={status === "ringing" ? { rotate: [0, -22, 20, -16, 14, -8, 6, 0] } : { rotate: 0 }}
              transition={status === "ringing" ? { duration: 0.6, ease: "easeInOut" } : undefined}
            >
              <Bell size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {status === "notified" && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-[10px] font-medium text-sage-600 dark:text-sage-300"
          >
            Notified
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
