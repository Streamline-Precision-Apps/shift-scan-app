"use client";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/lib/store/userStore";

/**
 * Signs the user out by clearing user state, removing relevant cookies, and redirecting to /signin.
 */
export function useSignOut() {
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser);

  return async function signOut() {
    // Clear user state
    clearUser();
    // Clear localStorage and sessionStorage
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (e) {
      // Ignore errors
    }
    // Remove session/auth cookies (if any)
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // Ignore errors, just ensure local state is cleared
    }
    // Redirect to sign-in page
    router.replace("/signin");
  };
}
