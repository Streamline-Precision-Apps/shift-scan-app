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

// Camera permission states per Capacitor docs: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied' | 'limited'
type CameraPermissionStatus =
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale"
  | "limited"
  | "unknown";

// Geolocation permission states
type LocationPermissionStatus =
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale"
  | "unknown";

type PermissionState = {
  camera: CameraPermissionStatus;
  photos: CameraPermissionStatus; // Separate permission for photo gallery
  location: LocationPermissionStatus;
};

interface PermissionsContextType {
  requestCameraPermission: () => Promise<boolean>;
  requestPhotosPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<{ success: boolean }>;

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
    photos: "unknown",
    location: "unknown",
  });

  // Check permission status for camera, photos, and location
  const refreshPermissionStatus = useCallback(async () => {
    let cameraStatus: CameraPermissionStatus = "unknown";
    let photosStatus: CameraPermissionStatus = "unknown";
    let locationStatus: LocationPermissionStatus = "unknown";

    // Check if we're on a native platform (iOS/Android)
    const isNative =
      typeof window !== "undefined" &&
      (window as any).Capacitor?.isNativePlatform?.();

    try {
      if (isNative) {
        const cameraPerm = await Camera.checkPermissions();
        cameraStatus =
          (cameraPerm.camera as CameraPermissionStatus) || "unknown";
        photosStatus =
          (cameraPerm.photos as CameraPermissionStatus) || "unknown";
      } else {
        // On web, check browser permissions
        try {
          const cameraPermission = await (navigator.permissions as any).query({
            name: "camera",
          });
          cameraStatus =
            (cameraPermission.state as CameraPermissionStatus) || "granted";
          photosStatus = "granted"; // Web file picker doesn't require explicit permission
        } catch {
          // Fallback for browsers that don't support permissions API
          cameraStatus = "granted";
          photosStatus = "granted";
        }
      }
    } catch (error) {
      console.error("Error checking camera permissions:", error);
      cameraStatus = "unknown";
      photosStatus = "unknown";
    }

    try {
      if (isNative) {
        const locationPerm = await Geolocation.checkPermissions();
        locationStatus =
          (locationPerm.location as LocationPermissionStatus) || "unknown";
      } else {
        // On web, location requires user to grant in browser
        locationStatus = "granted"; // Assume web users can grant if asked
      }
    } catch (error) {
      console.error("Error checking location permissions:", error);
      locationStatus = "unknown";
    }

    setPermissionStatus({
      camera: cameraStatus,
      photos: photosStatus,
      location: locationStatus,
    });
  }, []);

  // On mount, check permissions
  useEffect(() => {
    refreshPermissionStatus();
  }, [refreshPermissionStatus]);

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      // Check if we're on a native platform (iOS/Android)
      const isNative =
        typeof window !== "undefined" &&
        (window as any).Capacitor?.isNativePlatform?.();

      if (isNative) {
        // Native: Use Capacitor Camera API
        const result = await Camera.requestPermissions({
          permissions: ["camera"],
        });
        await refreshPermissionStatus();
        return result.camera === "granted";
      } else {
        // Web: Browser will handle camera permission when getUserMedia is called
        // Return true to proceed; the browser will show the permission prompt
        await refreshPermissionStatus();
        return true;
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      await refreshPermissionStatus();
      return false;
    }
  }, [refreshPermissionStatus]);

  // Request photos permission (for gallery/photo album access)
  const requestPhotosPermission = useCallback(async () => {
    try {
      // Check if we're on a native platform (iOS/Android)
      const isNative =
        typeof window !== "undefined" &&
        (window as any).Capacitor?.isNativePlatform?.();

      if (isNative) {
        // Native: Use Capacitor Camera API
        const result = await Camera.requestPermissions({
          permissions: ["photos"],
        });
        await refreshPermissionStatus();
        return result.photos === "granted" || result.photos === "limited";
      } else {
        // Web: File input doesn't require explicit permission
        // Browser handles file picker access automatically
        await refreshPermissionStatus();
        return true;
      }
    } catch (error) {
      console.error("Error requesting photos permission:", error);
      await refreshPermissionStatus();
      return false;
    }
  }, [refreshPermissionStatus]);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    try {
      // Check if we're on a native platform (iOS/Android)
      const isNative =
        typeof window !== "undefined" &&
        (window as any).Capacitor?.isNativePlatform?.();

      if (isNative) {
        // Native: Use Capacitor Geolocation API
        const result = await Geolocation.requestPermissions();
        await refreshPermissionStatus();
        return { success: result.location === "granted" };
      } else {
        // Web: Browser handles geolocation permission when getCurrentPosition is called
        await refreshPermissionStatus();
        return { success: true };
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      await refreshPermissionStatus();
      return { success: false };
    }
  }, [refreshPermissionStatus]);

  return (
    <PermissionsContext.Provider
      value={{
        requestCameraPermission,
        requestPhotosPermission,
        requestLocationPermission,
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
