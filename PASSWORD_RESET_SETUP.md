# Password Reset Flow - Express Backend Migration

## Overview
Successfully converted the password reset flow from Next.js serverless functions to Express.js backend with proper API endpoints.

## Architecture

### Backend Routes (Express)
Located in: `server/src/routes/tokenRoutes.ts`

#### Endpoints

1. **POST `/api/tokens/password-reset`**
   - Request a password reset email
   - Body: `{ email: string }`
   - Response: `{ success: true, message: string }` or `{ error: string }`
   - Creates a password reset token (valid for 24 hours)
   - Sends email with reset link

2. **POST `/api/tokens/reset-password`**
   - Reset password using a valid token
   - Body: `{ token: string, password: string }`
   - Response: `{ success: true, message: string }` or `{ error: string }`
   - Updates user password in database
   - Deletes used token
   - ⚠️ **TODO**: Hash password before storing (currently stores plaintext)

3. **GET `/api/tokens/verify-reset-token/:token`**
   - Verify if a reset token is valid and not expired
   - Response: `{ valid: true, email: string }` or `{ valid: false, error: string }`
   - Used before allowing user to reset password

### Backend Files Created/Modified

#### New Files
- `server/src/lib/mail.ts` - Email sending with Resend

#### Modified Files
- `server/src/controllers/tokenController.ts` - Added password reset functions
- `server/src/routes/tokenRoutes.ts` - Added password reset routes

### Frontend Changes

#### Client-Side API Layer
File: `client/app/lib/actions/reset.ts`

Functions (all use Express endpoints):
- `Reset(formData)` - Request password reset email
- `resetUserPassword(token, newPassword)` - Reset password with token
- `verifyPasswordResetToken(token)` - Verify token validity
- `PasswordResetToken(token)` - Wrapper for backward compatibility

#### UI Components Updated
File: `client/app/v1/(routes)/signin/new-password/changePassword.tsx`

Changes:
- Removed Next.js serverless calls
- Added token verification on component mount
- Added loading states
- Removed bcryptjs (hashing done on server now)
- Improved error handling with colored banners
- Added proper TypeScript types

## Security Features

✅ **Implemented:**
- Token expiration (24 hours)
- Single-use tokens (deleted after use)
- Email verification (only if account exists)
- No email enumeration (safe response even if email not found)
- Token validation before password reset

⚠️ **TODO:**
- Hash password before storing (line in tokenController.ts marked with TODO)
- Consider adding rate limiting to prevent abuse
- Add CSRF protection if needed

## Email Configuration

Uses Resend email service with:
- Environment variable: `AUTH_RESEND_KEY`
- From address: `no-reply@shiftscanapp.com`
- Template: HTML with styled reset button
- Reset link format:
  - Production: `https://shiftscanapp.com/signin/new-password?token={token}`
  - Development: `http://localhost:3000/signin/new-password?token={token}`

## Database Requirements

Must have `passwordResetToken` table in Prisma schema with:
```prisma
model PasswordResetToken {
  id         String   @id @default(cuid())
  email      String
  token      String   @unique
  expiration DateTime
  createdAt  DateTime @default(now())
}
```

## Testing Flow

1. **Request Reset:**
   ```
   POST /api/tokens/password-reset
   { "email": "user@example.com" }
   ```

2. **Check Email:** User receives reset link with token

3. **Verify Token:**
   ```
   GET /api/tokens/verify-reset-token/{token}
   ```

4. **Reset Password:**
   ```
   POST /api/tokens/reset-password
   { "token": "{token}", "password": "newPassword123!" }
   ```

5. **Redirect:** User redirected to `/signin` to log in with new password

## Dependencies

Required npm packages:
- `resend` - Email service
- `uuid` (v4) - Token generation
- Express is already installed

## Next Steps

1. ✅ Install Resend if not already installed
2. ✅ Set `AUTH_RESEND_KEY` environment variable
3. **CRITICAL:** Implement password hashing in tokenController.ts line ~105
4. Test forgot password flow end-to-end
5. Consider adding rate limiting middleware
6. Add monitoring/logging for password reset attempts

## Environment Variables

```
AUTH_RESEND_KEY=your_resend_api_key
NODE_ENV=development or production
NEXT_PUBLIC_API_URL=http://localhost:3001 (dev) or https://api.domain.com (prod)
```

## Logging

Comprehensive logging added to all endpoints:
- 🔍 Verification steps
- 📧 Email sending
- ✅ Success operations
- ❌ Error conditions
- 🗑️  Token cleanup

Check server logs for debugging.
