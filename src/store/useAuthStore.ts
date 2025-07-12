
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  user_id: string
  username: string
  name: string
  email: string
  gender?: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  logout: () => Promise<void>
  signUp: (email: string, password: string, userData: { name: string; username: string; gender?: string }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (session) => {
        set({ 
          session, 
          user: session?.user ?? null, 
          isAuthenticated: !!session,
          isLoading: false
        })
        
        // Fetch profile if session exists
        if (session?.user) {
          setTimeout(() => {
            get().fetchProfile(session.user.id)
          }, 0)
        } else {
          set({ profile: null })
        }
      },

      setProfile: (profile) => set({ profile }),

      fetchProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single()
          
          if (!error && data) {
            set({ profile: data as Profile })
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      },

      signUp: async (email, password, userData) => {
        const redirectUrl = `${window.location.origin}/`
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: userData
          }
        })
        return { error }
      },

      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        return { error }
      },

      updateProfile: async (updates) => {
        const { profile } = get()
        if (!profile) return { error: new Error('No profile found') }

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', profile.user_id)

        if (!error) {
          set({ profile: { ...profile, ...updates } })
        }

        return { error }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ 
          user: null, 
          session: null, 
          profile: null, 
          isAuthenticated: false,
          isLoading: false
        })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        session: state.session,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
