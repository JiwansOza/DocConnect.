import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock, User, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppointments } from "@/hooks/useAppointments"
import { usePatients } from "@/hooks/usePatients"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: "",
    type: "consultation" as "consultation" | "followup" | "checkup" | "emergency",
    notes: ""
  })

  const { appointments, loading: appointmentsLoading, addAppointment, updateAppointment } = useAppointments()
  const { patients } = usePatients()
  const { user } = useAuth()
  const [rescheduleDialog, setRescheduleDialog] = useState({ open: false, appointment: null })
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addAppointment(formData)
      setFormData({
        patient_id: "",
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: "",
        type: "consultation",
        notes: ""
      })
      setIsDialogOpen(false)
      toast({
        title: "Appointment Scheduled",
        description: "The appointment has been added successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add appointment. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Filter appointments by selected date
  const selectedDateStr = selectedDate?.toISOString().split('T')[0]
  const filteredAppointments = appointments.filter(apt => 
    apt.appointment_date === selectedDateStr
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function generateMeetingUrl(patientName) {
    const roomName = `docconnect-${patientName?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    return `https://meet.jit.si/${roomName}`;
  }

  async function handleJoin(appointment) {
    let url = appointment.meeting_url;
    if (!url) {
      url = generateMeetingUrl(appointment.patients?.full_name);
      await updateAppointment(appointment.id, { meeting_url: url });
    }
    window.open(url, '_blank');
  }

  async function handleStartConsultation(appointment) {
    let url = appointment.meeting_url;
    if (!url) {
      url = generateMeetingUrl(appointment.patients?.full_name);
    }
    await updateAppointment(appointment.id, { meeting_url: url, status: 'in_progress' });
    window.open(url, '_blank');
  }

  function openReschedule(appointment) {
    setRescheduleDialog({ open: true, appointment });
    setRescheduleData({ date: appointment.appointment_date, time: appointment.appointment_time });
  }

  async function handleRescheduleSave() {
    const { appointment } = rescheduleDialog;
    try {
      await updateAppointment(appointment.id, {
        appointment_date: rescheduleData.date,
        appointment_time: rescheduleData.time,
        status: 'confirmed',
      });
      setRescheduleDialog({ open: false, appointment: null });
      toast({
        title: "Appointment Rescheduled",
        description: "The appointment has been updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment. Please try again.",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title and New Appointment button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your patient appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base flex items-center justify-center mt-2 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patient_id">Patient *</Label>
                <Select 
                  value={formData.patient_id} 
                  onValueChange={(value) => setFormData(prev => ({...prev, patient_id: value}))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="appointment_date">Date *</Label>
                <Input 
                  id="appointment_date" 
                  type="date" 
                  value={formData.appointment_date}
                  onChange={(e) => setFormData(prev => ({...prev, appointment_date: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="appointment_time">Time *</Label>
                <Input 
                  id="appointment_time" 
                  type="time" 
                  value={formData.appointment_time}
                  onChange={(e) => setFormData(prev => ({...prev, appointment_time: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Appointment Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData(prev => ({...prev, type: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="checkup">Check-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Additional notes..." 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={appointmentsLoading}>
                  {appointmentsLoading ? "Scheduling..." : "Schedule Appointment"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar and Appointments List */}
      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Calendar */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {appointmentsLoading ? (
              <div className="space-y-2 sm:space-y-4">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="w-full lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Appointments for {selectedDate?.toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="space-y-2 sm:space-y-4">
              {appointmentsLoading ? (
                <>
                  <Skeleton className="h-16 w-full mb-2" />
                  <Skeleton className="h-16 w-full mb-2" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-2 sm:py-4 text-muted-foreground">
                  No appointments for this date
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-2 sm:p-4 rounded-lg border bg-card hover:shadow-md transition-shadow gap-1 md:gap-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base sm:text-lg">{appointment.patients?.full_name}</h3>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{appointment.type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.duration_minutes} min
                        </span>
                        {appointment.patients?.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {appointment.patients.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 mt-2 md:mt-0 w-full md:w-auto">
                      <Button variant="ghost" size="sm" className="flex-1 md:flex-none" onClick={() => handleJoin(appointment)}>Join</Button>
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => openReschedule(appointment)}>Reschedule</Button>
                      <Button size="sm" className="flex-1 md:flex-none" onClick={() => handleStartConsultation(appointment)}>Start Consultation</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {rescheduleDialog.open && (
        <Dialog open={rescheduleDialog.open} onOpenChange={() => setRescheduleDialog({ open: false, appointment: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Date</Label>
              <Input type="date" value={rescheduleData.date} onChange={e => setRescheduleData(d => ({ ...d, date: e.target.value }))} />
              <Label>Time</Label>
              <Input type="time" value={rescheduleData.time} onChange={e => setRescheduleData(d => ({ ...d, time: e.target.value }))} />
              <div className="flex gap-2 pt-2">
                <Button onClick={handleRescheduleSave}>Save</Button>
                <Button variant="outline" onClick={() => setRescheduleDialog({ open: false, appointment: null })}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}