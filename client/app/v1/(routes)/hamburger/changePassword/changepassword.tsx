"use client";
import { useTranslations } from "next-intl";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Buttons } from "@/components/(reusable)/buttons";
import { Inputs } from "@/components/(reusable)/inputs";
import { Labels } from "@/components/(reusable)/labels";
import { Forms } from "@/components/(reusable)/forms";
import { FormEvent, useEffect, useState } from "react";
import { setUserPassword } from "@/actions/userActions";
import { hash } from "bcryptjs";
import { useRouter } from "next/navigation";
import { Contents } from "@/components/(reusable)/contents";
import { Titles } from "@/components/(reusable)/titles";
import { Images } from "@/components/(reusable)/images";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { X, Check } from "lucide-react";
import { signOut } from "next-auth/react";

export default function ChangePassword({ userId }: { userId: string }) {
  // Shared password scoring function
  function getPasswordScore(password: string) {
    let score = 0;
    if (password.length >= 6) score++; // Length
    if (/[A-Z]/.test(password)) score++; // Uppercase letters
    if (/[a-z]/.test(password)) score++; // Lowercase letters
    if (/[0-9]/.test(password)) score++; // Number
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++; // Special character
    return score;
  }
  const t = useTranslations("Hamburger-ChangePassword");
  const [showBanner, setShowBanner] = useState(false);
  const [score, setScore] = useState(0);
  const [bannerMessage, setBannerMessage] = useState("");
  const [eightChar, setEightChar] = useState(false);
  const [oneNumber, setOneNumber] = useState(false);
  const [oneCapital, setOneCapital] = useState(false);
  const [oneSymbol, setOneSymbol] = useState(false);
  const [oneLower, setOneLower] = useState(false);

  const [viewSecret1, setViewSecret1] = useState(false);
  const [viewSecret2, setViewSecret2] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [readyToSubmit, setReadyToSubmit] = useState(false);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length === 0 || confirmPassword.length === 0) {
      setBannerMessage(
        "Invalid. Password and/or Confirm Password cannot be empty.",
      );
      setShowBanner(true);
      return;
    }

    if (!validatePassword(newPassword)) {
      setBannerMessage(
        "Invalid. Password must be at a strength of fair or better.",
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
    formData.append("id", userId);
    formData.append("password", hashed);

    try {
      await setUserPassword(formData);

      // Sign out the user and redirect to sign in page
      await signOut({
        redirect: true,
        redirectTo: "/signin",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      setBannerMessage(
        "There was an error updating your password. Please try again.",
      );
      setShowBanner(true);
    }
  };

  const validatePassword = (password: string) => {
    return getPasswordScore(password) >= 3;
  };

  const handlePasswordChange = (password: string, confirmPassword: string) => {
    setEightChar(password.length >= 6);
    setOneNumber(/\d/.test(password));
    setOneSymbol(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    setOneCapital(/[A-Z]/.test(password));
    setOneLower(/[a-z]/.test(password));
    // Ready to submit if score >= 3 and passwords match
    if (getPasswordScore(password) >= 3 && password === confirmPassword) {
      setReadyToSubmit(true);
    } else {
      setReadyToSubmit(false);
    }
  };

  // PasswordStrengthBar component
  function PasswordStrengthBar({ password }: { password: string }) {
    // Use shared scoring function
    const score = getPasswordScore(password);
    const colors = [
      "bg-gray-400",
      "bg-red-400",
      "bg-orange-400",
      "bg-yellow-400",
      "bg-green-400",
      "bg-green-600",
    ];
    const labels = [
      "Strength",
      "Very Weak",
      "Weak",
      "Fair",
      "Strong",
      "Very Strong",
    ];

    // Update parent score state using useEffect to avoid setState during render
    useEffect(() => {
      setScore(score);
    }, [score]);

    return (
      <div className="w-full flex flex-col gap-1" aria-live="polite">
        <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
          <div
            className={`h-2 rounded transition-all duration-300 ${colors[score]}`}
            style={{ width: `${(score / 5) * 100}%` }}
          ></div>
        </div>
        <span className={`text-xs font-medium text-right text-opacity-80`}>
          {labels[score]}
        </span>
      </div>
    );
  }

  return (
    <>
      <Contents>
        <Forms onSubmit={handleSubmit} className="h-full w-full">
          <Grids rows={"7"} cols={"1"} gap={"5"} className="h-full w-full">
            <Holds
              background={"white"}
              size={"full"}
              className="row-start-1 row-end-2 h-full "
            >
              <TitleBoxes>
                <Holds
                  position={"row"}
                  className="w-full justify-center gap-x-2 "
                >
                  <Titles size={"lg"}>{t("ChangePassword")}</Titles>
                  <Images
                    titleImg="/key.svg"
                    titleImgAlt="Key Icon"
                    className=" max-w-6 h-auto object-contain"
                  />
                </Holds>
              </TitleBoxes>
            </Holds>

            <Holds
              background={"white"}
              className=" row-start-2 row-end-8 h-full "
            >
              <Holds className="h-full py-5">
                <Contents width={"section"}>
                  <Holds className=" w-full pb-4">
                    <Holds position="row" className="w-full">
                      <Labels size={"p4"} htmlFor="new-password">
                        {t("NewPassword")}
                      </Labels>
                      <Images
                        titleImg={viewSecret1 ? "/eye.svg" : "/eyeSlash.svg"}
                        titleImgAlt="eye"
                        background="none"
                        size="10"
                        position="right"
                        onClick={viewPasscode1}
                      />
                    </Holds>
                    <Inputs
                      type={viewSecret1 ? "text" : "password"}
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        handlePasswordChange(e.target.value, confirmPassword);
                      }}
                    />
                  </Holds>
                  {/* Password Strength Bar */}
                  <div className="w-full pb-1">
                    <PasswordStrengthBar password={newPassword} />
                  </div>

                  <ul className="list-disc list-inside">
                    <li
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${oneCapital ? "text-green-600 " : "text-red-600"}`}
                      aria-live="polite"
                    >
                      {oneCapital ? (
                        <Check
                          size={16}
                          className="inline"
                          aria-label="Has capital letter"
                        />
                      ) : (
                        <X
                          size={16}
                          className="inline"
                          aria-label="Missing capital letter"
                        />
                      )}
                      {t("CapitalCriteriaLabel")}
                    </li>
                    <li
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${oneLower ? "text-green-600 " : "text-red-600"}`}
                      aria-live="polite"
                    >
                      {oneLower ? (
                        <Check
                          size={16}
                          className="inline"
                          aria-label="Has lowercase letter"
                        />
                      ) : (
                        <X
                          size={16}
                          className="inline"
                          aria-label="Missing lowercase letter"
                        />
                      )}
                      {t("LowerCriteriaLabel")}
                    </li>

                    <li
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${oneNumber ? "text-green-600 " : "text-red-600"}`}
                      aria-live="polite"
                    >
                      {oneNumber ? (
                        <Check
                          size={16}
                          className="inline"
                          aria-label="Has number"
                        />
                      ) : (
                        <X
                          size={16}
                          className="inline"
                          aria-label="Missing number"
                        />
                      )}
                      {t("NumberCriteriaLabel")}
                    </li>
                    <li
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${oneSymbol ? "text-green-600 " : "text-red-600"}`}
                      aria-live="polite"
                    >
                      {oneSymbol ? (
                        <Check
                          size={16}
                          className="inline"
                          aria-label="Has special character"
                        />
                      ) : (
                        <X
                          size={16}
                          className="inline"
                          aria-label="Missing special character"
                        />
                      )}
                      {t("SpecialCharacterCriteriaLabel")}
                    </li>
                    <li
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${eightChar ? "text-green-600 " : "text-red-600"}`}
                      aria-live="polite"
                    >
                      {eightChar ? (
                        <Check
                          size={16}
                          className="inline"
                          aria-label="Has minimum length"
                        />
                      ) : (
                        <X
                          size={16}
                          className="inline"
                          aria-label="Too short"
                        />
                      )}
                      {t("LengthCriteriaLabel")}
                    </li>
                  </ul>

                  <Holds className="w-full pb-2 pt-2">
                    <Holds position="row" className="h-full">
                      <Labels size={"p4"} htmlFor="confirm-password">
                        {t("ConfirmPassword")}
                      </Labels>
                      <Images
                        titleImg={viewSecret2 ? "/eye.svg" : "/eyeSlash.svg"}
                        titleImgAlt="eye"
                        background="none"
                        size="10"
                        onClick={viewPasscode2}
                      />
                    </Holds>
                    <Inputs
                      type={viewSecret2 ? "text" : "password"}
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        handlePasswordChange(newPassword, e.target.value);
                      }}
                    />
                  </Holds>
                  <ul className="list-disc list-inside">
                    <li
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${newPassword && confirmPassword && newPassword === confirmPassword ? "text-green-600 " : "text-red-600"}`}
                      aria-live="polite"
                    >
                      {newPassword &&
                      confirmPassword &&
                      newPassword === confirmPassword ? (
                        <Check
                          size={16}
                          className="inline"
                          aria-label="Passwords match"
                        />
                      ) : (
                        <X
                          size={16}
                          className="inline"
                          aria-label="Passwords do not match"
                        />
                      )}
                      Passwords match
                    </li>
                  </ul>

                  {/* Confirm password section */}
                </Contents>
              </Holds>
              <Holds className="h-fit py-5">
                <Contents width={"section"}>
                  <Buttons
                    background={readyToSubmit ? "orange" : "darkGray"}
                    type="submit"
                    className="py-2"
                  >
                    <Titles size={"sm"}>{t("ChangePassword")}</Titles>
                  </Buttons>
                </Contents>
              </Holds>
            </Holds>
          </Grids>
        </Forms>
      </Contents>
    </>
  );
}
