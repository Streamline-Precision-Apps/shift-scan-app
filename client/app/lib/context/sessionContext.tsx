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
};

const SessionContext = createContext<SessionContextType>({
  user: null,
  locale: "en",
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

  return (
    <SessionContext.Provider value={{ user, locale }}>
      {children}
    </SessionContext.Provider>
  );
}
