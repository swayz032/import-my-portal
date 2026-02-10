import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface SessionInfo {
  user: AuthUser;
  roles: string[];
  isAllowlisted: boolean;
  isAdmin: boolean;
  mfaEnabled: boolean;
  mfaVerified: boolean;
  mfaVerifiedAt: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  sessionInfo: SessionInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  mfaRequired: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  const fetchSessionInfo = useCallback(async (accessToken: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-session', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error || !data?.user) {
        setSessionInfo(null);
        setUser(null);
        return null;
      }
      const info = data as SessionInfo;
      setSessionInfo(info);
      setUser(info.user);
      setMfaRequired(info.mfaEnabled && !info.mfaVerified);
      return info;
    } catch {
      setSessionInfo(null);
      setUser(null);
      return null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s?.access_token) {
      setSession(s);
      await fetchSessionInfo(s.access_token);
    } else {
      setSession(null);
      setUser(null);
      setSessionInfo(null);
    }
  }, [fetchSessionInfo]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        setSession(s);
        if (s?.access_token) {
          // Defer to avoid potential deadlock
          setTimeout(() => fetchSessionInfo(s.access_token), 0);
        } else {
          setUser(null);
          setSessionInfo(null);
          setMfaRequired(false);
        }
        setLoading(false);
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.access_token) {
        fetchSessionInfo(s.access_token).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSessionInfo]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: { message: error.message } };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSessionInfo(null);
    setMfaRequired(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, sessionInfo, loading, signIn, signOut, refreshSession, mfaRequired }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
