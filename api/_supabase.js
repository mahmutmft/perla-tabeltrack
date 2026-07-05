import { PostgrestClient } from '@supabase/postgrest-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

// Talk to Supabase's PostgREST API directly instead of pulling in the full
// @supabase/supabase-js package, which also bundles the realtime/auth/storage
// clients we never use. Those add several MB to the serverless function and
// were making cold starts painfully slow on Vercel.
export const supabase = new PostgrestClient(`${url}/rest/v1`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
});

export function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}
