
export const config = {
  // For Vite projects, set these in your .env as:
  // VITE_SUPABASE_URL=...
  // VITE_SUPABASE_ANON_KEY=...
  supabaseUrl: import.meta.env?.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || "",
  baseUrl: ""
};
