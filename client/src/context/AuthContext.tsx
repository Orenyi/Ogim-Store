import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiRequest, getCsrfToken, clearCsrfToken } from "../lib/api";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: "customer" | "admin";
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user: AuthUser;
}

interface GoogleAuthResponse {
  success: boolean;
  onboardingRequired: boolean;
  user: AuthUser | { fullName: string; email: string };
  message?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    acceptedTerms: boolean,
  ) => Promise<void>;
  signInWithGoogle: (
    credential: string,
    acceptedTerms?: boolean,
    phoneNumber?: string,
  ) => Promise<GoogleAuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const result = await apiRequest<AuthResponse>("/auth/me");
      setUser(result.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const result = await apiRequest<AuthResponse>("/auth/me");

        if (active) setUser(result.user);
      } catch {
        try {
          await getCsrfToken();

          const refreshed = await apiRequest<AuthResponse>("/auth/refresh", {
            method: "POST",
          });

          if (active) setUser(refreshed.user);
        } catch {
          if (active) setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const result = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      setUser(result.user);
    },
    [],
  );

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      phoneNumber: string,
      password: string,
      acceptedTerms: boolean,
    ) => {
      const result = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          ...(phoneNumber ? { phoneNumber } : {}),
          password,
          acceptedTerms,
        }),
      });

      setUser(result.user);
    },
    [],
  );

  const signInWithGoogle = useCallback(
    async (
      credential: string,
      acceptedTerms = false,
      phoneNumber?: string,
    ): Promise<GoogleAuthResponse> => {
      const result = await apiRequest<GoogleAuthResponse>("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          credential,
          acceptedTerms,
          ...(phoneNumber ? { phoneNumber } : {}),
        }),
      });

      if (!result.onboardingRequired) {
        setUser(result.user as AuthUser);
      }

      return result;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await getCsrfToken();

      await apiRequest<{ success: boolean }>("/auth/logout", {
        method: "POST",
      });
    } finally {
      setUser(null);
      clearCsrfToken();
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      signInWithGoogle,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, signInWithGoogle, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
