import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/public/types/supabase'

const supabaseUrl = 'https://rzqvxvfbaqhzioasrjmk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cXZ4dmZiYXFoemlvYXNyam1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0Mjg4NDIsImV4cCI6MjA1NzAwNDg0Mn0.sqpRqm7s4kFuhDGepf_adAopn4evmJUuPqSuPpGAxx4'

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)
