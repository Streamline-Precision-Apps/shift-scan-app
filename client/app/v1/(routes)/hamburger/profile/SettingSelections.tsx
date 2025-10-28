"use client";
import React, {
  useState,
  ChangeEvent,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";
import { useTranslations } from "next-intl";
import LocaleToggleSwitch from "@/app/v1/components/(inputs)/toggleSwitch";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import "@/app/globals.css";
import { Texts } from "@/app/v1/components/(reusable)/texts";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import Spinner from "@/app/v1/components/(animations)/spinner";
import { useRouter } from "next/navigation";
import { NModals } from "@/app/v1/components/(reusable)/newmodals";
import { Selects } from "@/app/v1/components/(reusable)/selects";
import LanguageModal from "@/app/v1/components/(modal)/langaugeModal";
import { setLocale } from "@/app/lib/actions/cookieActions";
import { useSession } from "@/app/lib/context/sessionContext";
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
type Props = {
  id: string;
  setData: Dispatch<SetStateAction<UserSettings | null>>;
  data: UserSettings | null;
  updatedData: UserSettings | null;
  setUpdatedData: Dispatch<SetStateAction<UserSettings | null>>;
  handleChange: (key: keyof UserSettings, value: boolean) => void;
  handleLanguageChange: (key: keyof UserSettings, value: string) => void;
  handleCameraAccessChange: (value: boolean) => void;
  handleLocationAccessChange: (value: boolean) => void;
};

export default function SettingSelections({
  id,
  handleLanguageChange,
  data,
  updatedData,
  handleChange,
  handleCameraAccessChange,
  handleLocationAccessChange,
}: Props) {
  const { setLanguage: setLang } = useUserStore();
  const router = useRouter();
  const t = useTranslations("Hamburger-Profile");
  const { updateLocale } = useSession();
  const [language, setLanguage] = useState<string>();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  useEffect(() => {
    if (!data?.language) return;
    setLanguage(data.language);
  }, [data]);

  if (!data) {
    return (
      <>
        <Holds
          background="white"
          className="row-span-7 p-4 h-full justify-center items-center animate-pulse"
        >
          <Spinner />
        </Holds>
        <Holds className="row-span-1">
          <Buttons
            onClick={() => router.push("/hamburger/changePassword")}
            background="orange"
            className="py-2"
          >
            <Titles>{t("ChangePassword")}</Titles>
          </Buttons>
        </Holds>
      </>
    );
  }
  return (
    <>
      <Holds className=" h-full pt-5">
        {/*---------------------Language Settings------------------------------*/}
        <Holds background="white" className="h-fit pb-3">
          <Contents width="section">
            <Selects
              className="text-center text-black"
              value={language}
              onChange={async (event: ChangeEvent<HTMLSelectElement>) => {
                const newLanguage = event.target.value;
                console.log("🌍 Changing language to:", newLanguage);

                // 1. Update database via state change
                handleLanguageChange("language", newLanguage);

                // 2. Update cookies
                try {
                  console.log("📝 Setting locale cookie to:", newLanguage);
                  const response = await setLocale(newLanguage === "es");
                  console.log("✅ Cookie API call successful:", response);

                  // IMPORTANT: Wait a moment for browser to process Set-Cookie header
                  await new Promise((resolve) => setTimeout(resolve, 100));

                  // Verify cookie was set
                  if (typeof window !== "undefined") {
                    const locale = document.cookie
                      .split("; ")
                      .find((row) => row.startsWith("locale="));
                    console.log(
                      "🔍 Locale cookie in browser:",
                      locale || "❌ NOT FOUND"
                    );
                    console.log("📋 All cookies:", document.cookie);
                  }
                } catch (error) {
                  console.error("❌ Failed to update locale cookie:", error);
                }

                // 3. Update session context
                updateLocale(newLanguage);

                // 4. Update local state for UI
                setLanguage(newLanguage);

                // 5. Update user store
                setLang(newLanguage);
              }}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </Selects>
          </Contents>
        </Holds>

        {/*-------------------------Notifications Settings------------------------------*/}
        <Holds background="white" className=" py-3">
          <Contents width="section">
            <Grids rows="1" gap="5">
              <Holds position="row">
                <Holds size="70">
                  <Texts size={"p5"} position="left">
                    {t("GeneralReminders")}
                  </Texts>
                </Holds>
                <Holds size="30">
                  <LocaleToggleSwitch
                    data={updatedData?.generalReminders || false}
                    onChange={(value: boolean) => {
                      handleChange("generalReminders", value);
                    }}
                  />
                </Holds>
              </Holds>
            </Grids>
          </Contents>
        </Holds>

        {/* <Holds background="white" className=" py-3">
          <Contents width="section">
            <Grids rows="1" gap="5">
              <Holds position="row">
                <Holds size="70">
                  <Texts size={"p5"} position="left">
                    {t("PersonalReminders")}
                  </Texts>
                </Holds>
                <Holds size="30">
                  <LocaleToggleSwitch
                    data={updatedData?.personalReminders || false}
                    onChange={(value: boolean) => {
                      handleChange("personalReminders", value);
                    }}
                  />
                </Holds>
              </Holds>
            </Grids>
          </Contents>
        </Holds> */}

        {/*-------------------------App Usage settings------------------------------*/}
        {/* <Holds background="white" className=" py-3">
          <Contents width="section">
            <Grids rows="1" gap="5">
              <Holds position="row">
                <Holds size="70">
                  <Texts size={"p5"} position="left">
                    {t("Camera")}
                  </Texts>
                </Holds>
                <Holds size="30">
                  <LocaleToggleSwitch
                    data={updatedData?.cameraAccess || false}
                    onChange={handleCameraAccessChange}
                  />
                </Holds>
              </Holds>
            </Grids>
          </Contents>
        </Holds> */}
        {/* <Holds background="white" className=" py-3">
          <Contents width="section">
            <Grids rows="1" gap="5">
              <Holds position="row">
                <Holds size="70">
                  <Texts size={"p5"} position="left">
                    {t("Location")}
                  </Texts>
                </Holds>
                <Holds size="30">
                  <LocaleToggleSwitch
                    data={updatedData?.locationAccess || false}
                    onChange={handleLocationAccessChange}
                  />
                </Holds>
              </Holds>
            </Grids>
          </Contents>
        </Holds> */}

        {/* Language Selection Modal */}
        <NModals
          size="xl"
          isOpen={isLangModalOpen}
          handleClose={() => setIsLangModalOpen(false)}
        >
          <LanguageModal
            setIsOpenLanguageSelector={() => setIsLangModalOpen(false)}
          />
        </NModals>
      </Holds>

      {/*---------------------Change Password------------------------------*/}
      <Holds className="py-5">
        <Contents width="section">
          <Buttons
            onClick={() => router.push("/v1/hamburger/changePassword")}
            background="orange"
            className="py-2"
          >
            <Titles size={"sm"}>{t("ChangePassword")}</Titles>
          </Buttons>
        </Contents>
      </Holds>
    </>
  );
}
