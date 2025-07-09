-- Create enum types
CREATE TYPE appointment_status AS ENUM ('confirmed', 'pending', 'cancelled', 'completed');
CREATE TYPE appointment_type AS ENUM ('consultation', 'followup', 'checkup', 'emergency');
CREATE TYPE prescription_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE billing_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- Create profiles table for doctors
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  specialization TEXT,
  license_number TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  type appointment_type NOT NULL DEFAULT 'consultation',
  status appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  status prescription_status NOT NULL DEFAULT 'active',
  prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create billing table
CREATE TABLE public.billing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status billing_status NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for patients
CREATE POLICY "Doctors can view their patients" ON public.patients
  FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can create patients" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update their patients" ON public.patients
  FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete their patients" ON public.patients
  FOR DELETE USING (auth.uid() = doctor_id);

-- Create RLS policies for appointments
CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update their appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete their appointments" ON public.appointments
  FOR DELETE USING (auth.uid() = doctor_id);

-- Create RLS policies for prescriptions
CREATE POLICY "Doctors can view their prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update their prescriptions" ON public.prescriptions
  FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete their prescriptions" ON public.prescriptions
  FOR DELETE USING (auth.uid() = doctor_id);

-- Create RLS policies for billing
CREATE POLICY "Doctors can view their billing records" ON public.billing
  FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can create billing records" ON public.billing
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update their billing records" ON public.billing
  FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete their billing records" ON public.billing
  FOR DELETE USING (auth.uid() = doctor_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_updated_at
  BEFORE UPDATE ON public.billing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_patients_doctor_id ON public.patients(doctor_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_billing_doctor_id ON public.billing(doctor_id);
CREATE INDEX idx_billing_patient_id ON public.billing(patient_id);
CREATE INDEX idx_billing_status ON public.billing(status);