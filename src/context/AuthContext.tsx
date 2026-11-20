import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AdminUser } from '@/types';
import { getAdminSession, signInAdmin, signOutAdmin } from '@/lib/auth';
import { hasSupabase, supabase } from '@/lib/supabase';

interface AuthValue {
  user: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const session = await getAdminSession();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const next = await signInAdmin(email, password);
      setUser(next);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await signOutAdmin();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signOut, refresh }), [user, loading, signIn, signOut, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải nằm trong AuthProvider');
  return ctx;
}
