import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Download, 
  FileText, 
  Calendar,
  User,
  Trash2
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePrescriptions } from "@/hooks/usePrescriptions"
import { usePatients } from "@/hooks/usePatients"
import jsPDF from "jspdf"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody } from "@/components/ui/table"

export default function Prescriptions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    patient_id: "",
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    prescribed_date: new Date().toISOString().split('T')[0]
  })
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { prescriptions, loading: prescriptionsLoading, addPrescription } = usePrescriptions()
  const { patients } = usePatients()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addPrescription(formData)
      setFormData({
        patient_id: "",
        medication_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        prescribed_date: new Date().toISOString().split('T')[0]
      })
      setIsDialogOpen(false)
      toast({
        title: "Prescription Added",
        description: "The prescription has been added successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add prescription. Please try again.",
        variant: "destructive"
      })
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  function handleViewDetails(prescription) {
    setSelectedPrescription(prescription)
    setIsDetailsOpen(true)
  }

  function downloadPrescriptionPDF(prescription) {
    const doc = new jsPDF()
    // Header
    doc.setFontSize(22)
    doc.text("DocConnect Clinic", 10, 18)
    doc.setFontSize(16)
    doc.text("PRESCRIPTION", 140, 18)
    doc.setLineWidth(0.5)
    doc.line(10, 22, 200, 22)

    // Prescription Info
    doc.setFontSize(12)
    doc.text(`Patient: ${prescription.patients?.full_name || ''}`, 10, 32)
    doc.text(`Date: ${prescription.prescribed_date}`, 150, 32)

    // Medication Details
    doc.setFontSize(14)
    doc.text("Medication Details", 10, 45)
    doc.setFontSize(12)
    doc.text(`Medication: ${prescription.medication_name}`, 10, 55)
    doc.text(`Dosage: ${prescription.dosage}`, 10, 65)
    doc.text(`Frequency: ${prescription.frequency}`, 10, 75)
    doc.text(`Duration: ${prescription.duration}`, 10, 85)
    if (prescription.instructions) {
      doc.text(`Instructions: ${prescription.instructions}`, 10, 95)
    }
    doc.setFontSize(12)
    doc.text(`Prescribed by: ${user?.fullName || 'Doctor'}`, 10, 110)

    // Footer
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text("Take medications as prescribed. Contact us for any questions.", 10, 130)
    doc.save(`prescription-${prescription.id}.pdf`)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title and New Prescription button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Create and manage patient prescriptions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base flex items-center justify-center mt-2 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Prescription</DialogTitle>
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
                <Label htmlFor="medication_name">Medication Name *</Label>
                <Input 
                  id="medication_name"
                  value={formData.medication_name}
                  onChange={(e) => setFormData(prev => ({...prev, medication_name: e.target.value}))}
                  placeholder="Enter medication name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input 
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData(prev => ({...prev, dosage: e.target.value}))}
                    placeholder="e.g., 5mg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input 
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({...prev, frequency: e.target.value}))}
                    placeholder="e.g., Twice daily"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input 
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                  placeholder="e.g., 30 days"
                  required
                />
              </div>

              <div>
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea 
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({...prev, instructions: e.target.value}))}
                  placeholder="Additional instructions for the patient..."
                />
              </div>

              <div>
                <Label htmlFor="prescribed_date">Prescribed Date *</Label>
                <Input 
                  id="prescribed_date"
                  type="date"
                  value={formData.prescribed_date}
                  onChange={(e) => setFormData(prev => ({...prev, prescribed_date: e.target.value}))}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={prescriptionsLoading}>
                  {prescriptionsLoading ? "Creating..." : "Create Prescription"}
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
          placeholder="Search prescriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
        />
      </div>

      {/* Prescriptions List */}
      <div className="space-y-2 sm:space-y-4">
        {prescriptionsLoading ? (
          <div className="text-center py-2 sm:py-4">Loading prescriptions...</div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="text-center py-2 sm:py-4 text-muted-foreground">
            No prescriptions found
          </div>
        ) : (
          <Table>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-md transition-shadow w-full">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 sm:mb-4 gap-1 md:gap-0">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <h3 className="font-semibold text-base sm:text-lg">{prescription.patients?.full_name}</h3>
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{prescription.medication_name}</p>
                          <div className="flex items-center gap-2 sm:gap-4 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {prescription.prescribed_date}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {`Dr. ${user?.fullName || 'Doctor'}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2 mt-2 md:mt-0 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => downloadPrescriptionPDF(prescription)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button size="sm" className="flex-1 md:flex-none" onClick={() => handleViewDetails(prescription)}>View Details</Button>
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-medium">Medication Details:</Label>
                      <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-xs sm:text-sm">{prescription.medication_name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                        </p>
                        {prescription.instructions && (
                          <p className="text-xs sm:text-muted-foreground mt-1">
                            Instructions: {prescription.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {isDetailsOpen && selectedPrescription && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
            </DialogHeader>
            <div>
              <p><b>Patient:</b> {selectedPrescription.patients?.full_name}</p>
              <p><b>Date:</b> {selectedPrescription.prescribed_date}</p>
              <p><b>Medication:</b> {selectedPrescription.medication_name}</p>
              <p><b>Dosage:</b> {selectedPrescription.dosage}</p>
              <p><b>Frequency:</b> {selectedPrescription.frequency}</p>
              <p><b>Duration:</b> {selectedPrescription.duration}</p>
              {selectedPrescription.instructions && (
                <p><b>Instructions:</b> {selectedPrescription.instructions}</p>
              )}
              <p><b>Status:</b> {selectedPrescription.status}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}