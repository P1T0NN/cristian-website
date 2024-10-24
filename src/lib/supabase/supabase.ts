// LIBRARIES
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl! || "https://zhrwrwxsvwyrxqzqcmmf.supabase.co", supabaseKey! || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpocndyd3hzdnd5cnhxenFjbW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzNTA1ODAsImV4cCI6MjA0NDkyNjU4MH0.xJIg3MnNY9WOO3yI7jJwfialFJ67u3obmUTXaZjp2aM")