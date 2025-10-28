"use client";
import "@/app/globals.css";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Texts } from "@/app/v1/components/(reusable)/texts";
import { Images } from "@/app/v1/components/(reusable)/images";
import { useSearchParams } from "next/navigation";
import {
  resetUserPassword,
  verifyPasswordResetToken,
} from "@/app/lib/actions/reset";
import { Input } from "@/app/v1/components/ui/input";
import { Button } from "@/app/v1/components/ui/button";
import { Label } from "@/app/v1/components/ui/label";

export default function ChangePassword() {
  const t = useTranslations("PasswordReset");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerColor, setBannerColor] = useState<"red" | "green">("red");
  const [eightChar, setEightChar] = useState(false);
  const [oneNumber, setOneNumber] = useState(false);
  const [oneSymbol, setOneSymbol] = useState(false);

  const [viewSecret1, setViewSecret1] = useState(false);
  const [viewSecret2, setViewSecret2] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const router = useRouter();

  const viewPasscode1 = () => {
    setViewSecret1(!viewSecret1);
  };

  const viewPasscode2 = () => {
    setViewSecret2(!viewSecret2);
  };

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      router.push("/signin");
      return;
    }

    const verifyToken = async () => {
      try {
        console.log("🔍 Verifying password reset token...");
        const result = await verifyPasswordResetToken(token);
        if (result.valid) {
          setTokenValid(true);
          console.log("✅ Token is valid");
        } else {
          setTokenValid(false);
          setBannerMessage(result.error || "Invalid or expired token");
          setBannerColor("red");
          setShowBanner(true);
        }
      } catch (error) {
        console.error("❌ Error verifying token:", error);
        setTokenValid(false);
        setBannerMessage("Error verifying reset token");
        setBannerColor("red");
        setShowBanner(true);
      }
    };

    verifyToken();
  }, [token, router]);

  if (tokenValid === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-app-gradient">
        <Texts size={"md"} text={"white"}>
          {t("Verifying")}...
        </Texts>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-app-gradient gap-4">
        <Texts size={"md"} text={"white"}>
          {bannerMessage}
        </Texts>
        <Button
          onClick={() => router.push("/signin")}
          className="bg-app-dark-blue text-white"
        >
          {t("BackToSignIn")}
        </Button>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (newPassword.length === 0) {
      setBannerMessage("Invalid. New Password cannot be empty.");
      setBannerColor("red");
      setShowBanner(true);
      setIsLoading(false);
      return;
    }
    if (confirmPassword.length === 0) {
      setBannerMessage("Invalid. Confirm Password cannot be empty.");
      setBannerColor("red");
      setShowBanner(true);
      setIsLoading(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      setBannerMessage(
        "Invalid. Password must be at least 6 characters long, contain 1 number, and 1 symbol."
      );
      setBannerColor("red");
      setShowBanner(true);
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setBannerMessage("Invalid. Passwords do not match!");
      setBannerColor("red");
      setShowBanner(true);
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔐 Resetting password...");
      const result = await resetUserPassword(token!, newPassword);

      if (result.error) {
        setBannerMessage(result.error);
        setBannerColor("red");
        setShowBanner(true);
        setIsLoading(false);
        return;
      }

      if (result.success) {
        setBannerMessage("✅ Password reset successfully! Redirecting...");
        setBannerColor("green");
        setShowBanner(true);
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
      setIsLoading(false);
    }
  };

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

  const onCancelReset = () => {
    router.push("/signin");
  };

  return (
    <div className="w-full h-screen grid grid-rows-10">
      <div className="h-full flex flex-col justify-end row-span-2 gap-1 p-4">
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

        <form
          onSubmit={handleSubmit}
          className="max-w-[600px] w-full h-full mx-auto flex flex-col gap-4"
        >
          <div className="h-full">
            <div className="flex flex-row gap-2 mb-2">
              <Label htmlFor="new-password">{t("NewPassword")}</Label>
              <Images
                titleImg={viewSecret1 ? "/eye.svg" : "/eyeSlash.svg"}
                titleImgAlt={t("EyeImageAlt")}
                background="none"
                size="10"
                onClick={viewPasscode1}
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
              disabled={isLoading}
            />
            {/* Password requirements message */}
            {newPassword && (!eightChar || !oneNumber || !oneSymbol) && (
              <div className="text-xs text-red-600 mt-2">
                {t("PasswordRequirements")}
                <ul className="list-disc ml-5">
                  {!eightChar && <li>{t("LengthRequirement")}</li>}
                  {!oneNumber && <li>{t("NumberRequirement")}</li>}
                  {!oneSymbol && <li>{t("SymbolRequirement")}</li>}
                </ul>
              </div>
            )}
            <div className="my-4" />
            <div className="flex flex-row gap-2 mb-2">
              <Label htmlFor="confirm-password">{t("ConfirmPassword")}</Label>
              <Images
                titleImg={viewSecret2 ? "/eye.svg" : "/eyeSlash.svg"}
                titleImgAlt={t("EyeImageAlt")}
                background="none"
                size="10"
                onClick={viewPasscode2}
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
              disabled={isLoading}
            />
            {/* Confirm password match message */}
            {confirmPassword && newPassword !== confirmPassword && (
              <div className="text-xs text-red-600 mt-2">
                {t("PasswordMismatchError")}
              </div>
            )}
          </div>
          <div className="w-full flex flex-row gap-4">
            <Button
              type="button"
              onClick={onCancelReset}
              size={"lg"}
              disabled={isLoading}
              className="bg-white border-app-dark-blue border-2 text-app-dark-blue rounded-lg p-2 w-full"
            >
              <p>{t("Cancel")}</p>
            </Button>

            <Button
              type="submit"
              size={"lg"}
              disabled={isLoading}
              className="bg-app-dark-blue text-white rounded-lg p-2 w-full"
            >
              <p>{isLoading ? t("Loading") : t("ChangePassword")}</p>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
