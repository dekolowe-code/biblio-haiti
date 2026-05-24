import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id, session.user.email ?? '');
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? '');
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(id: string, email: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    setUser({
      id,
      email,
      full_name: data?.full_name,
      avatar_url: data?.avatar_url,
      role: data?.role ?? 'user',
      starsBalance: data?.stars_balance ?? 0,
      created_at: data?.created_at ?? new Date().toISOString(),
    });
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        role: 'user',
        stars_balance: 0,
      });
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
