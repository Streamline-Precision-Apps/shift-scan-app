import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, JwtUserPayload } from "../sessionChecker";

// Helper to get locale from cookie
function getLocaleFromCookie(name = "locale") {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "en";
}

type SessionContextType = {
  user: JwtUserPayload | null;
  locale: string;
  updateLocale: (newLocale: string) => void;
};

const SessionContext = createContext<SessionContextType>({
  user: null,
  locale: "en",
  updateLocale: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtUserPayload | null>(null);
  const [locale, setLocale] = useState<string>("en");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const localeValue = getLocaleFromCookie();
    setLocale(localeValue);

    if (token) {
      setUser(getSession(token));
    } else {
      router.replace("/signin");
    }
  }, [router]);

  // Watch for cookie changes and update locale
  useEffect(() => {
    const handleCookieChange = () => {
      const newLocale = getLocaleFromCookie();
      setLocale(newLocale);
    };

    // Listen for storage events (when cookies are updated via API)
    window.addEventListener("storage", handleCookieChange);

    return () => {
      window.removeEventListener("storage", handleCookieChange);
    };
  }, []);

  const updateLocale = (newLocale: string) => {
    if (newLocale === "en" || newLocale === "es") {
      setLocale(newLocale);
    }
  };

  return (
    <SessionContext.Provider value={{ user, locale, updateLocale }}>
      {children}
    </SessionContext.Provider>
  );
}

// Custom hook to use session context
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
