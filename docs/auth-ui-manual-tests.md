# Auth UI Manual Tests

This runbook verifies real signup, login, email verification, and password reset using custom API endpoints.

## 1) Sign up → verify → dashboard

- Visit `/auth`.
- Switch to “Sign up”, enter a real email and a strong password (12+ chars, upper, lower, number, special).
- Submit → you should see “Check your email to verify your account.” and a “Resend verification email” button.
- Open the verification email and click the link (it should route to `/auth/verify?token=...`).
- The app calls `GET /api/auth/verify-email?token=...` and redirects to `/dashboard`.

## 2) Login before verification → redirected to /verify

- Visit `/auth` and log in with your email and password before clicking the email link.
- The app calls `POST /api/auth/login` and gets `403 EMAIL_NOT_VERIFIED`.
- You are redirected to `/verify` and the page shows your pending email (stored only as `localStorage["pendingEmail"]`).
- Use “Resend verification email” if needed.

## 3) Password reset email → open link → set new password → login works

- From `/auth`, go to “Forgot password?” (link to `/auth/reset-password` should be present).
- Trigger a password reset (via your backend’s flow) and open the email link (`/auth/reset-password?token=...`).
- Enter a strong new password and confirm it.
- Submit → app calls `POST /api/auth/reset-password { token, newPassword }`.
- You are redirected to `/auth?reset=1`.
- Log in with the new password at `/auth` → should succeed and route to `/dashboard`.

## Notes

- No mock buttons or simulated flows exist.
- Copy is vendor-agnostic.
- Allowlist routes: `/auth`, `/auth/*`, and `/verify` are always accessible.