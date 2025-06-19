import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase is not properly configured. Please update your .env file with actual Supabase project credentials.');
  console.error('You can find these values in your Supabase project dashboard under Settings > API');
  throw new Error('Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not configured. Please update your .env file with valid Supabase credentials.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;