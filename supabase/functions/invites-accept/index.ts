import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { token, email } = await req.json()
  if (!token || !email) {
    return new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'token and email required' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  const token_hash = await sha256Hex(token)

  const { data: invites, error: selErr } = await supabase
    .from('invites')
    .select('*')
    .eq('email', email)
    .eq('token_hash', token_hash)
    .limit(1)

  if (selErr) {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL', message: selErr.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  const invite = invites?.[0]
  if (!invite) {
    return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Invalid invite' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  if (invite.used_at) {
    return new Response(JSON.stringify({ error: { code: 'CONFLICT', message: 'Invite already used' } }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return new Response(JSON.stringify({ error: { code: 'EXPIRED', message: 'Invite expired' } }), { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const { error: updErr } = await supabase
    .from('invites')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invite.id)

  if (updErr) {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL', message: updErr.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  return new Response(JSON.stringify({ ok: true, role: invite.role }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})