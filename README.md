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

## Password Recovery (Supabase Auth)

Enable real password reset emails and configure redirects:

1) Supabase Dashboard → Auth → Email
- Configure SMTP with a real provider (Resend, SendGrid, etc.).
- Add Redirect URLs:
  - http://localhost:32110/reset-password
  - https://YOUR_PRODUCTION_DOMAIN/reset-password

2) App behavior and methods
- /forgot-password (file: `src/pages/ForgotPassword.tsx`)
  - Calls: `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" })`.
  - Shows: "Check your email for a password reset link."
- /reset-password (file: `src/pages/ResetPassword.tsx`)
  - On load: `supabase.auth.exchangeCodeForSession(window.location.href)`.
    - If it fails, shows "Reset link invalid or expired" and lets user request a new link.
  - Form validates strong password (min 12, 1 upper, 1 lower, 1 number, 1 special).
  - Submit: `supabase.auth.updateUser({ password: newPassword })`.
  - On success: shows success message and redirects to `/dashboard`.

3) End-to-end test guide
- Create account, sign out.
- Visit `/forgot-password`, request reset for your email.
- Receive Supabase email, click link → lands at `/reset-password`.
- Set a strong new password; you'll be redirected to `/dashboard`.
- Sign out, then log in with the new password via `/auth` (should succeed).

4) No mocks
- The reset flow uses only Supabase Auth methods.
- Any simulated or dev-only reset UI has been removed.

## Verification Checklist

1) Code Search Confirmation
- No fake reset strings in the repo:
  - "simulated reset", "dev reset", "mock reset" are not present.

2) Manual Test (Recovery)
- Create account → logout → forgot password → receive real email → click link → set new password → logout → login with the new password.

3) Methods & Locations
- `resetPasswordForEmail`: `src/pages/ForgotPassword.tsx`
- `exchangeCodeForSession`: `src/pages/ResetPassword.tsx`
- `updateUser({ password })`: `src/pages/ResetPassword.tsx`

4) Strong Password Validation
- Weak passwords fail client-side validation and the Reset button is disabled until rules are met.