"use client";
import "@/app/globals.css";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Texts } from "@/app/v1/components/(reusable)/texts";
import { Images } from "@/app/v1/components/(reusable)/images";
import { useSearchParams } from "next/navigation";
import { Input } from "@/app/v1/components/ui/input";
import { Button } from "@/app/v1/components/ui/button";
import { Label } from "@/app/v1/components/ui/label";
import {
  resetUserPassword,
  verifyPasswordResetToken,
} from "@/app/lib/actions/reset";
import Spinner from "@/app/v1/components/(animations)/spinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type TokenStatus = "loading" | "valid" | "invalid" | "expired";

export default function ChangePassword() {
  const t = useTranslations("PasswordReset");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  // Token verification state
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("loading");
  const [tokenError, setTokenError] = useState<string>("");

  // Form state
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerColor, setBannerColor] = useState<"red" | "green">("red");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password state
  const [eightChar, setEightChar] = useState(false);
  const [oneNumber, setOneNumber] = useState(false);
  const [oneSymbol, setOneSymbol] = useState(false);
  const [viewSecret1, setViewSecret1] = useState(false);
  const [viewSecret2, setViewSecret2] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      setTokenError("No token provided");
      return;
    }

    const verifyToken = async () => {
      try {
        console.log("🔍 Verifying password reset token...");
        const result = await verifyPasswordResetToken(token);

        if (result.valid) {
          setTokenStatus("valid");
          console.log("✅ Token is valid");
        } else {
          // Determine if expired or invalid
          if (result.error?.includes("expired")) {
            setTokenStatus("expired");
            setTokenError("Reset token has expired. Please request a new one.");
          } else {
            setTokenStatus("invalid");
            setTokenError(result.error || "Invalid reset token");
          }
          console.log("❌ Token invalid or expired:", result.error);
        }
      } catch (error) {
        console.error("❌ Error verifying token:", error);
        setTokenStatus("invalid");
        setTokenError("Error verifying token. Please try again.");
      }
    };

    verifyToken();
  }, [token]);

  // Cleanup token on unmount (component leave)
  useEffect(() => {
    return () => {
      // If user leaves the page without resetting password, delete the token
      if (token && tokenStatus === "valid") {
        console.log("👋 User leaving page, deleting token...");
        deleteToken(token);
      }
    };
  }, [token, tokenStatus]);

  // Delete token function
  const deleteToken = async (tokenToDelete: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/tokens/reset/${tokenToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Reset token deleted:", data.message);
      } else if (response.status === 404) {
        // Token already deleted or doesn't exist - this is okay
        console.log("ℹ️  Token already deleted or not found");
      } else {
        console.error(
          "❌ Failed to delete token:",
          data.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("❌ Error deleting token:", error);
    }
  };

  // Banner auto-hide
  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasNumber = /\d/;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/;

    return (
      password.length >= minLength &&
      hasNumber.test(password) &&
      hasSymbol.test(password)
    );
  };

  const handlePasswordChange = (password: string) => {
    setEightChar(password.length >= 6);
    setOneNumber(/\d/.test(password));
    setOneSymbol(/[!@#$%^&*(),.?":{}|<>]/.test(password));
  };

  // Handle password reset submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (newPassword.length === 0) {
      setBannerMessage("Invalid. New Password cannot be empty.");
      setBannerColor("red");
      setShowBanner(true);
      setIsSubmitting(false);
      return;
    }

    if (confirmPassword.length === 0) {
      setBannerMessage("Invalid. Confirm Password cannot be empty.");
      setBannerColor("red");
      setShowBanner(true);
      setIsSubmitting(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      setBannerMessage(
        "Invalid. Password must be at least 6 characters long, contain 1 number, and 1 symbol."
      );
      setBannerColor("red");
      setShowBanner(true);
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setBannerMessage("Invalid. Passwords do not match!");
      setBannerColor("red");
      setShowBanner(true);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("🔐 Resetting password...");
      const result = await resetUserPassword(token!, newPassword);

      if (result.error) {
        setBannerMessage(result.error);
        setBannerColor("red");
        setShowBanner(true);
        setIsSubmitting(false);
        return;
      }

      if (result.success) {
        setBannerMessage("✅ Password reset successfully! Redirecting...");
        setBannerColor("green");
        setShowBanner(true);
        // Token is automatically deleted on server after successful reset
        // So no need to manually delete it
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Error updating password:", error);
      setBannerMessage(
        "There was an error updating your password. Please try again."
      );
      setBannerColor("red");
      setShowBanner(true);
      setIsSubmitting(false);
    }
  };

  // Handle cancel - delete token and go back
  const handleCancel = async () => {
    if (token) {
      console.log("❌ User cancelled reset, deleting token...");
      await deleteToken(token);
    }
    router.push("/signin");
  };

  // Loading state
  if (tokenStatus === "loading") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-app-gradient bg-to-br from-app-dark-blue via-app-blue to-app-blue px-4 py-8 md:py-0 md:max-h-screen flex flex-col items-center justify-center">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-br from-app-dark-blue via-app-blue to-app-blue animate-gradient-move opacity-80" />
          <div className="absolute left-1/2 top-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-app-blue opacity-20 rounded-full blur-3xl" />
          <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-app-blue opacity-10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 w-full h-[90vh] max-w-md">
          <div className="bg-white/95 h-full backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 space-y-8 md:space-y-6">
            <div className="text-center h-full flex flex-col justify-center items-center gap-4">
              <Texts size={"lg"} className="text-app-dark-blue">
                {t("Verifying")}...
              </Texts>
              <Spinner />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-app-gradient bg-to-br from-app-dark-blue via-app-blue to-app-blue px-4 py-8 md:py-0 md:max-h-screen flex flex-col items-center justify-center">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-br from-app-dark-blue via-app-blue to-app-blue animate-gradient-move opacity-80" />
          <div className="absolute left-1/2 top-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-app-blue opacity-20 rounded-full blur-3xl" />
          <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-app-blue opacity-10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 w-full h-[90vh] max-w-md">
          <div className="bg-white/95 h-full backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 space-y-8 md:space-y-6">
            <div className="text-center h-full flex flex-col justify-center items-center gap-4">
              <div className="h-full row-span-8 flex flex-col  p-4 gap-4 items-center justify-center">
                <div className="max-w-[600px] text-center">
                  <div className="pb-4">
                    <Texts
                      className="justify-end text-app-dark-blue"
                      size={"lg"}
                    >
                      {t("InvalidTokenTitle")}
                    </Texts>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {t("InvalidTokenMessage") ||
                      "This password reset link is invalid or has already been used."}
                  </p>
                  <Button
                    onClick={() => router.push("/signin")}
                    className="bg-app-dark-blue text-white"
                    size={"lg"}
                  >
                    <p>{t("ReturnToSignIn")}</p>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (tokenStatus === "expired") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-app-gradient bg-to-br from-app-dark-blue via-app-blue to-app-blue px-4 py-8 md:py-0 md:max-h-screen flex flex-col items-center justify-center">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-br from-app-dark-blue via-app-blue to-app-blue animate-gradient-move opacity-80" />
          <div className="absolute left-1/2 top-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-app-blue opacity-20 rounded-full blur-3xl" />
          <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-app-blue opacity-10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 w-full h-[90vh] max-w-md">
          <div className="bg-white/95 h-full backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 space-y-8 md:space-y-6">
            <div className="text-center h-full flex flex-col justify-center items-center gap-4">
              <div className="h-full row-span-8 flex flex-col  p-4 gap-4 items-center justify-center">
                <div className="max-w-[600px] text-center">
                  <div className="pb-4">
                    <Texts
                      className="justify-end text-app-dark-blue"
                      size={"lg"}
                    >
                      {t("ExpiredTokenTitle") || "Token Expired"}
                    </Texts>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {t("ExpiredTokenMessage") ||
                      "Password reset tokens expire after 24 hours for security reasons."}
                  </p>
                  <Button
                    onClick={() => router.push("/signin/forgot-password")}
                    className="bg-app-dark-blue text-white"
                    size={"lg"}
                  >
                    <p>
                      {t("RequestNewReset") || "Request New Password Reset"}
                    </p>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="relative min-h-screen overflow-hidden bg-app-gradient bg-to-br from-app-dark-blue via-app-blue to-app-blue px-4 py-8 md:py-0 md:max-h-screen flex flex-col items-center justify-center">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-app-dark-blue via-app-blue to-app-blue animate-gradient-move opacity-80" />
        <div className="absolute left-1/2 top-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-app-blue opacity-20 rounded-full blur-3xl" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-app-blue opacity-10 rounded-full blur-2xl" />
      </div>
      <div className="relative z-10 w-full h-[90vh] max-w-md">
        <div className="bg-white/95 h-full backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 space-y-8 md:space-y-6">
          <div className="text-center h-full flex flex-col justify-center items-center gap-4">
            <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
              <form
                onSubmit={handleSubmit}
                className=" w-full mx-auto h-[calc(100vh-80px)] flex flex-col justify-between"
              >
                <div className="w-full h-fit flex flex-col space-y-2 mb-6">
                  <Texts className="justify-end text-app-dark-blue" size={"lg"}>
                    {t("ChangePasswordTitle")}
                  </Texts>
                </div>
                <div className="w-full flex-1 overflow-y-auto">
                  {/* New Password */}
                  <div className="mb-4">
                    <div className="flex flex-row  justify-between items-center gap-x-2 ">
                      <Label htmlFor="new-password">{t("NewPassword")}</Label>
                      <img
                        className="w-6 h-6 mr-1"
                        onClick={() => setViewSecret1(!viewSecret1)}
                        src={viewSecret1 ? "/eye.svg" : "/eyeSlash.svg"}
                        alt="reveal password"
                      />
                    </div>
                    <Input
                      type={viewSecret1 ? "text" : "password"}
                      id="new-password"
                      value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handlePasswordChange(e.target.value);
                        setNewPassword(e.target.value);
                      }}
                      autoCapitalize={"off"}
                      disabled={isSubmitting}
                    />
                    {/* Password requirements message */}
                    {newPassword &&
                      (!eightChar || !oneNumber || !oneSymbol) && (
                        <div className="text-xs text-red-600 mt-2">
                          {t("PasswordRequirements")}
                          <ul className="list-disc ml-5">
                            {!eightChar && <li>{t("LengthRequirement")}</li>}
                            {!oneNumber && <li>{t("NumberRequirement")}</li>}
                            {!oneSymbol && <li>{t("SymbolRequirement")}</li>}
                          </ul>
                        </div>
                      )}
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <div className="flex flex-row justify-between items-center gap-2 ">
                      <Label htmlFor="confirm-password">
                        {t("ConfirmPassword")}
                      </Label>
                      <img
                        className="w-6 h-6 mr-1"
                        onClick={() => setViewSecret2(!viewSecret2)}
                        src={viewSecret2 ? "/eye.svg" : "/eyeSlash.svg"}
                        alt="reveal password"
                      />
                    </div>
                    <Input
                      type={viewSecret2 ? "text" : "password"}
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setConfirmPassword(e.target.value);
                      }}
                      autoCapitalize={"off"}
                      disabled={isSubmitting}
                    />
                    {/* Confirm password match message */}
                    {confirmPassword && newPassword !== confirmPassword && (
                      <div className="text-xs text-red-600 mt-2">
                        {t("PasswordMismatchError")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="w-full flex flex-row gap-4 shrink-0">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    size={"lg"}
                    disabled={isSubmitting}
                    className="bg-white border-app-dark-blue border-2 text-app-dark-blue rounded-lg p-2 w-full"
                  >
                    <p>{t("Cancel")}</p>
                  </Button>

                  <Button
                    type="submit"
                    size={"lg"}
                    disabled={isSubmitting}
                    className="bg-app-dark-blue text-white rounded-lg p-2 w-full"
                  >
                    <p>{isSubmitting ? t("Loading") : t("ChangePassword")}</p>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
  // Valid token - show password reset form
  return (
    <div className="w-full h-screen grid grid-rows-10">
      <div className="h-full bg-app-dark-blue flex flex-col justify-end row-span-2 gap-1 p-4">
        <Texts text={"white"} className="justify-end" size={"md"}>
          {t("ChangePasswordTitle")}
        </Texts>
      </div>

      <div className="h-full row-span-8 flex flex-col bg-white border border-zinc-300 p-4 gap-4">
        {showBanner && (
          <div
            className={`p-3 rounded-lg text-sm font-medium ${
              bannerColor === "red"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {bannerMessage}
          </div>
        )}
      </div>
    </div>
  );
}
