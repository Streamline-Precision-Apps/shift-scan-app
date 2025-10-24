"use client";

import React from "react";
import { usePermissions } from "@/app/context/PermissionsContext";
import { useTranslations } from "next-intl";

export default function PermissionsManager() {
  const t = useTranslations("Settings");
  const { permissions, requestCameraPermission, requestLocationPermission } =
    usePermissions();

  const handleCameraPermission = async () => {
    if (!permissions.camera) {
      await requestCameraPermission();
    }
  };

  const handleLocationPermission = async () => {
    if (!permissions.location) {
      await requestLocationPermission();
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
        <div>
          <h3 className="font-semibold">{t("Camera")}</h3>
          <p className="text-sm text-gray-500">
            {permissions.camera ? t("Granted") : t("NotGranted")}
          </p>
        </div>
        <button
          onClick={handleCameraPermission}
          className={`px-4 py-2 rounded-lg ${
            permissions.camera
              ? "bg-green-100 text-green-800"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={permissions.camera}
        >
          {permissions.camera ? t("Enabled") : t("Enable")}
        </button>
      </div>

      <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
        <div>
          <h3 className="font-semibold">{t("Location")}</h3>
          <p className="text-sm text-gray-500">
            {permissions.location ? t("Granted") : t("NotGranted")}
          </p>
        </div>
        <button
          onClick={handleLocationPermission}
          className={`px-4 py-2 rounded-lg ${
            permissions.location
              ? "bg-green-100 text-green-800"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={permissions.location}
        >
          {permissions.location ? t("Enabled") : t("Enable")}
        </button>
      </div>
    </div>
  );
}
