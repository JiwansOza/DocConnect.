import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useAuth = () => {
  const { user, isSignedIn, isLoaded } = useUser()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (isSignedIn && user) {
      // Create or update user profile in Supabase
      createOrUpdateProfile()
    }
  }, [isSignedIn, user])

  const createOrUpdateProfile = async () => {
    if (!user) return

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!existingProfile) {
        // Create new profile
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.fullName || `${user.firstName} ${user.lastName}` || 'Unknown Doctor',
            email: user.primaryEmailAddress?.emailAddress,
          })
          .select()
          .single()

        if (error) throw error
        setProfile(data)
      } else {
        setProfile(existingProfile)
      }
    } catch (error) {
      console.error('Error managing profile:', error)
    }
  }

  return {
    user,
    profile,
    isSignedIn,
    isLoaded,
    userId: user?.id,
  }
}