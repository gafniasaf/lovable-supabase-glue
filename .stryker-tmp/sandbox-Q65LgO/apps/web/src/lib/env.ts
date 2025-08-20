/**
 * Environment configuration for Supabase access.
 *
 * Reads from public NEXT envs when present; falls back to defaults for
 * local development and automated tests.
 */
// @ts-nocheck

import { loadServerEnv } from "@education/shared";

export const env = loadServerEnv();


