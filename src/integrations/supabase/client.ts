// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nclowcrclhqiuynmkrbr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbG93Y3JjbGhxaXV5bm1rcmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTYzMjMsImV4cCI6MjA2NzQ3MjMyM30.8NO3lwotXaMVlnV_vk9vzFSTPcfOu1d511RJOphIHxk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});