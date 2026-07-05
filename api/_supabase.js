import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}
