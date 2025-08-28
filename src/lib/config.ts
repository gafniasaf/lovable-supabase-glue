
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://ukeqjiattiaokdqjqncf.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZXFqaWF0dGlhb2tkcWpxbmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTI3NzIsImV4cCI6MjA3MDY2ODc3Mn0.sYYDUgwCt4X4k9ME6a_G2R3BA6GftI3WAcWVqBv2h2E',
  baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:8080',
  isTestMode: import.meta.env.MODE === 'test',
  environment: import.meta.env.MODE || 'development'
};
