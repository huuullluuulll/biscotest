import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  session: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: any) => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isAdmin: false,

      checkSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          if (session) {
            set({
              user: session.user,
              session,
              isAuthenticated: true,
              isAdmin: session.user.user_metadata?.role === 'admin',
            });
          }
        } catch (error) {
          console.error('Session check error:', error);
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isAdmin: false,
          });
        }
      },

      setSession: (session) => {
        if (!session) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isAdmin: false,
          });
          return;
        }

        set({
          user: session.user,
          session,
          isAuthenticated: true,
          isAdmin: session.user.user_metadata?.role === 'admin',
        });
      },

      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (!data?.user || !data?.session) {
            throw new Error('No user data returned from authentication');
          }

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            isAdmin: data.user.user_metadata?.role === 'admin',
          });
        } catch (error) {
          console.error('Sign in error:', error);
          throw error;
        }
      },

      signOut: async () => {
        try {
          // First check if we have a valid session
          const currentSession = get().session;
          if (!currentSession) {
            // If no session, just clear everything and redirect
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isAdmin: false,
            });
            window.location.href = '/login';
            return;
          }

          // Sign out from Supabase
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          // Clear the auth store state
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isAdmin: false,
          });

          // Clear any persisted storage
          localStorage.removeItem('auth-storage');
          sessionStorage.clear();

          // Redirect to login
          window.location.href = '/login';
        } catch (error) {
          console.error('Sign out error:', error);
          // Even if there's an error, clear the state and redirect
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isAdmin: false,
          });
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);