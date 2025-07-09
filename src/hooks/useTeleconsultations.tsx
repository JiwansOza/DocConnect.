import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from '@/hooks/use-toast'

export const useTeleconsultations = () => {
  const [teleconsultations, setTeleconsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      fetchTeleconsultations()
    }
  }, [userId])

  const fetchTeleconsultations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('teleconsultations')
        .select(`
          *,
          patients (
            id,
            full_name,
            phone,
            email
          )
        `)
        .eq('doctor_id', userId)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error
      setTeleconsultations(data || [])
    } catch (error) {
      console.error('Error fetching teleconsultations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch teleconsultations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTeleconsultation = async (teleconsultationData) => {
    try {
      const { data, error } = await supabase
        .from('teleconsultations')
        .insert({
          ...teleconsultationData,
          doctor_id: userId,
        })
        .select(`
          *,
          patients (
            id,
            full_name,
            phone,
            email
          )
        `)
        .single()

      if (error) throw error
      
      setTeleconsultations(prev => [...prev, data])
      toast({
        title: "Success",
        description: "Teleconsultation scheduled successfully",
      })
      return data
    } catch (error) {
      console.error('Error adding teleconsultation:', error)
      toast({
        title: "Error",
        description: "Failed to schedule teleconsultation",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateTeleconsultation = async (teleconsultationId, updates) => {
    try {
      const { data, error } = await supabase
        .from('teleconsultations')
        .update(updates)
        .eq('id', teleconsultationId)
        .eq('doctor_id', userId)
        .select(`
          *,
          patients (
            id,
            full_name,
            phone,
            email
          )
        `)
        .single()

      if (error) throw error
      
      setTeleconsultations(prev => prev.map(t => t.id === teleconsultationId ? data : t))
      toast({
        title: "Success",
        description: "Teleconsultation updated successfully",
      })
      return data
    } catch (error) {
      console.error('Error updating teleconsultation:', error)
      toast({
        title: "Error",
        description: "Failed to update teleconsultation",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteTeleconsultation = async (teleconsultationId) => {
    try {
      const { error } = await supabase
        .from('teleconsultations')
        .delete()
        .eq('id', teleconsultationId)
        .eq('doctor_id', userId)

      if (error) throw error
      
      setTeleconsultations(prev => prev.filter(t => t.id !== teleconsultationId))
      toast({
        title: "Success",
        description: "Teleconsultation cancelled successfully",
      })
    } catch (error) {
      console.error('Error deleting teleconsultation:', error)
      toast({
        title: "Error",
        description: "Failed to cancel teleconsultation",
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    teleconsultations,
    loading,
    addTeleconsultation,
    updateTeleconsultation,
    deleteTeleconsultation,
    fetchTeleconsultations,
  }
}