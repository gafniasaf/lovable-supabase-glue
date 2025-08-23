"use client";
import { createClient } from "@supabase/supabase-js";

export function getSupabaseBrowser() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
	if (url && anon) {
		return createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
	}
	// Fallback to helper default if envs not present (dev)
	const { createClientComponentClient } = require("@supabase/auth-helpers-nextjs");
	return createClientComponentClient();
}


