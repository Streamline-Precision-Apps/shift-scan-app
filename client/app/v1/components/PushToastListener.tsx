"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * PushToastListener
 * - Listens for postMessage events from the service worker (PUSH_TOPIC / PUSH_DATA / NOTIFICATION_CLICK)
 * - Uses sonner's toast(...) to show in-app toasts
 * - Handles navigation to relevant URLs when notifications are clicked
 *
 * Usage: render <PushToastListener /> near the app root (e.g. in your layout or a top-level provider).
 * Make sure <Toaster /> (your Sonner Toaster) is also rendered in the app.
 */

export default function PushToastListener() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (e: MessageEvent) => {
      const msg = e.data;
      if (!msg) return;

      // Handle push notifications (PUSH_TOPIC or PUSH_DATA)
      if (msg.type === "PUSH_TOPIC" || msg.type === "PUSH_DATA") {
        const p = msg.payload || {};
        const title = p.title || "Notification";
        const body = p.body || "";
        // Check for URL in different possible locations
        const url =
          p.url || p.data?.url || (p.metadata ? p.metadata.url : undefined);

        // Show Sonner toast with action if URL is available
        toast(title, {
          description: body,
          duration: 7000,
          action: url
            ? {
                label: "View",
                onClick: () => {
                  // Navigate within the PWA
                  window.location.href = url;
                },
              }
            : undefined,
        });
      }

      // Handle notification clicks from the service worker
      else if (msg.type === "NOTIFICATION_CLICK" && msg.data?.url) {
        // Navigate to the URL when a notification is clicked
        window.location.href = msg.data.url;
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);
    return () =>
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
