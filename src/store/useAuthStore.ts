import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MEMBER";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuth: (user: User | null, token: string | null) => void;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuth: (user, token) => set({ user, accessToken: token, isAuthenticated: !!user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: "auth-storage" }
  )
);
