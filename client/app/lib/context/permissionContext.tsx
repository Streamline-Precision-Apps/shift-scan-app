"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { Camera } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";

type PermissionState = {
  camera: PermissionStatusString;
  location: PermissionStatusString;
};

type PermissionStatusString =
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale"
  | "unknown";

interface PermissionsContextType {
  requestCameraPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<{ success: boolean }>;
  resetCameraPermission: () => void;
  resetLocationPermission: () => void;
  permissionStatus: PermissionState;
  refreshPermissionStatus: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>({
    camera: "unknown",
    location: "unknown",
  });

  // Check permission status for camera and location
  const refreshPermissionStatus = useCallback(async () => {
    let cameraStatus: PermissionStatusString = "unknown";
    let locationStatus: PermissionStatusString = "unknown";
    try {
      const cameraPerm = await Camera.checkPermissions();
      cameraStatus = cameraPerm.camera as PermissionStatusString;
    } catch {
      cameraStatus = "unknown";
    }
    try {
      const locationPerm = await Geolocation.checkPermissions();
      locationStatus = locationPerm.location as PermissionStatusString;
    } catch {
      locationStatus = "unknown";
    }
    setPermissionStatus({ camera: cameraStatus, location: locationStatus });
  }, []);

  // On mount, check permissions
  useEffect(() => {
    refreshPermissionStatus();
  }, [refreshPermissionStatus]);

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      const result = await Camera.requestPermissions();
      await refreshPermissionStatus();
      return result.camera === "granted";
    } catch (error) {
      await refreshPermissionStatus();
      return false;
    }
  }, [refreshPermissionStatus]);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    try {
      const result = await Geolocation.requestPermissions();
      await refreshPermissionStatus();
      return { success: result.location === "granted" };
    } catch (error) {
      await refreshPermissionStatus();
      return { success: false };
    }
  }, [refreshPermissionStatus]);

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
        permissionStatus,
        refreshPermissionStatus,
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
