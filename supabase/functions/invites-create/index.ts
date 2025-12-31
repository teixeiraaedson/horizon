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

  // Admin check (simple bearer token for sandbox)
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader) {
    return new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Admin authorization required' } }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { email, role = 'user', created_by } = await req.json()
  if (!email) {
    return new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'email is required' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const token = crypto.randomUUID()
  const token_hash = await sha256Hex(token)
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('invites')
    .insert({ email, role, token_hash, expires_at, created_by })

  if (error) {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL', message: error.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const inviteLink = `/invite?token=${token}&email=${encodeURIComponent(email)}`
  return new Response(JSON.stringify({ inviteLink, expires_at }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})