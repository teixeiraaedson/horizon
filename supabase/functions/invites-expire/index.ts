import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader) {
    return new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Admin authorization required' } }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  const { invite_id } = await req.json()
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { error } = await supabase.from('invites').update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq('id', invite_id)
  if (error) {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL', message: error.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})