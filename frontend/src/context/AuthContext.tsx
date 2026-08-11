import { useEffect, useState, type ReactNode } from "react";
import { fetchCurrentUser, login as apiLogin, registerUser } from "../lib/api";
import type { User } from "../types/auth";
import { AuthContext } from "./auth-context";

const TOKEN_STORAGE_KEY = "shorter_url_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchCurrentUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const applyToken = async (newToken: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(await fetchCurrentUser(newToken));
  };

  const login = async (email: string, password: string) => {
    const { access_token } = await apiLogin(email, password);
    await applyToken(access_token);
  };

  const register = async (email: string, password: string) => {
    await registerUser(email, password);
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, refreshSession: applyToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
