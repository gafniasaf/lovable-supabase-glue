"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function getSupabaseBrowser() {
	return createClientComponentClient();
}


