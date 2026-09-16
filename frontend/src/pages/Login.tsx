import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { GlassCard } from "../components/GlassCard";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const DEMO_EMAIL = "capstone6@gmail.com";
const DEMO_PASSWORD = "capstone@1929";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      navigate("/map");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleDemoLogin = () => performLogin(DEMO_EMAIL, DEMO_PASSWORD);

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
        <div className="mb-8 flex flex-col items-center">
          <Logo size={56} />
          <h1 className="mt-3 text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-charcoal-900/60 dark:text-sage-50/60">Sign in to CivicNeeds</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Continue with demo account
            </button>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-sm text-charcoal-900/60 dark:text-sage-50/60">
          New to CivicNeeds?{" "}
          <Link to="/register" className="font-medium text-sage-700 dark:text-sage-300">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
