"use client";
import { useEffect, useState } from "react";
import { Holds } from "../(reusable)/holds";
import { Texts } from "../(reusable)/texts";
import { Titles } from "../(reusable)/titles";
import LocaleToggleSwitch from "../(inputs)/toggleSwitch";
import { useTranslations } from "next-intl";
// import { setUserPermissions } from "@/actions/userActions";
import { ProgressBar } from "./progressBar";
import { Button } from "../ui/button";
import { usePermissions } from "@/app/lib/context/permissionContext";
import { useUserStore } from "@/app/lib/store/userStore";

type UserSettings = {
  userId: string;
  language?: string;
  personalReminders?: boolean;
  generalReminders?: boolean;
  cameraAccess?: boolean;
  locationAccess?: boolean;
  cookiesAccess?: boolean;
};

type prop = {
  userId: string;
  handleNextStep: () => void;
  totalSteps: number;
  currentStep: number;
};

export default function NotificationSettings({
  userId,
  handleNextStep,
  totalSteps,
  currentStep,
}: prop) {
  console.log(userId);
  const t = useTranslations("SignUpPermissions");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [updatedData, setUpdatedData] = useState<UserSettings>({
    userId,
    cameraAccess: false,
    locationAccess: false,
    personalReminders: false,
    generalReminders: false,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRequiredAccessed, setIsRequiredAccessed] = useState(false);
  const {
    requestCameraPermission,
    requestLocationPermission,
    resetCameraPermission,
    resetLocationPermission,
  } = usePermissions();

  // Update the state for a particular setting
  const handleChange = (key: keyof UserSettings, value: boolean) => {
    setUpdatedData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCameraToggle = async (isAccepted: boolean) => {
    if (isAccepted) {
      // Request camera permission
      const granted = await requestCameraPermission();
      handleChange("cameraAccess", granted);
    } else {
      // Reset the permission so it can be re-requested if toggled back on
      resetCameraPermission();
      handleChange("cameraAccess", false);
    }
  };

  const handleLocationToggle = async (isAccepted: boolean) => {
    if (isAccepted) {
      // Request location permission
      const result = await requestLocationPermission();
      // Extract the success property from the response object
      handleChange("locationAccess", result.success);
    } else {
      // Reset the permission so it can be re-requested if toggled back on
      resetLocationPermission();
      handleChange("locationAccess", false);
    }
  };

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 8000); // Banner disappears after 8 seconds
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  useEffect(() => {
    // Update the flag if required settings (camera, location) are enabled
    if (
      updatedData?.cameraAccess === true &&
      updatedData?.locationAccess === true
    ) {
      setIsRequiredAccessed(true);
    } else {
      setIsRequiredAccessed(false);
    }
  }, [updatedData]);

  const handleSubmitSettings = async () => {
    if (!isRequiredAccessed) {
      setBannerMessage(`${t("RequiredPermissionsError")}`);
      setShowBanner(true);
      return;
    }
    try {
      setIsSubmitting(true);
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserSettings: {
            cameraAccess: updatedData?.cameraAccess,
            locationAccess: updatedData?.locationAccess,
            generalReminders: updatedData?.generalReminders,
            personalReminders: updatedData?.personalReminders,
            cookiesAccess: true,
          },
        }),
      }).then((res) => res.json());

      if (!res.success) {
        throw new Error("Failed to update password");
      }

      useUserStore.getState().setUserSettings(res.data.UserSettings); // updating user store
      handleNextStep();
    } catch (error) {
      console.error("Error occurred while submitting settings:", error);
      setBannerMessage(`${t("FetchErrorMessage")}`);
      setShowBanner(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-dvh w-full flex flex-col">
      <div className="w-full h-[10%] flex flex-col justify-end py-3">
        <Texts text={"white"} className="justify-end" size={"sm"}>
          {t("AcceptAllPermissions")}
        </Texts>
      </div>
      <div className="bg-white w-full h-10 border border-slate-200 flex flex-col justify-center gap-1">
        <div className="w-[95%] max-w-[600px] mx-auto">
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white pb-[200px]">
        <div className="max-w-[600px] w-[95%] p-4 px-2 flex flex-col mx-auto gap-4">
          <div className=" h-full max-h-[50vh] flex flex-col items-center gap-8">
            <div>
              <Titles size={"h5"}>{t("RequiredForAppUse")}</Titles>
            </div>
            <Holds position={"row"}>
              <Holds size={"70"}>
                <Texts position={"left"}>{t("CameraAccess")}</Texts>
              </Holds>
              <Holds size={"30"}>
                <LocaleToggleSwitch
                  data={updatedData?.cameraAccess || false}
                  onChange={handleCameraToggle}
                />
              </Holds>
            </Holds>
            <Holds position={"row"}>
              <Holds size={"70"}>
                <Texts position={"left"}>{t("LocationAccess")}</Texts>
              </Holds>
              <Holds size={"30"}>
                <LocaleToggleSwitch
                  data={updatedData?.locationAccess || false}
                  onChange={handleLocationToggle}
                />
              </Holds>
            </Holds>
          </div>
        </div>
      </div>
      <div className="w-full h-[10%] bg-white border-t border-slate-200 px-4 py-2">
        <Button
          size={"lg"}
          onClick={handleSubmitSettings}
          className={`${
            isRequiredAccessed ? "bg-app-dark-blue" : "bg-gray-300 "
          } text-white rounded-lg p-2 w-full`}
          disabled={isSubmitting || !isRequiredAccessed} // Disable the button while submitting
        >
          <p>{isSubmitting ? `${t("Submitting")}` : `${t("Next")}`}</p>
        </Button>
      </div>
    </div>
  );
}
