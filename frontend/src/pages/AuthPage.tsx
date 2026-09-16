import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { GlassCard } from "../components/GlassCard";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

interface AuthPageProps {
  mode: "login" | "register";
}

export function AuthPage({ mode }: AuthPageProps) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === "register";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password, fullName, role);
      } else {
        await login(email, password);
      }
      navigate("/map");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          isRegister ? "Could not create account. That email may already be registered." : "Invalid email or password."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center">
          <Logo size={56} />
          <h1 className="mt-3 text-2xl font-semibold">CivicNeeds</h1>
          <p className="text-sm text-charcoal-900/60 dark:text-sage-50/60">
            Shared issue reporting for citizens &amp; authorities
          </p>
        </div>

        <GlassCard>
          <div className="mb-5 flex rounded-xl bg-white/40 dark:bg-white/5 p-1">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                !isRegister ? "bg-white/80 dark:bg-white/15 shadow-sm" : "text-charcoal-900/50 dark:text-sage-50/50"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                isRegister ? "bg-white/80 dark:bg-white/15 shadow-sm" : "text-charcoal-900/50 dark:text-sage-50/50"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full name
                </label>
                <input
                  id="fullName"
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input"
                  placeholder="Jordan Rivera"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={isRegister ? 8 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                placeholder="••••••••"
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </div>

            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="role" className="text-sm font-medium">
                  I am a
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="glass-input"
                >
                  <option value="citizen">Citizen</option>
                  <option value="authority">Authority staff</option>
                </select>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
              {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          {!isRegister && (
            <p className="mt-4 text-center text-xs text-charcoal-900/50 dark:text-sage-50/50">
              Demo: <code>capstone6@gmail.com</code> — password <code>capstone@1929</code>
            </p>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
