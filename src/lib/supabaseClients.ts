// This file is responsible for creating and exporting the Supabase client instance that will be used throughout the application to interact with the Supabase backend. It uses environment variables to securely store the Supabase URL and anonymous key, which are necessary for authentication and communication with the Supabase services.
import { createClient } from "@supabase/supabase-js";

console.log("✅ supabaseClient.ts loaded");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error("Missing env");
}

export const supabase = createClient(url, anon);

console.log("✅ supabase created", !!supabase, "auth:", !!supabase.auth, "storage:", !!supabase.storage);


