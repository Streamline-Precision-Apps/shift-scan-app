"use client";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import AccountInformation from "./accountInformation";
import { NewTab } from "@/app/v1/components/(reusable)/newTabs";
import SettingSelections from "./SettingSelections";
import { z } from "zod";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { updateSettings } from "@/app/lib/actions/old";
import ProfileImageEditor from "./ProfileImageEditor";
import { usePermissions } from "@/app/lib/context/permissionContext";
import { apiRequest } from "@/app/lib/utils/api-Utils";

type UserSettings = {
  userId: string;
  language?: string;
  personalReminders?: boolean;
  generalReminders?: boolean;
  cameraAccess?: boolean;
  locationAccess?: boolean;
  cookiesAccess?: boolean;
};

// Define Zod schema for UserSettings
const userSettingsSchema = z.object({
  personalReminders: z.boolean().optional(),
  generalReminders: z.boolean().optional(),
  cameraAccess: z.boolean().optional(),
  locationAccess: z.boolean().optional(),
  language: z.string().optional(),
});

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  signature?: string | null;
  image: string | null;
  imageUrl?: string | null;
  Contact: {
    phoneNumber: string;
    emergencyContact: string;
    emergencyContactNumber: string;
  };
};

export default function ProfilePage({ userId }: { userId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("returnUrl") || "/dashboard";
  const t = useTranslations("Hamburger-Profile");
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee>();
  const [activeTab, setActiveTab] = useState(1);
  const [signatureBase64String, setSignatureBase64String] = useState<
    string | null
  >(null);
  // Fetch Employee Data
  const [data, setData] = useState<UserSettings | null>(null);
  const [updatedData, setUpdatedData] = useState<UserSettings | null>(null);
  const [initialData, setInitialData] = useState<UserSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Use the centralized permissions context
  const {
    permissionStatus,
    requestCameraPermission,
    requestLocationPermission,
  } = usePermissions();

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      console.log("🔍 fetchEmployee called with userId:", userId);

      // First, try to load from localStorage
      if (typeof window !== "undefined") {
        const userStoreRaw = localStorage.getItem("user-store");
        if (userStoreRaw) {
          try {
            const userStoreObj = JSON.parse(userStoreRaw);
            const userData = userStoreObj?.state?.user || userStoreObj?.user;

            if (userData && userData.id) {
              console.log("✅ Found user in localStorage:", userData.id);
              // Map user data to employee format
              const employeeData = {
                id: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                image: userData.image,
                signature: userData.signature,
                Contact: userData.Contact,
              };

              setEmployee(employeeData);
              setSignatureBase64String(userData.signature ?? "");
              setLoading(false);
              return; // Don't fetch from API if found in localStorage
            }
          } catch (err) {
            console.warn("Failed to parse stored user data:", err);
          }
        }
      }

      // If not in localStorage, fetch from API
      console.log("📡 Fetching employee data from API for userId:", userId);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      console.log("🔑 Token:", token ? "exists" : "missing");

      const result = await apiRequest("/api/v1/user/contact", "POST", {
        userId: String(userId),
      });

      const employeeData = result.data;
      setEmployee(employeeData);
      setSignatureBase64String(employeeData.signature ?? "");
    } catch (error) {
      console.error("Failed to fetch employee data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Employee on Component Mount
  useEffect(() => {
    fetchEmployee();
  }, [userId]);

  // Fetch settings and synchronize with permission status
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔍 fetchData called with userId:", userId);
        let settings = null;

        // First, try to load from localStorage
        if (typeof window !== "undefined") {
          const userStoreRaw = localStorage.getItem("user-store");
          if (userStoreRaw) {
            try {
              const userStoreObj = JSON.parse(userStoreRaw);
              const userData = userStoreObj?.state?.user || userStoreObj?.user;

              if (userData && userData.UserSettings) {
                console.log(
                  "✅ Found UserSettings in localStorage:",
                  userData.UserSettings
                );
                // Use cached UserSettings from localStorage
                settings = userData.UserSettings;
                const validatedSettings = userSettingsSchema.parse(settings);

                // Sync with permission status from context
                const updatedSettings = {
                  ...validatedSettings,
                  userId,
                  cameraAccess: permissionStatus.camera === "granted",
                  locationAccess: permissionStatus.location === "granted",
                };

                setData(updatedSettings);
                setUpdatedData(updatedSettings);
                setInitialData(updatedSettings);
                return; // Don't fetch from API if found in localStorage
              }
            } catch (err) {
              console.warn("Failed to parse stored user settings:", err);
            }
          }
        }

        // If not in localStorage, fetch from API to get current settings
        console.log("📡 Fetching UserSettings from API for userId:", userId);
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        console.log("🔑 Token:", token ? "exists" : "missing");

        const res = await apiRequest("/api/v1/user/settings", "POST", {
          userId: String(userId),
        });

        settings = res.data;
        const validatedSettings = userSettingsSchema.parse(settings);

        // Use permissionStatus from context: only true if 'granted'
        const updatedSettings = {
          ...validatedSettings,
          userId,
          cameraAccess: permissionStatus.camera === "granted",
          locationAccess: permissionStatus.location === "granted",
        };

        setData(updatedSettings);
        setUpdatedData(updatedSettings);
        setInitialData(updatedSettings); // Store initial data
      } catch (error) {
        console.error("Error occurred while fetching settings:", error);
      }
    };

    // Only fetch when permissionStatus is available
    if (permissionStatus) {
      fetchData();
    }
  }, [userId, permissionStatus]);

  // Automatically save settings when updated
  useEffect(() => {
    const saveChanges = async () => {
      if (updatedData && updatedData !== initialData) {
        // setIsSaving(true);
        await updateSettings(updatedData);
        // setTimeout(() => setIsSaving(false), 1000);
        setInitialData(updatedData);
      }
    };
    saveChanges();
  }, [updatedData, initialData]);

  // Save settings before user navigates away from the page
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (updatedData && updatedData !== initialData) {
        await updateSettings(updatedData);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [updatedData, initialData]);

  // Helper function: update permission setting in state
  const handleChange = (key: keyof UserSettings, value: boolean) => {
    setUpdatedData((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleLanguageChange = (key: keyof UserSettings, value: string) => {
    setUpdatedData((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  // --- Updated toggles with permission requests ---

  // CameraAccess toggle: request permission using the permissions context
  const handleCameraAccessChange = async (value: boolean) => {
    if (value) {
      try {
        const granted = await requestCameraPermission();
        // Only set true if permission is actually granted
        handleChange("cameraAccess", granted === true);
      } catch (err) {
        console.error("Camera access denied:", err);
        handleChange("cameraAccess", false);
      }
    } else {
      // When turning off, just update the app setting
      handleChange("cameraAccess", false);
    }
  };

  // LocationAccess toggle: request permission using the permissions context
  const handleLocationAccessChange = async (value: boolean) => {
    if (value) {
      try {
        const result = await requestLocationPermission();
        // Only set true if permission is actually granted
        handleChange("locationAccess", result.success === true);
      } catch (err) {
        console.error("Location access denied:", err);
        handleChange("locationAccess", false);
      }
    } else {
      handleChange("locationAccess", false);
    }
  };

  return (
    <Grids rows={"6"} gap={"5"}>
      <Holds
        background={"white"}
        className={`row-start-1 row-end-2 h-full ${
          loading ? "animate-pulse" : ""
        }`}
      >
        <TitleBoxes
          onClick={isOpen ? () => setIsOpen(false) : () => router.push(url)}
        >
          {/* Profile Image Editor (Pass fetchEmployee as Prop) */}

          <ProfileImageEditor
            employee={employee}
            reloadEmployee={fetchEmployee}
            loading={loading}
            employeeName={employee?.firstName + " " + employee?.lastName}
            setIsOpen={setIsOpen}
            isOpen={isOpen}
          />
        </TitleBoxes>
      </Holds>

      {/* Account Information Section */}
      <Holds
        className={`row-start-2 row-end-7 h-full ${
          loading ? "animate-pulse" : ""
        }`}
      >
        {/* Tabs */}
        <Holds position={"row"} className="h-fit flex gap-x-1">
          <NewTab
            titleImage={"/information.svg"}
            titleImageAlt={""}
            onClick={() => setActiveTab(1)}
            isActive={activeTab === 1}
            isComplete={true}
          >
            <Titles size={"sm"}>{t("AccountInformation")}</Titles>
          </NewTab>
          <NewTab
            titleImage={"/Settings.svg"}
            titleImageAlt={"Settings"}
            onClick={() => setActiveTab(2)}
            isActive={activeTab === 2}
            isComplete={true}
          >
            <Titles size={"sm"}>{t("AccountSettings")}</Titles>
          </NewTab>
        </Holds>

        {/* Content */}
        <Holds background={"white"} className="rounded-t-none h-full w-full">
          {loading ? null : (
            <>
              {activeTab === 1 && (
                <AccountInformation
                  employee={employee}
                  signatureBase64String={signatureBase64String}
                  setSignatureBase64String={setSignatureBase64String}
                  userId={userId}
                  reloadEmployee={fetchEmployee}
                />
              )}
              {activeTab === 2 && (
                <SettingSelections
                  id={userId}
                  handleLanguageChange={handleLanguageChange}
                  data={data}
                  updatedData={updatedData}
                  handleChange={handleChange}
                  handleCameraAccessChange={handleCameraAccessChange}
                  handleLocationAccessChange={handleLocationAccessChange}
                  setData={setData}
                  setUpdatedData={setUpdatedData}
                />
              )}
            </>
          )}
        </Holds>
      </Holds>
    </Grids>
  );
}
