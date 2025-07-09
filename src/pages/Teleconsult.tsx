import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Video, 
  Phone, 
  Calendar,
  User,
  Clock,
  Plus,
  Copy,
  ExternalLink
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeleconsultations } from "@/hooks/useTeleconsultations"
import { usePatients } from "@/hooks/usePatients"

export default function Teleconsult() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [meetingUrl, setMeetingUrl] = useState("")
  const [formData, setFormData] = useState({
    patient_id: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    duration: 30,
    meeting_url: ""
  })

  const { teleconsultations, loading: teleconsultationsLoading, addTeleconsultation } = useTeleconsultations()
  const { patients } = usePatients()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedPatient = patients.find(p => p.id === formData.patient_id)
      const meetingUrl = generateMeetingUrl(selectedPatient?.full_name || "patient")
      await addTeleconsultation({
        ...formData,
        meeting_url: meetingUrl
      })
      setFormData({
        patient_id: "",
        date: new Date().toISOString().split('T')[0],
        time: "",
        duration: 30,
        meeting_url: ""
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to schedule teleconsultation:', error)
    }
  }

  const generateMeetingUrl = (patientName: string) => {
    const roomName = `doctorsmith-${patientName.toLowerCase().replace(' ', '-')}-${Date.now()}`
    return `https://meet.jit.si/${roomName}`
  }

  const startInstantMeeting = () => {
    const roomName = `doctorsmith-instant-${Date.now()}`
    const url = `https://meet.jit.si/${roomName}`
    setMeetingUrl(url)
    window.open(url, '_blank')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'waiting': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teleconsultation</h1>
          <p className="text-muted-foreground">Conduct video consultations with patients</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={startInstantMeeting} className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Start Instant Meeting
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Video Consultation</DialogTitle>
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
                <Label htmlFor="date">Date *</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input 
                  id="time" 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({...prev, duration: parseInt(e.target.value)}))}
                  placeholder="30"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={teleconsultationsLoading}>
                  {teleconsultationsLoading ? "Scheduling..." : "Schedule & Generate Link"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Meeting Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Start</h3>
                <p className="text-sm text-muted-foreground">Start an instant video call</p>
              </div>
              <Button onClick={startInstantMeeting} className="w-full">
                Start Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-blue-100">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Schedule Meeting</h3>
                <p className="text-sm text-muted-foreground">Plan a future consultation</p>
              </div>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="w-full">
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-green-100">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Join Meeting</h3>
                <p className="text-sm text-muted-foreground">Join with meeting ID</p>
              </div>
              <Button variant="outline" className="w-full">
                Join
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teleconsultationsLoading ? (
              <div className="text-center py-4">Loading teleconsultations...</div>
            ) : teleconsultations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming consultations
              </div>
            ) : (
              teleconsultations.map((consultation) => (
                <div 
                  key={consultation.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                      <Video className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">{consultation.time}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{consultation.patients?.full_name}</h3>
                        <Badge className={getStatusColor(consultation.status)}>
                          {consultation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{consultation.date}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {consultation.duration} min
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Dr. Smith
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(consultation.meeting_url)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => window.open(consultation.meeting_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jitsi Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Video Call Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• HD video and audio quality</li>
                <li>• Screen sharing capabilities</li>
                <li>• Meeting recording</li>
                <li>• Chat functionality</li>
                <li>• Secure end-to-end encryption</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Share meeting link with patients</li>
                <li>• No app installation required</li>
                <li>• Works on any device with a browser</li>
                <li>• Ensure stable internet connection</li>
                <li>• Test audio/video before meetings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}