# Frontend Fix: Token Authentication Issue

## Problem Identified

The error `401 Unauthorized` occurred because:

1. ✅ The `apiRequest` function WAS sending the token in the Authorization header
2. ✅ The `verifyToken` middleware WAS correctly validating the token
3. ❌ **BUT** the controller was looking for `userId` when the middleware sets `req.user.id`

### Root Cause

The JWT payload has structure:

```typescript
interface JwtUserPayload {
  id: string; // ← This is what the middleware provides
}
```

But the controller was trying to access:

```typescript
const authenticatedUserId = (req as any).userId; // ← Wrong! Returns undefined
```

## Solution Applied

Fixed `/Users/devunfox/shift-scan-app/server/src/controllers/userController.ts`:

**Changed from:**

```typescript
const authenticatedUserId = (req as any).userId;
```

**Changed to:**

```typescript
const authenticatedUserId = (req as any).user?.id;
```

## Next Steps

1. **Rebuild the server:**

   ```bash
   cd /Users/devunfox/shift-scan-app/server
   npm run build
   ```

2. **Restart your server** with the compiled changes

3. **Test the toggle again** - The settings should now update successfully

## How It Works Now

1. User toggles "General Reminders" → UI updates immediately
2. `useEffect` detects change → calls `updateSettings()`
3. `apiRequest` sends token in header: `Authorization: Bearer <token>`
4. Server's `verifyToken` middleware validates token → sets `req.user`
5. Controller extracts `req.user.id` → verifies it matches request userId
6. Authorization passes ✅ → Settings saved to database ✅
7. Response sent back to client

## Logging Added

Debug logs added to help verify:

- ✅ Authenticated user ID received
- ✅ Request body contents
- ✅ Authorization checks passing/failing

You'll see console output like:

```
🔍 updateSettings called - authenticatedUserId: user-123
📝 Request body: { userId: "user-123", generalReminders: false, ... }
```

---

**Status:** 🟢 Ready to test
