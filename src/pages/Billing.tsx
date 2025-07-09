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
  Plus, 
  Search, 
  Download, 
  Receipt, 
  Calendar,
  User,
  DollarSign,
  Trash2
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBilling } from "@/hooks/useBilling"
import { usePatients } from "@/hooks/usePatients"
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

export default function Billing() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    patient_id: "",
    amount: "",
    description: "",
    due_date: new Date().toISOString().split('T')[0],
    invoice_number: ""
  })

  const { bills, loading: billingLoading, addBill, updateBill } = useBilling()
  const { patients } = usePatients()

  const [selectedBill, setSelectedBill] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addBill({
        ...formData,
        amount: parseFloat(formData.amount),
        invoice_number: formData.invoice_number || `INV-${Date.now()}`
      })
      setFormData({
        patient_id: "",
        amount: "",
        description: "",
        due_date: new Date().toISOString().split('T')[0],
        invoice_number: ""
      })
      setIsDialogOpen(false)
      toast({
        title: "Invoice Created",
        description: "The invoice has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive"
      });
    }
  }

  const filteredRecords = bills.filter(record =>
    record.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0)
  const pendingAmount = bills.filter(bill => bill.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0)
  const overdueAmount = bills.filter(bill => bill.status === 'overdue').reduce((sum, bill) => sum + bill.amount, 0)

  function handleViewDetails(bill) {
    setSelectedBill(bill)
    setIsDetailsOpen(true)
  }

  function downloadInvoice(bill) {
    const doc = new jsPDF();
    // Header
    doc.setFontSize(22);
    doc.text("DocConnect Clinic", 10, 18);
    doc.setFontSize(16);
    doc.text("INVOICE", 150, 18);
    doc.setLineWidth(0.5);
    doc.line(10, 22, 200, 22);

    // Invoice Info
    doc.setFontSize(12);
    doc.text(`Invoice #: ${bill.invoice_number}`, 10, 32);
    doc.text(`Date: ${bill.due_date}`, 150, 32);

    // Patient Info
    doc.setFontSize(14);
    doc.text("Billed To:", 10, 45);
    doc.setFontSize(12);
    doc.text(`${bill.patients?.full_name || ''}`, 10, 52);

    // Service Details Box
    doc.setDrawColor(200);
    doc.rect(10, 60, 190, 30);
    doc.setFontSize(14);
    doc.text("Service Description", 12, 68);
    doc.setFontSize(12);
    doc.text(`${bill.description || ''}`, 12, 76);

    // Amount & Status
    doc.setFontSize(14);
    doc.text("Amount Due:", 10, 105);
    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94); // green
    doc.text(`₹${bill.amount}`, 50, 105);
    doc.setTextColor(0,0,0);
    doc.setFontSize(12);
    doc.text(`Status: ${bill.status}`, 10, 115);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Thank you for your business!", 10, 140);
    doc.save(`invoice-${bill.invoice_number}.pdf`);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title and New Invoice button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Billing & Invoices</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage payments and generate invoices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base flex items-center justify-center mt-2 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
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
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input 
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData(prev => ({...prev, invoice_number: e.target.value}))}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <Label htmlFor="description">Service Description *</Label>
                <Input 
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="e.g., Consultation, Blood Test"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input 
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input 
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({...prev, due_date: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={billingLoading}>
                  {billingLoading ? "Creating..." : "Create Invoice"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-foreground">₹{pendingAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Receipt className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Amount</p>
                <p className="text-2xl font-bold text-foreground">₹{overdueAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
        />
      </div>

      {/* Bills List */}
      <div className="space-y-2 sm:space-y-4">
        {billingLoading ? (
          <div className="text-center py-2 sm:py-4">Loading bills...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-2 sm:py-4 text-muted-foreground">
            No bills found
          </div>
        ) : (
          <Table>
            <TableBody>
              {filteredRecords.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.invoice_number}</TableCell>
                  <TableCell>{bill.patients?.full_name}</TableCell>
                  <TableCell>{bill.amount.toLocaleString()}</TableCell>
                  <TableCell>{bill.due_date}</TableCell>
                  <TableCell>{bill.status}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => downloadInvoice(bill)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" onClick={async () => {
                        if (bill.status === 'pending') {
                          try {
                            await updateBill(bill.id, { status: 'paid' });
                            toast({
                              title: "Marked as Paid",
                              description: `Invoice ${bill.invoice_number} marked as paid.`,
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to mark as paid. Please try again.",
                              variant: "destructive"
                            });
                          }
                        } else {
                          handleViewDetails(bill);
                        }
                      }}>
                        {bill.status === 'pending' ? 'Mark as Paid' : 'View Details'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {isDetailsOpen && selectedBill && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            <div>
              <p><b>Invoice Number:</b> {selectedBill.invoice_number}</p>
              <p><b>Patient:</b> {selectedBill.patients?.full_name}</p>
              <p><b>Amount:</b> ₹{selectedBill.amount}</p>
              <p><b>Status:</b> {selectedBill.status}</p>
              <p><b>Due Date:</b> {selectedBill.due_date}</p>
              <p><b>Description:</b> {selectedBill.description}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}