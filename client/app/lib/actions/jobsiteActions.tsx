"use client";
import { apiRequest, apiRequestNoResCheck } from "../utils/api-Utils";

// Check if jobsite exists
export async function jobExists(qrCode: string) {
  try {
    // Assumes you have GET /api/v1/jobsite/qr/<qrId> endpoint
    const res = await apiRequestNoResCheck(
      `/api/v1/jobsite/qr/${qrCode}`,
      "GET"
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error checking if jobsite exists:", error);
    throw error;
  }
}

export async function createJobsite(formData: FormData) {
  // Convert FormData to plain object
  const body: Record<string, unknown> = {};
  formData.forEach((value, key) => (body[key] = value));
  return apiRequest("/api/v1/jobsite", "POST", body);
}

export async function updateJobsiteAPI(
  id: string,
  updates: Record<string, any>
) {
  return apiRequest(`/api/v1/jobsite/${id}`, "PUT", updates);
}

export async function sendJobsiteNotification(
  notification: Record<string, any>
) {
  return apiRequest("/api/notifications/send-multicast", "POST", notification);
}
