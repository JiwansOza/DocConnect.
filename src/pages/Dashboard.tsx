import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Users, FileText, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAppointments } from "@/hooks/useAppointments"
import { usePatients } from "@/hooks/usePatients"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useBilling } from "@/hooks/useBilling"
import { usePrescriptions } from "@/hooks/usePrescriptions"

export default function Dashboard() {
  const navigate = useNavigate()
  const { appointments } = useAppointments()
  const { patients } = usePatients()
  const { userId, profile, user } = useAuth()
  const { bills, loading: billingLoading } = useBilling()
  const { prescriptions, loading: prescriptionsLoading } = usePrescriptions()
  const [dashboardLoading, setDashboardLoading] = useState(true)

  // Get today's appointments
  const today = new Date().toISOString().split('T')[0]
  const todaysAppointments = appointments.filter(apt => apt.appointment_date === today)

  // Get this month's prescriptions and revenue
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthlyPrescriptions = prescriptions.filter(p => p.prescribed_date && p.prescribed_date.startsWith(thisMonth)).length
  const monthlyRevenue = bills.filter(b => b.status === 'paid' && b.created_at && b.created_at.startsWith(thisMonth)).reduce((sum, bill) => sum + Number(bill.amount), 0)

  useEffect(() => {
    setDashboardLoading(billingLoading || prescriptionsLoading)
  }, [billingLoading, prescriptionsLoading])

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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.fullName || profile?.full_name || 'Doctor'}</p>
      </div>

      {/* Stats Grid */}
      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 md:gap-6">
        {dashboardLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow w-full">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4 md:gap-6">
        {/* Today's Appointments */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Appointments</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-4">
              {dashboardLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-1/2 mb-2" />
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 gap-1 md:gap-0">
                      <div>
                        <p className="font-medium">{appointment.patients?.full_name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{appointment.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appointment.appointment_time}</p>
                        <Button variant="ghost" size="sm">Join</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-2 sm:py-4">No appointments today</p>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Button onClick={() => navigate('/appointments')} className="h-12 sm:h-16 md:h-20 flex flex-col gap-1 md:gap-2">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-base">New Appointment</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/patients')} className="h-12 sm:h-16 md:h-20 flex flex-col gap-1 md:gap-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-base">Add Patient</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/prescriptions')} className="h-12 sm:h-16 md:h-20 flex flex-col gap-1 md:gap-2">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-base">New Prescription</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/teleconsult')} className="h-12 sm:h-16 md:h-20 flex flex-col gap-1 md:gap-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-base">Start Video Call</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}