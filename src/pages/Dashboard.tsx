import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Users, FileText, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAppointments } from "@/hooks/useAppointments"
import { usePatients } from "@/hooks/usePatients"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export default function Dashboard() {
  const navigate = useNavigate()
  const { appointments } = useAppointments()
  const { patients } = usePatients()
  const { userId, profile, user } = useAuth()
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)

  // Get today's appointments
  const today = new Date().toISOString().split('T')[0]
  const todaysAppointments = appointments.filter(apt => apt.appointment_date === today)

  // Get this month's prescriptions count
  const thisMonth = new Date().toISOString().slice(0, 7)
  const [monthlyPrescriptions, setMonthlyPrescriptions] = useState(0)

  useEffect(() => {
    if (userId) {
      fetchMonthlyStats()
    }
  }, [userId])

  const fetchMonthlyStats = async () => {
    try {
      // Get this month's prescriptions
      const { data: prescriptions } = await supabase
        .from('prescriptions')
        .select('id')
        .eq('doctor_id', userId)
        .gte('prescribed_date', `${thisMonth}-01`)
        .lt('prescribed_date', `${thisMonth}-32`)

      setMonthlyPrescriptions(prescriptions?.length || 0)

      // Get this month's revenue
      const { data: billing } = await supabase
        .from('billing')
        .select('amount')
        .eq('doctor_id', userId)
        .eq('status', 'paid')
        .gte('created_at', `${thisMonth}-01`)
        .lt('created_at', `${thisMonth}-32`)

      const revenue = billing?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0
      setMonthlyRevenue(revenue)
    } catch (error) {
      console.error('Error fetching monthly stats:', error)
    }
  }

  const stats = [
    {
      title: "Today's Appointments",
      value: todaysAppointments.length.toString(),
      icon: CalendarIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Patients",
      value: patients.length.toString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Prescriptions This Month",
      value: monthlyPrescriptions.toString(),
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Revenue This Month",
      value: `₹${monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ]

  const recentAppointments = todaysAppointments.slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.fullName || profile?.full_name || 'Doctor'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Appointments</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.length > 0 ? (
                recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{appointment.patients?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.appointment_time}</p>
                      <Button variant="ghost" size="sm">Join</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No appointments today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => navigate('/appointments')} className="h-20 flex flex-col gap-2">
                <CalendarIcon className="h-6 w-6" />
                <span>New Appointment</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/patients')} className="h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Add Patient</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/prescriptions')} className="h-20 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span>New Prescription</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/teleconsult')} className="h-20 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Start Video Call</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}