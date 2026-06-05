"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const routerRef = React.useRef(router);
  React.useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Load session from localStorage on mount
  React.useEffect(() => {
    try {
      const storedToken = localStorage.getItem("beaverdash_token");
      const storedUser = localStorage.getItem("beaverdash_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load auth data from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Protect routes / Handle redirection
  React.useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === "/login";
    const isSharedPage = pathname?.startsWith("/shared") || false;
    const hasToken = !!token;

    if (!hasToken && !isAuthPage && !isSharedPage) {
      // Redirect to login if trying to access dashboard without token
      routerRef.current.push("/login");
    } else if (hasToken && isAuthPage) {
      // Redirect to default page if already logged in and visiting login
      routerRef.current.push("/tasks");
    }
  }, [token, pathname, isLoading]);

  const login = React.useCallback((newToken: string, newUser: User) => {
    try {
      localStorage.setItem("beaverdash_token", newToken);
      localStorage.setItem("beaverdash_user", JSON.stringify(newUser));
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("beaverdash_announcement_shown");
        sessionStorage.removeItem("beaverdash_intro_played");
      }
      setToken(newToken);
      setUser(newUser);
      routerRef.current.push("/tasks");
    } catch (error) {
      console.error("Failed to save auth data on login:", error);
    }
  }, []);

  const logout = React.useCallback(() => {
    try {
      localStorage.removeItem("beaverdash_token");
      localStorage.removeItem("beaverdash_user");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("beaverdash_announcement_shown");
        sessionStorage.removeItem("beaverdash_intro_played");
      }
      setToken(null);
      setUser(null);
      routerRef.current.push("/login");
    } catch (error) {
      console.error("Failed to clear auth data on logout:", error);
    }
  }, []);

  const updateUser = React.useCallback((updatedUser: User) => {
    try {
      localStorage.setItem("beaverdash_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update auth user data:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
