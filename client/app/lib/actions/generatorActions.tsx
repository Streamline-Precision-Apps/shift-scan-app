"use client";
import { apiRequest, apiRequestNoResCheck } from "../utils/api-Utils";

// Jobsite portion of actions
//-------------------------------------------------
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
export async function sendNotification(notification: Record<string, unknown>) {
  return apiRequest("/api/notifications/send-multicast", "POST", notification);
}

// Equipment portion of actions
//-------------------------------------------------

export async function equipmentTagExists(qrCode: string) {
  try {
    // Assumes you have GET /api/v1/equipment/qr/<qrId> endpoint
    const res = await apiRequestNoResCheck(
      `/api/v1/equipment/qr/${qrCode}`,
      "GET"
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error checking if equipment tag exists:", error);
    throw error;
  }
}

// Create equipment
export async function createEquipment(formData: FormData) {
  // Convert FormData to plain object
  const body: Record<string, unknown> = {};
  formData.forEach((value, key) => (body[key] = value));
  // Map frontend keys to backend expected keys if needed
  body["name"] = formData.get("temporaryEquipmentName") as string;
  body["creationReason"] = formData.get("creationReasoning") as string;
  body["qrId"] = formData.get("eqCode") as string;
  // description is optional, default to empty string if not present
  if (!body["description"]) body["description"] = "";
  return apiRequest("/api/v1/equipment", "POST", body);
}
