import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pexhurygyzhhcdyvhlxs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleGh1cnlneXpoaGNkeXZobHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDQ5NzYsImV4cCI6MjA4NjUyMDk3Nn0.5gAcp-xOxjk9xujdiS8pE0iWBok4yMXLbCkAU-T0NFY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const YAPA_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/yapa-query`;
