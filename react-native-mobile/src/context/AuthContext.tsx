import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCurrentUser, login as loginRequest, logout as logoutRequest, type User } from '@/api/auth';
import { setAuthToken, setUnauthorizedHandler } from '@/api/client';
import { clearSession, loadSession, saveSession } from '@/utils/session';

type AuthContextValue = {
  /** The signed-in user, or null when signed out. */
  user: User | null;
  /** True while the app checks the device for a saved session on launch. */
  isRestoring: boolean;
  /** Throws on failure so the login screen can show the message. */
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const clearLocalSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await clearSession();
  }, []);

  // If the server ever rejects our token, drop the session and go back to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearLocalSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearLocalSession]);

  // On launch: restore the saved session, then quietly confirm it with the server.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const saved = await loadSession();
        if (!saved) return;

        setAuthToken(saved.token);
        if (active) setUser(saved.user);

        try {
          const freshUser = await fetchCurrentUser();
          if (active) {
            setUser(freshUser);
            await saveSession(saved.token, freshUser);
          }
        } catch (error) {
          // A 401 clears the session through the interceptor above.
          // Any other problem (e.g. no internet) keeps the saved session.
          if (axios.isAxiosError(error) && error.response?.status === 401 && active) {
            await clearLocalSession();
          }
        }
      } finally {
        if (active) setIsRestoring(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [clearLocalSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: signedInUser } = await loginRequest(email, password);
    setAuthToken(token);
    await saveSession(token, signedInUser);
    setUser(signedInUser);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Even if the server can't be reached, sign out on this device.
    }
    await clearLocalSession();
  }, [clearLocalSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isRestoring, signIn, signOut }),
    [user, isRestoring, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
