
// Configuration for the application
export const config = {
  supabaseUrl: 'https://ukeqjiattiaokdqjqncf.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZXFqaWF0dGlhb2tkcWpxbmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTI3NzIsImV4cCI6MjA3MDY2ODc3Mn0.sYYDUgwCt4X4k9ME6a_G2R3BA6GftI3WAcWVqBv2h2E',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
  isTestMode: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV || 'development'
};
