"use client";

import { useUserStore } from "@/app/lib/store/userStore";
import { apiRequest } from "../utils/api-Utils";

type UserSettings = {
  userId: string;
  language?: string;
  personalReminders?: boolean;
  generalReminders?: boolean;
  cameraAccess?: boolean;
  locationAccess?: boolean;
  cookiesAccess?: boolean;
};

/**
 * Update user settings via API and sync with localStorage store
 */
export async function updateSettings(settings: UserSettings) {
  try {
    await apiRequest("/api/v1/user/settings", "PUT", settings);

    // Update the user store to keep localStorage in sync
    const store = useUserStore.getState();
    if (store.user) {
      store.setUserSettings(settings);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return { success: false };
  }
}

export async function updateUserImage(id: string, imageUrl: string) {
  try {
    if (!id || !imageUrl) {
      throw new Error("Invalid credentials");
    }

    await apiRequest(`/api/v1/user/${id}`, "PUT", {
      image: imageUrl,
    });

    // Update the user store to keep localStorage in sync
    const store = useUserStore.getState();
    if (store.user) {
      store.setUser({ ...store.user, image: imageUrl });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user image URL:", error);
    return { success: false };
  }
}

export async function updateUserSignature(id: string, imageUrl: string) {
  try {
    if (!id || !imageUrl) {
      throw new Error("Invalid credentials");
    }

    const response = await apiRequest(`/api/v1/user/${id}`, "PUT", {
      signature: imageUrl,
    });

    // Update the user store to keep localStorage in sync
    const store = useUserStore.getState();
    if (store.user) {
      store.setUser({ ...store.user, signature: imageUrl });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user signature:", error);
    return { success: false };
  }
}
