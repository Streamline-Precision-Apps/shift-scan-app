# Language Settings Update - Complete Flow

## What Was Updated

### 1. SessionContext (`/client/app/lib/context/sessionContext.tsx`)
**Added:**
- `updateLocale(newLocale: string)` function to the context
- Cookie change listener to auto-detect locale changes
- Custom hook `useSession()` for easy access to context

**Flow:**
```typescript
type SessionContextType = {
  user: JwtUserPayload | null;
  locale: string;
  updateLocale: (newLocale: string) => void;  // ← NEW
};
```

### 2. SettingSelections Component (`/client/app/v1/(routes)/hamburger/profile/SettingSelections.tsx`)
**Updated language selector onChange handler:**

When user changes language, it now:
1. ✅ Updates database (via `handleLanguageChange`)
2. ✅ Updates cookies (via `setLocale`)
3. ✅ Updates session context (via `updateLocale`)
4. ✅ Updates local UI state (via `setLanguage`)

---

## Complete Flow When Language Is Changed

```
User selects "Español" in dropdown
    ↓
1. handleLanguageChange("language", "es")
   → Triggers state update
   → Auto-saves to database via useEffect
    ↓
2. setLocale(true) 
   → Calls API to set locale cookie
   → Cookie now stores "es"
    ↓
3. updateLocale("es")
   → Updates SessionContext.locale to "es"
   → All components using useSession() now see locale="es"
    ↓
4. setLanguage("es")
   → Updates local component state
   → UI reflects the change immediately
    ↓
✅ Language synced across: DB + Cookies + Session + UI
```

---

## Usage in Components

To use the session context in any component:

```typescript
import { useSession } from "@/app/lib/context/sessionContext";

function MyComponent() {
  const { user, locale, updateLocale } = useSession();
  
  // Access locale
  console.log(locale); // "es" or "en"
  
  // Update locale
  updateLocale("es");
}
```

---

## What Gets Persisted

| Location | What | How |
|----------|------|-----|
| **Database** | UserSettings.language | Auto-save effect in accountSettings.tsx |
| **Cookies** | locale cookie | `setLocale()` API call |
| **Session** | SessionContext.locale | `updateLocale()` function |
| **UI** | Component state | Direct state update |

---

## Testing Checklist

- [ ] Change language to Spanish → Check database saved
- [ ] Change language → Check locale cookie updated
- [ ] Change language → Check useSession() hook sees new locale
- [ ] Navigate between pages → Language persists
- [ ] Refresh page → Language loads from cookie

---

**Status:** ✅ Ready to use
