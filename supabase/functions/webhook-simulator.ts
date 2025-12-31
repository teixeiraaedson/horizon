import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROJECT_ID = "vbofqbuztblknzialrdp"
const RECEIVER_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/webhook-receiver`
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!

function hmacSHA256(message: string, secret: string) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(message)
  return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(key => crypto.subtle.sign('HMAC', key, msgData))
    .then(sig => {
      const bytes = new Uint8Array(sig)
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  // Admin-only check: require Authorization header present
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader) {
    return new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Admin authorization required' } }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { transaction_id, event_type } = await req.json() as { transaction_id: string; event_type: string }
  if (!transaction_id || !event_type) {
    return new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'transaction_id and event_type are required' } }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const payload = {
    id: crypto.randomUUID(),
    event_type,
    data: { transaction_id },
    issued_at: new Date().toISOString(),
    provider: "issuer-sim",
  }
  const raw = JSON.stringify(payload)
  const signature = await hmacSHA256(raw, WEBHOOK_SECRET)

  const res = await fetch(RECEIVER_URL, {
    method: 'POST',
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'x-signature': signature,
    },
    body: raw,
  })

  const body = await res.text()
  return new Response(body, {
    status: res.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})