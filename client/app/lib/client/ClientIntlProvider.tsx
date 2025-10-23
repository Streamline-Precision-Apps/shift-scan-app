"use client";

import React, { useEffect, useState } from "react";
import { IntlProvider } from "next-intl";
import { Device } from "@capacitor/device";
import { loadMessages, defaultLocale, type Locale } from "./i18n-client";
import defaultMessages from "../messages/en.json";
import { readLocaleCookie, setLocaleCookie } from "./cookie-utils";

export async function persistLocale(value: Locale) {
  try {
    await setLocaleCookie(value);
  } catch (e) {
    console.error("persistLocale failed", e);
  }
  if (typeof window !== "undefined") window.location.reload();
}

export default function ClientIntlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<any>(defaultMessages);

  useEffect(() => {
    let mounted = true;

    async function initLocale() {
      try {
        // 1) Try reading cookie / preferences (cookie-utils handles both)
        const persisted = await readLocaleCookie();
        let detected: string | null = persisted ?? null;

        // 2) Capacitor Device API if nothing persisted
        if (!detected) {
          try {
            // Device.getLanguageCode() may return an object with a `value` field
            const deviceLang = await Device.getLanguageCode();
            if (deviceLang && (deviceLang as any).value) {
              detected = (deviceLang as any).value as string;
            }
          } catch (e) {
            // ignore device errors
          }
        }

        // 3) Browser navigator fallback
        if (!detected && typeof navigator !== "undefined") {
          detected =
            navigator.language ||
            (navigator.languages && navigator.languages[0]) ||
            null;
        }

        const finalLocale = (
          detected ? detected.split("-")[0] : defaultLocale
        ) as Locale;

        if (!mounted) return;

        setLocale(finalLocale);

        // Load messages only if not the default (we already have defaultMessages)
        if (finalLocale && finalLocale !== defaultLocale) {
          try {
            const msgs = await loadMessages(finalLocale);
            if (mounted && msgs) setMessages(msgs);
          } catch (err) {
            console.error("Failed loading messages for", finalLocale, err);
          }
        } else {
          setMessages(defaultMessages);
        }
      } catch (err) {
        console.error("initLocale error", err);
      }
    }

    initLocale();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <IntlProvider
      locale={locale ?? defaultLocale}
      messages={messages}
      // Provide a stable default timezone to avoid environment fallback errors
      // and potential hydration/markup mismatches between server and client.
      timeZone="UTC"
    >
      {children}
    </IntlProvider>
  );
}
