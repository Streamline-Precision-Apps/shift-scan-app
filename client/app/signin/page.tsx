"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOff } from "lucide-react";
import { isMobileOrTablet } from "../lib/utils/isMobileOrTablet";
import { useTranslations } from "next-intl";
import { useUserStore } from "../lib/store/userStore";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("signIn");

  // helper: returns true for phone/tablet devices

  const redirectAfterAuth = () => {
    const target = isMobileOrTablet() ? "/v1" : "/dashboard";
    router.push(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      // POST /auth/signin (assumption). Adjust path if your server uses a different route.
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          (data && (data.error || data.message)) ||
            res.statusText ||
            "Sign in failed"
        );
      } else if (data && data.error) {
        setError(data.error || "Sign in failed");
      } else {
        // If server returns a token and you prefer storing it on client
        // you can do: if (data?.token) localStorage.setItem('token', data.token)
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.user.id);

        const url = process.env.NEXT_PUBLIC_API_URL || `http://localhost:3001`;
        const response = await fetch(`${url}/api/v1/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            token: data.token,
            userId: data.user.user.id,
          }),
        });
        const dataJson = await response.json();
        if (dataJson.user) {
          useUserStore.getState().setUser(dataJson.user);
        }

        redirectAfterAuth();
      }
    } catch (err) {
      // Network or unexpected errors
      console.error("auth error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen max-h-screen overflow-hidden bg-app-gradient bg-to-br from-app-dark-blue via-app-blue to-app-blue px-4 py-0 flex flex-col items-center justify-center">
      {/* Animated Gradient Background Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-app-dark-blue via-app-blue to-app-blue animate-gradient-move opacity-80" />
        <div className="absolute left-1/2 top-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-app-blue opacity-20 rounded-full blur-3xl" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-app-blue opacity-10 rounded-full blur-2xl" />
      </div>

      {/* Sign In Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <img
              src="/windows11/StoreLogo.scale-400.png"
              alt="Shift Scan Logo"
              className="h-16 w-auto mx-auto mb-4 rounded-lg"
            />
            <h1 className="text-2xl font-bold text-app-dark-blue mb-2">
              {t("title")}
            </h1>
            <p className="text-gray-600">{t("welcome")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("username")}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent transition-all duration-200"
                placeholder={t("usernamePlaceholder")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700  placeholder:text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent transition-all duration-200"
                  placeholder={t("passwordPlaceholder")}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  aria-label={
                    showPassword ? t("hidePassword") : t("showPassword")
                  }
                  className="absolute inset-y-0 right-2 top-1/2 -translate-y-1/2 text-sm text-app-dark-blue/80 hover:text-app-dark-blue focus:outline-none"
                >
                  {showPassword ? (
                    <EyeIcon className="w-8 h-4" />
                  ) : (
                    <EyeOff className="w-8 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-app-red/10 border border-app-red/20 text-app-red px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-app-dark-blue hover:bg-app-dark-blue/80 disabled:bg-app-dark-blue/50 text-white font-bold py-3 px-8 rounded-xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-app-blue"
            >
              {loading ? t("loading") : t("submit")}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              ← {t("backToHome")}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
