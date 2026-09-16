import { createContext, useContext, useState, type ReactNode } from "react";
import { apiClient, setStoredToken } from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: "citizen" | "authority") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_KEY = "civicneeds-user";

interface TokenResponse {
  access_token: string;
  user: User;
}

function loadStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser);

  const persist = (data: TokenResponse) => {
    setStoredToken(data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post<TokenResponse>("/auth/login", { email, password });
    persist(data);
  };

  const register = async (email: string, password: string, fullName: string, role: "citizen" | "authority") => {
    const { data } = await apiClient.post<TokenResponse>("/auth/register", {
      email,
      password,
      full_name: fullName,
      role,
    });
    persist(data);
  };

  const logout = () => {
    setStoredToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
