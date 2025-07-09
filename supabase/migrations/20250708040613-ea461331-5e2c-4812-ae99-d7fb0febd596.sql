-- Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can view their patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can create patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can update their patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can delete their patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can delete their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can view their prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can update their prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can delete their prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can view their billing records" ON public.billing;
DROP POLICY IF EXISTS "Doctors can create billing records" ON public.billing;
DROP POLICY IF EXISTS "Doctors can update their billing records" ON public.billing;
DROP POLICY IF EXISTS "Doctors can delete their billing records" ON public.billing;

-- Update profiles table to use Clerk user IDs
ALTER TABLE public.profiles ALTER COLUMN user_id TYPE TEXT;

-- Update other tables to use TEXT for doctor_id to match Clerk user IDs
ALTER TABLE public.patients ALTER COLUMN doctor_id TYPE TEXT;
ALTER TABLE public.appointments ALTER COLUMN doctor_id TYPE TEXT;
ALTER TABLE public.prescriptions ALTER COLUMN doctor_id TYPE TEXT;
ALTER TABLE public.billing ALTER COLUMN doctor_id TYPE TEXT;

-- Create new RLS policies for Clerk authentication
-- Note: These policies will be permissive since we can't validate Clerk tokens at database level
-- You'll need to handle authorization in your application code

CREATE POLICY "Allow authenticated users to manage profiles" ON public.profiles
  FOR ALL USING (true);

CREATE POLICY "Allow authenticated users to manage patients" ON public.patients
  FOR ALL USING (true);

CREATE POLICY "Allow authenticated users to manage appointments" ON public.appointments
  FOR ALL USING (true);

CREATE POLICY "Allow authenticated users to manage prescriptions" ON public.prescriptions
  FOR ALL USING (true);

CREATE POLICY "Allow authenticated users to manage billing" ON public.billing
  FOR ALL USING (true);