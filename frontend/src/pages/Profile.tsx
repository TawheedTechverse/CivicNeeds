import { useNavigate } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-sm px-4 pb-32 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <ThemeToggle />
      </div>

      <GlassCard className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-charcoal-900/60 dark:text-sage-50/60">Name</p>
          <p className="font-medium">{user?.full_name}</p>
        </div>
        <div>
          <p className="text-sm text-charcoal-900/60 dark:text-sage-50/60">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm text-charcoal-900/60 dark:text-sage-50/60">Role</p>
          <p className="font-medium capitalize">{user?.role}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary mt-2">
          Log out
        </button>
      </GlassCard>
    </div>
  );
}
