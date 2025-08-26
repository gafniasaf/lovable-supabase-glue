"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

let browserClient: any | null = null;

export function getSupabaseBrowser() {
	if (browserClient) return browserClient;
	try {
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
		const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
		browserClient = createClientComponentClient({ supabaseUrl: url, supabaseKey: anon });
		return browserClient;
	} catch {
		// Last resort (dev): create with default env resolution
		browserClient = createClientComponentClient();
		return browserClient;
	}
}


