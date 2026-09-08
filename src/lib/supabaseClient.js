import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// `null` (not a thrown error) when env vars aren't set yet, so the app can still run
// against localStorage-only mode during local development before Supabase is wired up.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isCloudEnabled = Boolean(supabase);
