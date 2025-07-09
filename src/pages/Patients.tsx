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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  Activity
} from "lucide-react"
import { usePatients } from "@/hooks/usePatients"

export default function Patients() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    gender: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_history: "",
    allergies: ""
  })

  const { patients, loading, addPatient } = usePatients()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addPatient(formData)
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        date_of_birth: "",
        gender: "",
        address: "",
        emergency_contact: "",
        emergency_phone: "",
        medical_history: "",
        allergies: ""
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to add patient:', error)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input 
                  id="full_name" 
                  placeholder="Enter patient name" 
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input 
                    id="date_of_birth" 
                    type="date" 
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({...prev, date_of_birth: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Input 
                    id="gender" 
                    placeholder="Gender" 
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({...prev, gender: e.target.value}))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="+91 xxxxx xxxxx" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  placeholder="Full address" 
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Adding..." : "Add Patient"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No patients found. Add your first patient to get started.
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPatient(patient)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {patient.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{patient.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {patient.date_of_birth && new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years
                      {patient.gender && `, ${patient.gender}`}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Added: {new Date(patient.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPatient.full_name}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <p className="text-sm">{selectedPatient.date_of_birth || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <p className="text-sm">{selectedPatient.gender || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <p className="text-sm">{selectedPatient.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <p className="text-sm">{selectedPatient.email || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Address</Label>
                    <p className="text-sm">{selectedPatient.address || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Medical History</Label>
                    <p className="text-sm">{selectedPatient.medical_history || 'No medical history available'}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="history">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">No medical history available</p>
                </div>
              </TabsContent>
              <TabsContent value="prescriptions">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">No prescriptions available</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}