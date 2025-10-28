"use client";

import { apiRequest, getApiUrl, getToken } from "../utils/api-Utils";

// Accepts contact info and settings, updates User, Contacts, and UserSettings as needed
export async function updateSettings(data: {
  userId: string;
  phoneNumber?: string;
  email?: string;
  emergencyContact?: string;
  emergencyContactNumber?: string;
  language?: string;
  generalReminders?: boolean;
  personalReminders?: boolean;
  cameraAccess?: boolean;
  locationAccess?: boolean;
  cookiesAccess?: boolean;
}) {
  const { userId, ...rest } = data;
  await apiRequest("/api/v1/user/settings", "PUT", { userId, ...rest });
}

export async function createFormSubmission(formData: FormData) {
  const token = getToken();
  const url = `${getApiUrl()}/api/v1/forms/submission`;
  const body: Record<string, any> = {};
  formData.forEach((value, key) => {
    body[key] = value;
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteFormSubmission(id: number) {
  await apiRequest(`/api/v1/forms/submission/${id}`, "DELETE", {});
  return true;
}

export async function saveDraft(
  formData: Record<string, string>,
  formTemplateId: string,
  userId: string,
  formType?: string,
  submissionId?: number,
  title?: string
) {
  const body = {
    formData,
    formTemplateId,
    userId,
    formType,
    submissionId,
    title,
  };
  return apiRequest("/api/v1/forms/draft", "POST", body);
}

export async function saveDraftToPending(
  formData: Record<string, string>,
  isApprovalRequired: boolean,
  formTemplateId: string,
  userId: string,
  formType?: string,
  submissionId?: number,
  title?: string
) {
  const body = {
    formData,
    isApprovalRequired,
    formTemplateId,
    userId,
    formType,
    submissionId,
    title,
  };
  return apiRequest("/api/v1/forms/draft-to-pending", "POST", body);
}

export async function savePending(
  formData: Record<string, string>,
  formTemplateId: string,
  userId: string,
  formType?: string,
  submissionId?: number,
  title?: string
) {
  const body = {
    formData,
    formTemplateId,
    userId,
    formType,
    submissionId,
    title,
  };
  return apiRequest("/api/v1/forms/pending", "POST", body);
}

export async function createFormApproval(
  formData: FormData,
  approval: "APPROVED" | "DENIED"
) {
  const token = getToken();
  const url = `${getApiUrl()}/api/v1/forms/approval`;
  const body: Record<string, any> = { approval };
  formData.forEach((value, key) => {
    body[key] = value;
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateFormApproval(formData: FormData) {
  const token = getToken();
  const url = `${getApiUrl()}/api/v1/forms/approval/update`;
  const body: Record<string, any> = {};
  formData.forEach((value, key) => {
    body[key] = value;
  });
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
