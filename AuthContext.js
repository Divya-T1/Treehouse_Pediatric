import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';
import { syncFromCloud } from './cloudSync';
import { clearData } from './ActivitiesSaver';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const syncedUserIdRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncedUserIdRef.current = session?.user?.id ?? null;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const incomingUserId = session?.user?.id ?? null;

      if (_event === 'SIGNED_IN' && incomingUserId && incomingUserId !== syncedUserIdRef.current) {
        // Only sync for a genuinely new sign-in. Supabase also fires SIGNED_IN
        // on token refresh (e.g. returning to the tab), which must not trigger
        // a sync or the screen blanks unnecessarily.
        setLoading(true);
        try {
          await syncFromCloud(incomingUserId);
        } catch (e) {
          console.warn('Cloud sync error:', e);
        } finally {
          setLoading(false);
        }
      } else if (_event === 'SIGNED_OUT') {
        clearData().catch(e => console.warn('clearData error:', e));
      }

      syncedUserIdRef.current = incomingUserId;
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
