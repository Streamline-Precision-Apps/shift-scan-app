"use client";
import React, { createContext, useContext, useCallback } from "react";
import { Camera } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";

interface PermissionsContextType {
  requestCameraPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<{ success: boolean }>;
  resetCameraPermission: () => void;
  resetLocationPermission: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      // On iOS/Android, Camera.requestPermissions() will prompt the user
      const result = await Camera.requestPermissions();
      return result.camera === "granted";
    } catch (error) {
      return false;
    }
  }, []);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    try {
      const result = await Geolocation.requestPermissions();
      return { success: result.location === "granted" };
    } catch (error) {
      return { success: false };
    }
  }, []);

  // Reset camera permission (not directly possible, but can be used to clear app state)
  const resetCameraPermission = useCallback(() => {
    // No direct API to reset permissions; you can clear app state or show instructions
  }, []);

  // Reset location permission (not directly possible, but can be used to clear app state)
  const resetLocationPermission = useCallback(() => {
    // No direct API to reset permissions; you can clear app state or show instructions
  }, []);

  return (
    <PermissionsContext.Provider
      value={{
        requestCameraPermission,
        requestLocationPermission,
        resetCameraPermission,
        resetLocationPermission,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};
