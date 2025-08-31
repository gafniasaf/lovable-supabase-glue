// Supabase browser client (safe for SSR/build without env)
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

let client: any = null;

// Only create a real client if both env vars are present and we're in the browser
if (url && anonKey && typeof window !== 'undefined') {
	client = createClient(url, anonKey);
}

// Fallback no-op client to avoid build/prerender errors when env is absent
if (!client) {
	client = {
		from: (_table: string) => ({
			select: (_columns: string) => ({
				limit: async (_n: number) => ({ data: [], error: null }),
			}),
		}),
	};
}

export const supabase = client;


