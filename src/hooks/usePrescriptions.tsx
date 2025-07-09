import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from '@/hooks/use-toast'

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      fetchPrescriptions()
    }
  }, [userId])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('prescriptions')
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
        .order('prescribed_date', { ascending: false })

      if (error) throw error
      setPrescriptions(data || [])
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch prescriptions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addPrescription = async (prescriptionData) => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          ...prescriptionData,
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
      
      setPrescriptions(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Prescription created successfully",
      })
      return data
    } catch (error) {
      console.error('Error adding prescription:', error)
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      })
      throw error
    }
  }

  const updatePrescription = async (prescriptionId, updates) => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .update(updates)
        .eq('id', prescriptionId)
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
      
      setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? data : p))
      toast({
        title: "Success",
        description: "Prescription updated successfully",
      })
      return data
    } catch (error) {
      console.error('Error updating prescription:', error)
      toast({
        title: "Error",
        description: "Failed to update prescription",
        variant: "destructive",
      })
      throw error
    }
  }

  const deletePrescription = async (prescriptionId) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId)
        .eq('doctor_id', userId)

      if (error) throw error
      
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId))
      toast({
        title: "Success",
        description: "Prescription deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting prescription:', error)
      toast({
        title: "Error",
        description: "Failed to delete prescription",
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    prescriptions,
    loading,
    addPrescription,
    updatePrescription,
    deletePrescription,
    fetchPrescriptions,
  }
}