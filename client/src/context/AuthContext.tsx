import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { setAccessToken } from '../api/client';
import { refreshToken, logout as apiLogout } from '../api/auth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try silent refresh on mount
  useEffect(() => {
    refreshToken()
      .then(({ accessToken, user }) => {
        setAccessToken(accessToken);
        setUser(user);
      })
      .catch(() => {
        // Not logged in
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
