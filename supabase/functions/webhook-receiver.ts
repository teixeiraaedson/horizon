import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!

function hmacSHA256(message: string, secret: string) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(message)
  return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(key => crypto.subtle.sign('HMAC', key, msgData))
    .then(sig => {
      const bytes = new Uint8Array(sig)
      // hex
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    })
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(hashBuffer)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const signatureHeader = req.headers.get('x-signature') || ''
  const rawBody = await req.text()

  try {
    const expectedSig = await hmacSHA256(rawBody, WEBHOOK_SECRET)
    if (!signatureHeader || signatureHeader !== expectedSig) {
      return new Response(JSON.stringify({ error: { code: 'WEBHOOK_SIGNATURE_INVALID', message: 'Invalid signature' } }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const payload = JSON.parse(rawBody)
    const eventType = payload.event_type as string
    const txId = payload.data?.transaction_id as string | undefined
    const payloadHash = await sha256Hex(rawBody)

    // Idempotent upsert by (provider, payload_hash)
    const { data: existing, error: fetchErr } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('provider', 'issuer-sim')
      .eq('payload_hash', payloadHash)
      .limit(1)
      .maybeSingle()

    if (fetchErr) {
      return new Response(JSON.stringify({ error: { code: 'INTERNAL', message: fetchErr.message } }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (existing) {
      // Already processed: return deduped
      return new Response(JSON.stringify({ status: 'deduped', id: existing.id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const insertPayload = {
      provider: 'issuer-sim',
      event_type: eventType,
      status: 'ingested',
      payload,
      payload_hash: payloadHash,
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('webhook_events')
      .insert(insertPayload)
      .select('*')
      .single()

    if (insertErr) {
      return new Response(JSON.stringify({ error: { code: 'INTERNAL', message: insertErr.message } }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update transaction status deterministically
    if (txId) {
      let newStatus: 'COMPLETED' | 'FAILED' | null = null
      if (eventType === 'settlement.completed' || eventType === 'transfer.completed' || eventType === 'withdraw.completed') {
        newStatus = 'COMPLETED'
      } else if (eventType === 'settlement.failed' || eventType === 'transfer.failed' || eventType === 'withdraw.failed') {
        newStatus = 'FAILED'
      }

      if (newStatus) {
        const { error: updateErr } = await supabase
          .from('transactions')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', txId)

        if (updateErr) {
          return new Response(JSON.stringify({ error: { code: 'INTERNAL', message: updateErr.message } }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Insert an audit event
        await supabase.from('audit_events').insert({
          actor_id: null,
          actor_email: null,
          action: 'WEBHOOK_INGESTED',
          resource: 'webhook_event',
          resource_id: inserted.id,
          policy_version: null,
          reason_codes: [],
          payload: { event_type: eventType, transaction_id: txId, payload_hash: payloadHash },
          created_at: new Date().toISOString()
        })
      }
    }

    return new Response(JSON.stringify({ status: 'ingested', id: inserted.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL', message: (err as Error).message } }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})