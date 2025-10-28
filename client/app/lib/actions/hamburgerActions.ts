"use client";

import { useUserStore } from "@/app/lib/store/userStore";
import { apiRequest, getToken, getUserId } from "../utils/api-Utils";

type UserSettings = {
  userId: string;
  // Contact fields
  phoneNumber?: string;
  email?: string;
  emergencyContact?: string;
  emergencyContactNumber?: string;
  // Settings fields
  language?: string;
  personalReminders?: boolean;
  generalReminders?: boolean;
  cameraAccess?: boolean;
  locationAccess?: boolean;
  cookiesAccess?: boolean;
};

/**
 * Update user settings, contact info, and user data via API and sync with localStorage store
 */
export async function updateSettings(settings: UserSettings) {
  try {
    // Send all fields to the API - backend controller will route them to appropriate models
    await apiRequest("/api/v1/user/settings", "PUT", settings);

    // Update the user store to keep localStorage in sync
    const store = useUserStore.getState();
    if (store.user) {
      // Update user fields if provided
      const updatedUser = { ...store.user };
      if (settings.email !== undefined) {
        updatedUser.email = settings.email;
      }
      if (settings.phoneNumber !== undefined && updatedUser.Contact) {
        updatedUser.Contact.phoneNumber = settings.phoneNumber;
      }
      if (settings.emergencyContact !== undefined && updatedUser.Contact) {
        updatedUser.Contact.emergencyContact = settings.emergencyContact;
      }
      if (
        settings.emergencyContactNumber !== undefined &&
        updatedUser.Contact
      ) {
        updatedUser.Contact.emergencyContactNumber =
          settings.emergencyContactNumber;
      }
      store.setUser(updatedUser);
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

export async function setUserPassword(formData: FormData) {
  try {
    if (!formData) {
      throw new Error("Invalid credentials");
    }
    const id = formData.get("id") as string;
    const password = formData.get("password") as string;
    const token = getToken();
    const userId = getUserId();
    // check that they have a token and that its the correct user
    if (!token || userId !== id) {
      throw new Error("Invalid credentials");
    }

    if (!password) {
      throw new Error("No Password provided to update");
    }

    await apiRequest(`/api/v1/user/${id}`, "PUT", {
      password: password,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user signature:", error);
    return { success: false };
  }
}
