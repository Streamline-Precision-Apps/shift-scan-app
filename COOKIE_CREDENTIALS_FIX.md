# Cookie Issue Fix - Credentials Include

## The Problem

The cookie was being set on the **server** but the **browser wasn't receiving it** because:

```
❌ Server sets cookie in response header
❌ Browser doesn't see it because credentials weren't included
❌ Cookie never reaches the browser
```

## The Root Cause

The `fetch()` request was missing `credentials: "include"`, which tells the browser:
- "Send existing cookies with this request"
- "Accept and store cookies from the response"

## The Solution

### 1. **Added `credentials: "include"` to all API requests**

File: `/client/app/lib/utils/api-Utils.ts`

```typescript
const res = await fetch(url, {
  method,
  headers,
  body: fetchBody,
  credentials: "include", // ✅ CRITICAL: Allow cookies
});
```

**What this does:**
- Sends cookies with every request
- Allows browser to accept Set-Cookie headers from responses
- Works with `httpOnly: false` cookies (which are client-readable)

### 2. **Fixed server-side cookie options**

File: `/server/src/controllers/cookiesController.ts`

```typescript
const cookieOptions = {
  path: "/",
  httpOnly: false, // ✅ Must be false so JavaScript can read it
  maxAge: 60 * 60 * 24 * 365, // 1 year
  ...options,
};

res.cookie(name, value, cookieOptions);
```

**Key settings:**
- `httpOnly: false` - Allows client-side JavaScript to read the cookie
- `path: "/"` - Available to entire app
- `maxAge: ...` - Persists for 1 year

### 3. **Enhanced debugging**

Added better logging to show:
- What cookie options are being used
- That Set-Cookie header is being sent
- All cookies in browser for verification

---

## How It Works Now

```
User changes language to Spanish
  ↓
fetch("/api/cookies", {
  method: "POST",
  credentials: "include",  // ✅ NEW
  body: {name: "locale", value: "es", ...}
})
  ↓
Server receives request
res.cookie("locale", "es", {
  httpOnly: false,         // ✅ NEW
  path: "/",
  maxAge: 31536000
})
  ↓
Server response includes:
Set-Cookie: locale=es; Path=/; Max-Age=31536000
  ↓
Browser ACCEPTS the Set-Cookie header (because credentials: "include")
  ↓
Browser stores locale cookie
  ↓
document.cookie now includes: "locale=es"
  ↓
✅ Cookie persists across page reloads
✅ ClientIntlProvider can read it
✅ Language persists
```

---

## Testing Steps

1. **Open DevTools Console** (F12 → Console tab)
2. **Change language to Spanish**
3. **Look for logs:**
   ```
   🌍 Changing language to: es
   📝 Setting locale cookie to: es
   ✅ Cookie API call successful: {...}
   🔍 Locale cookie in browser: locale=es
   📋 All cookies: locale=es; (plus other cookies)
   ```

4. **Check DevTools → Application → Cookies → localhost:3001**
   - Should see `locale` cookie with value `es`

5. **Reload the page**
   - Language should stay as Spanish (not reset to English)
   - Cookie persisted! ✅

---

## If It Still Doesn't Work

Check these things:

1. **CORS/Credentials Issue:**
   - Your server should allow credentials
   - Make sure `credentials: "include"` is in the fetch

2. **Cookie SameSite Policy:**
   - Currently set to inherit from options
   - For localhost development: no restriction needed
   - For production: use `sameSite: "lax"`

3. **Browser Storage:**
   - DevTools → Application → Storage → Cookies
   - Make sure you're looking at `localhost:3001` not another domain

4. **Server Middleware:**
   - Cookie parser middleware should be initialized
   - Check that cookies are being parsed correctly

---

## Complete Cookie Flow Summary

| Step | Location | What Happens |
|------|----------|--------------|
| 1 | SettingSelections.tsx | User changes language |
| 2 | fetch() with credentials | Request sent with credentials: "include" |
| 3 | cookiesController.ts | Server sets cookie in response header |
| 4 | Browser | Set-Cookie header received (credentials allowed it) |
| 5 | document.cookie | Cookie stored in browser |
| 6 | ClientIntlProvider | Reads cookie on next render |
| 7 | next-intl | Loads translations for new locale |
| 8 | UI | Displays in correct language ✅ |

---

**Status:** 🟢 Ready to test - cookies should now persist!
