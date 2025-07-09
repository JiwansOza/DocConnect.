import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from '@/hooks/use-toast'

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      fetchAppointments()
    }
  }, [userId])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointments')
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
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addAppointment = async (appointmentData) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
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
      
      setAppointments(prev => [...prev, data])
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      })
      return data
    } catch (error) {
      console.error('Error adding appointment:', error)
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateAppointment = async (appointmentId, updates) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
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
      
      setAppointments(prev => prev.map(a => a.id === appointmentId ? data : a))
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      })
      return data
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteAppointment = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
        .eq('doctor_id', userId)

      if (error) throw error
      
      setAppointments(prev => prev.filter(a => a.id !== appointmentId))
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      })
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    fetchAppointments,
  }
}