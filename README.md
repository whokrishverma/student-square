
# students^2

University-only social app with OTP authentication.

## Running the app

1. Install dependencies:

   ```bash
   npm i
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start frontend + API server:

   ```bash
   npm run dev
   ```

## Authentication rules

- Only `@bennett.edu.in` emails are allowed.
- OTP is required for both signup and signin.
- If SMTP env vars are not configured, OTPs are printed in API terminal logs (dev mode).

## Database

- SQLite file: `server/data/studentsquare.db`
- Stores:
  - `users` table (email, username, full name, university, timestamps)
  - `otp_codes` table (hashed OTP, mode, expiry, usage status)
  