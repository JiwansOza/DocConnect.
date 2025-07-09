import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from '@/hooks/use-toast'

export const useBilling = () => {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      fetchBills()
    }
  }, [userId])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('billing')
        .select(`
          *,
          patients (
            id,
            full_name,
            phone,
            email
          ),
          appointments (
            id,
            appointment_date,
            appointment_time,
            type
          )
        `)
        .eq('doctor_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBills(data || [])
    } catch (error) {
      console.error('Error fetching bills:', error)
      toast({
        title: "Error",
        description: "Failed to fetch bills",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addBill = async (billData) => {
    try {
      const { data, error } = await supabase
        .from('billing')
        .insert({
          ...billData,
          doctor_id: userId,
        })
        .select(`
          *,
          patients (
            id,
            full_name,
            phone,
            email
          ),
          appointments (
            id,
            appointment_date,
            appointment_time,
            type
          )
        `)
        .single()

      if (error) throw error
      
      setBills(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Bill created successfully",
      })
      return data
    } catch (error) {
      console.error('Error adding bill:', error)
      toast({
        title: "Error",
        description: "Failed to create bill",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateBill = async (billId, updates) => {
    try {
      const { data, error } = await supabase
        .from('billing')
        .update(updates)
        .eq('id', billId)
        .eq('doctor_id', userId)
        .select(`
          *,
          patients (
            id,
            full_name,
            phone,
            email
          ),
          appointments (
            id,
            appointment_date,
            appointment_time,
            type
          )
        `)
        .single()

      if (error) throw error
      
      setBills(prev => prev.map(b => b.id === billId ? data : b))
      toast({
        title: "Success",
        description: "Bill updated successfully",
      })
      return data
    } catch (error) {
      console.error('Error updating bill:', error)
      toast({
        title: "Error",
        description: "Failed to update bill",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteBill = async (billId) => {
    try {
      const { error } = await supabase
        .from('billing')
        .delete()
        .eq('id', billId)
        .eq('doctor_id', userId)

      if (error) throw error
      
      setBills(prev => prev.filter(b => b.id !== billId))
      toast({
        title: "Success",
        description: "Bill deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting bill:', error)
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    bills,
    loading,
    addBill,
    updateBill,
    deleteBill,
    fetchBills,
  }
}