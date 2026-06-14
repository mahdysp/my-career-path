import { createClient } from "@supabase/supabase-js";

const supabaseUrl = https://tceoklufqnoxmcxjndiv.supabase.co;
const supabaseAnonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZW9rbHVmcW5veG1jeGpuZGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MTY5MTcsImV4cCI6MjA5Njk5MjkxN30.b0HwecxxwhCkDiC51VlsPrw1gkDuG4daPuawsMhx4_Y;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
