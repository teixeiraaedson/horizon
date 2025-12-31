# Welcome to your Dyad app

## Email (Resend) setup on Vercel

To enable real email verification and password reset:

1) Vercel Project → Settings → Environment Variables
Add these variables to BOTH Preview and Production:
- RESEND_API_KEY (Server)
- RESEND_FROM_EMAIL (Server) e.g. Horizon <no-reply@YOURDOMAIN.com>
- APP_BASE_URL (Server) e.g. https://your-vercel-app.vercel.app (for local dev you can set http://localhost:32110)
- AUTH_TOKEN_SECRET (Server) a random 32+ character secret string

After adding, Redeploy the project for changes to take effect.

If your domain isn't verified with Resend yet:
- You can use Resend's default testing sender (e.g., on @resend.dev) per their documentation.
- In testing mode, emails may include disclaimers; once you verify your own domain, use your production sender.

## API endpoints

Serverless Functions under `/api`:
- POST /api/auth/signup
- POST /api/auth/login
- GET  /api/auth/me
- POST /api/auth/request-verify-email
- GET  /api/auth/verify-email?token=...
- POST /api/auth/request-password-reset
- POST /api/auth/reset-password
- POST /api/auth/logout

Emails are sent via the `resend` package on the server. Tokens are signed with `AUTH_TOKEN_SECRET`, stored hashed in `public.auth_tokens`, and single-use.

## Frontend behavior

- /auth (login + sign up):
  - Sign up → POST /api/auth/signup → success shows "Check your email..." with "Resend verification email".
  - Login → POST /api/auth/login → if 403 EMAIL_NOT_VERIFIED: redirect to /verify and store email in localStorage["pendingEmail"].
  - "Forgot password?" → request reset via POST /api/auth/request-password-reset.

- /auth/verify:
  - Reads `?token=...`, calls GET /api/auth/verify-email, sets session, redirects to dashboard on success; otherwise shows error with "Go to Verify" and "Back to Login".

- /verify:
  - Instruction page; "Resend verification email" → POST /api/auth/request-verify-email { email }
  - "Back to login" → /auth

- /auth/reset-password:
  - Reads `?token=...`, enforces strong password rules, calls POST /api/auth/reset-password, redirects to /auth on success.

## Tests and CI

- Unit tests (Vitest) for token signing/verification, expiry, single-use behavior (logic), rate limiting, and password hashing.
- Integration-style tests mock Resend client logic (no real emails).
- CI runs `pnpm run test:coverage` and `pnpm run build`.

## Acceptance Checklist (Preview deployment)

1) Set env vars in Vercel (Preview + Production) exactly as listed.
2) Deploy (redeploy required after setting env vars).
3) Sign up → receive verification email → click link → verified → access dashboard.
4) Request password reset → receive email → reset password → login works.
5) Confirm `RESEND_API_KEY` is NOT present in client bundle (search built output).
6) Confirm endpoints return the same success message for unknown emails (no account enumeration).