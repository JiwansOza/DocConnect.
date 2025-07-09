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
    } catch (error) {
      console.error('Failed to add appointment:', error)
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
    await updateAppointment(appointment.id, {
      appointment_date: rescheduleData.date,
      appointment_time: rescheduleData.time,
      status: 'confirmed',
    });
    setRescheduleDialog({ open: false, appointment: null });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className={cn("w-full pointer-events-auto")}
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Appointments for {selectedDate?.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentsLoading ? (
                <div className="text-center py-4">Loading appointments...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No appointments for this date
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="text-xs font-medium">{appointment.appointment_time}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{appointment.patients?.full_name}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        <div className="flex items-center gap-4 mt-1">
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
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleJoin(appointment)}>Join</Button>
                      <Button variant="outline" size="sm" onClick={() => openReschedule(appointment)}>Reschedule</Button>
                      <Button size="sm" onClick={() => handleStartConsultation(appointment)}>Start Consultation</Button>
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