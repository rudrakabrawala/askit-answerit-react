import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/integrations/supabase/client'

export const useAuth = () => {
  const { setAuth, isLoading } = useAuthStore()

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuth(session)
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session)
    })

    return () => subscription.unsubscribe()
  }, [setAuth])

  return { isLoading }
}