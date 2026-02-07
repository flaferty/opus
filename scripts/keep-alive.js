#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function keepAlive() {
  try {
    console.log(`[${new Date().toISOString()}] Pinging Supabase...`);
    
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error pinging Supabase:', error.message);
      process.exit(1);
    }

    console.log(`[${new Date().toISOString()}] Supabase is active. Query successful.`);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err.message);
    process.exit(1);
  }
}

keepAlive();
