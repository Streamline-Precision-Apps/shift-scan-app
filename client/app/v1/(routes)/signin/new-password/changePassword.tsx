"use client";
import "@/app/globals.css";
import { useTranslations } from "next-intl";
import { Holds } from "@/components/(reusable)/holds";
import { FormEvent, useEffect, useState } from "react";
import { hash } from "bcryptjs";
import { useRouter } from "next/navigation";
import { Texts } from "@/components/(reusable)/texts";
import { Images } from "@/components/(reusable)/images";
import { useSearchParams } from "next/navigation";
import RemoveToken, { resetUserPassword } from "@/actions/reset";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import removeToken from "@/actions/reset";

export default function ChangePassword() {
  const t = useTranslations("PasswordReset");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [eightChar, setEightChar] = useState(false);
  const [oneNumber, setOneNumber] = useState(false);
  const [oneSymbol, setOneSymbol] = useState(false);

  const [viewSecret1, setViewSecret1] = useState(false);
  const [viewSecret2, setViewSecret2] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const route = useRouter();

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
      }, 8000); // Banner disappears after 5 seconds

      return () => clearTimeout(timer); // Clear the timeout if the component unmounts
    }
  }, [showBanner]);

  // add this to validate they have a token for the request
  if (!token) {
    route.push("/signin");
    return null;
  }
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length === 0) {
      setBannerMessage("Invalid. New Password cannot be empty.");
      setShowBanner(true);
      return;
    }
    if (confirmPassword.length === 0) {
      setBannerMessage("Invalid. Confirm Password cannot be empty.");
      setShowBanner(true);
      return;
    }

    if (!validatePassword(newPassword)) {
      setBannerMessage(
        "Invalid. Password must be at least 6 characters long, contain 1 number, and 1 symbol.",
      );
      setShowBanner(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setBannerMessage("Invalid. Passwords do not match!");
      setShowBanner(true);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const hashed = await hash(newPassword, 10);
    // formData.append("id", userId ?? "");
    formData.append("token", token ?? "");
    formData.append("password", hashed);

    try {
      await resetUserPassword(formData);
      route.push("/signin");
    } catch (error) {
      console.error("Error updating password:", error);
      setBannerMessage(
        "There was an error updating your password. Please try again.",
      );
      setShowBanner(true);
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

  const onCancelReset = async () => {
    const { success } = await removeToken(token ?? "");
    if (!success) {
      console.error("Error removing token:", success);
      return;
    }
    route.push("/signin");
  };

  return (
    <div className="w-full h-screen grid grid-rows-10">
      <div className="h-full flex flex-col justify-end row-span-2 gap-1 p-4">
        <Texts text={"white"} className="justify-end" size={"md"}>
          {t("ChangePasswordTitle")}
        </Texts>
      </div>

      <div className="h-full row-span-8 flex flex-col bg-white border border-zinc-300 p-4 gap-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-[600px] w-full h-full mx-auto flex flex-col gap-4"
        >
          {/* Start of grid container */}
          <div className="h-full">
            <Holds position="row" className="gap-2">
              <Label htmlFor="new-password">{t("NewPassword")}</Label>
              <Images
                titleImg={viewSecret1 ? "/eye.svg" : "/eyeSlash.svg"}
                titleImgAlt={t("EyeImageAlt")}
                background="none"
                size="10"
                onClick={viewPasscode1}
              />
            </Holds>
            <Input
              type={viewSecret1 ? "text" : "password"}
              id="new-password"
              value={newPassword}
              onChange={(e) => {
                handlePasswordChange(e.target.value);
                setNewPassword(e.target.value);
              }}
              autoCapitalize={"off"}
            />
            {/* Password requirements message */}
            {newPassword && (!eightChar || !oneNumber || !oneSymbol) && (
              <div className="text-xs text-red-600 mt-1">
                {t("PasswordRequirements")}
                <ul className="list-disc ml-5">
                  {!eightChar && <li>{t("LengthRequirement")}</li>}
                  {!oneNumber && <li>{t("NumberRequirement")}</li>}
                  {!oneSymbol && <li>{t("SymbolRequirement")}</li>}
                </ul>
              </div>
            )}
            <div className="my-4" />
            <Holds position="row" className="gap-2">
              <Label htmlFor="confirm-password">{t("ConfirmPassword")}</Label>
              <Images
                titleImg={viewSecret2 ? "/eye.svg" : "/eyeSlash.svg"}
                titleImgAlt={t("EyeImageAlt")}
                background="none"
                size="10"
                onClick={viewPasscode2}
              />
            </Holds>
            <Input
              type={viewSecret2 ? "text" : "password"}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              autoCapitalize={"off"}
            />
            {/* Confirm password match message */}
            {confirmPassword && newPassword !== confirmPassword && (
              <div className="text-xs text-red-600 mt-1">
                {t("PasswordMismatchError")}
              </div>
            )}
          </div>
          <div className="w-full flex flex-row gap-4">
            <Button
              type="button"
              onClick={() => onCancelReset()}
              size={"lg"}
              className="bg-white border-app-dark-blue border-2  text-app-dark-blue rounded-lg p-2 w-full"
            >
              <p>{t("Cancel")}</p>
            </Button>

            <Button
              type="submit"
              size={"lg"}
              className="bg-app-dark-blue text-white rounded-lg p-2 w-full"
            >
              <p>{t("ChangePassword")}</p>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
