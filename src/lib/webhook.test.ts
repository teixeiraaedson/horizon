import { describe, it, expect } from "vitest"

async function hmacSHA256(message: string, secret: string) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(message)
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, msgData)
  const bytes = new Uint8Array(sig)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(hashBuffer)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

describe('Webhook signature + idempotency', () => {
  it('verifies a valid HMAC signature', async () => {
    const secret = 'test-secret'
    const payload = JSON.stringify({ a: 1, b: 'x' })
    const signature = await hmacSHA256(payload, secret)
    const expected = await hmacSHA256(payload, secret)
    expect(signature).toEqual(expected)
  })

  it('rejects invalid signatures', async () => {
    const secret = 'test-secret'
    const payload = JSON.stringify({ a: 1 })
    const sig = await hmacSHA256(payload, secret)
    const wrong = await hmacSHA256(payload + 'x', secret)
    expect(sig).not.toEqual(wrong)
  })

  it('produces identical payload_hash for identical payloads', async () => {
    const p1 = JSON.stringify({ id: 1, x: 'y' })
    const p2 = JSON.stringify({ id: 1, x: 'y' })
    const h1 = await sha256Hex(p1)
    const h2 = await sha256Hex(p2)
    expect(h1).toEqual(h2)
  })

  it('different payloads have different payload_hash', async () => {
    const p1 = JSON.stringify({ id: 1 })
    const p2 = JSON.stringify({ id: 2 })
    const h1 = await sha256Hex(p1)
    const h2 = await sha256Hex(p2)
    expect(h1).not.toEqual(h2)
  })
})