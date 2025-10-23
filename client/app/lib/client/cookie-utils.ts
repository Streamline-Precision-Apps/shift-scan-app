// client/app/lib/client/cookie-utils.ts
import { CapacitorCookies } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const COOKIE_KEY = "locale";

// Read cookies using CapacitorCookies when available, otherwise document.cookie
export async function readLocaleCookie(): Promise<string | null> {
  // 1) Try CapacitorCookies (native/webview) if available
  try {
    if (
      typeof CapacitorCookies !== "undefined" &&
      CapacitorCookies &&
      typeof CapacitorCookies.getCookies === "function" &&
      typeof window !== "undefined"
    ) {
      const url = window.location.origin;
      // Capacitor may return a map of cookies: Record<string, { value?: string }>
      const map = (await CapacitorCookies.getCookies({ url })) as
        | Record<string, { value?: string }>
        | null
        | undefined;
      if (map) {
        const entry = map[COOKIE_KEY];
        if (
          entry &&
          typeof entry.value === "string" &&
          entry.value.length > 0
        ) {
          return entry.value;
        }
      }
    }
  } catch (e) {
    // swallow and try other fallbacks
  }

  // 2) Fallback to document.cookie (web or patched webview)
  if (typeof document !== "undefined" && typeof document.cookie === "string") {
    const cookies = document.cookie.split("; ").map((c) => c.trim());
    const match = cookies.find((c) =>
      c.startsWith(`${encodeURIComponent(COOKIE_KEY)}=`)
    );
    if (match) {
      const parts = match.split("=");
      const raw = parts.slice(1).join("=") || "";
      if (raw.length > 0) return decodeURIComponent(raw);
    }
  }

  // 3) Fallback to Preferences (native)
  try {
    const stored = await Preferences.get({ key: COOKIE_KEY });
    if (stored && typeof stored.value === "string" && stored.value.length > 0) {
      return stored.value;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export async function setLocaleCookie(value: string) {
  const url =
    typeof window !== "undefined" ? window.location.origin : "http://localhost"; // pick sensible default
  try {
    if (CapacitorCookies && typeof CapacitorCookies.setCookie === "function") {
      // set native cookie (you can pass path/expires if needed)
      await CapacitorCookies.setCookie({ url, key: COOKIE_KEY, value });
    } else if (typeof document !== "undefined") {
      const expires = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toUTCString();
      document.cookie = `${encodeURIComponent(COOKIE_KEY)}=${encodeURIComponent(
        value
      )}; path=/; expires=${expires};`;
    }
  } catch (e) {
    // fallback: also persist to Preferences so native fallback works
  }
  // also persist in Preferences as a fallback
  try {
    await Preferences.set({ key: COOKIE_KEY, value });
  } catch (e) {
    // ignore
  }
}

export async function deleteLocaleCookie() {
  const url =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  try {
    if (
      CapacitorCookies &&
      typeof CapacitorCookies.deleteCookie === "function"
    ) {
      await CapacitorCookies.deleteCookie({ url, key: COOKIE_KEY });
    } else if (typeof document !== "undefined") {
      document.cookie = `${encodeURIComponent(
        COOKIE_KEY
      )}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    }
  } catch (e) {}
  try {
    await Preferences.remove({ key: COOKIE_KEY } as any);
  } catch {}
}
