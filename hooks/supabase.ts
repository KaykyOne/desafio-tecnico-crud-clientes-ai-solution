"use client";

//* Libraries Imports
import { createClient } from "@supabase/supabase-js";

//* Utils Imports
import env from "@/lib/env";

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
