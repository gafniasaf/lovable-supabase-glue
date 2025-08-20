import { createClient } from "@supabase/supabase-js";

// Prefer public NEXT_ vars so this works in the browser; fall back to safe dev defaults
const PUBLIC_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) || 'http://localhost:54321';
const PUBLIC_ANON = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) || 'test-anon-key-1234567890';

export const supabase = createClient(PUBLIC_URL, PUBLIC_ANON);


