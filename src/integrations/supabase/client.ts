// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mlqrkaiwjmjikyccoczh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scXJrYWl3am1qaWt5Y2NvY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDkxNDIsImV4cCI6MjA1OTc4NTE0Mn0.0xQAvj_uPjTigtmqDDCOUOZ06kx4-CEhlr_2s_GROd8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);