import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from '@/hooks/use-toast'

export const usePatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      fetchPatients()
    }
  }, [userId])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addPatient = async (patientData) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          ...patientData,
          doctor_id: userId,
        })
        .select()
        .single()

      if (error) throw error
      
      setPatients(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Patient added successfully",
      })
      return data
    } catch (error) {
      console.error('Error adding patient:', error)
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      })
      throw error
    }
  }

  const updatePatient = async (patientId, updates) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patientId)
        .eq('doctor_id', userId)
        .select()
        .single()

      if (error) throw error
      
      setPatients(prev => prev.map(p => p.id === patientId ? data : p))
      toast({
        title: "Success",
        description: "Patient updated successfully",
      })
      return data
    } catch (error) {
      console.error('Error updating patient:', error)
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      })
      throw error
    }
  }

  const deletePatient = async (patientId) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)
        .eq('doctor_id', userId)

      if (error) throw error
      
      setPatients(prev => prev.filter(p => p.id !== patientId))
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting patient:', error)
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    fetchPatients,
  }
}