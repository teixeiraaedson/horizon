# Welcome to your Dyad app

## Auth Setup (Supabase Email Verification)

To enable real email verification with Supabase:

1) Supabase Dashboard → Auth
- Enable "Confirm email".
- Configure SMTP with a real provider (Resend, SendGrid, etc.). Test sending to ensure delivery works.
- Set Site URL to your production URL.
- Add Redirect URLs:
  - http://localhost:32110/**
  - https://YOUR_PRODUCTION_DOMAIN/**

2) Application URLs
- The verification email should redirect to: /auth/callback
- Ensure your provider templates include the confirmation link that Supabase generates.

3) Behavior
- Sign up: the app calls `supabase.auth.signUp({ email, password })` and then navigates to /verify.
- /verify page:
  - "Resend verification email" calls `supabase.auth.resend({ type: "signup", email })`.
  - "Refresh status" calls `supabase.auth.getUser()` and checks `email_confirmed_at`.
  - "Sign out" calls `supabase.auth.signOut()`.
- Callback: `/auth/callback` exchanges the code for a session via `supabase.auth.exchangeCodeForSession(window.location.href)` and redirects:
  - Verified → /dashboard
  - Not verified → /verify

4) Route Guards
- Not logged in → /auth
- Logged in but NOT verified → /verify
- Logged in and verified → app routes

## Verification Checklist

1) Code Search Confirmation
- There is no fake verification string in the repo:
  - "I verified" button removed from /verify
  - Mock verification actions are not used by route guards (they rely only on Supabase `email_confirmed_at`)

2) Manual Test
- Sign up with a real email.
- Confirm you receive a Supabase verification email.
- Click the link → you land at `/auth/callback`.
- The app exchanges code for session (see browser console logs) and redirects:
  - Before clicking the link, visiting `/dashboard` should redirect to `/verify`.
  - After confirming, visiting `/dashboard` grants access.

3) Console/Network Proof
- Browser console will show `[auth.exchangeCodeForSession] result: ...` and `[auth:onAuthStateChange] ...`.
- Network tab will display the `exchange` request to Supabase auth.

4) Verified Status Source
- Verified status is determined only by `user.email_confirmed_at` from Supabase.