"use client";

import { apiRequest } from "@/app/lib/utils/api-Utils";

export async function updateEmployeeEquipmentLog({
  id,
  equipmentId,
  startTime,
  endTime,
  comment,
  status,
  disconnectRefuelLog,
  refuelLogId,
  gallonsRefueled,
}: {
  id: string;
  equipmentId: string;
  startTime: string;
  endTime?: string;
  comment?: string;
  status?: string;
  disconnectRefuelLog?: boolean;
  refuelLogId?: string | null;
  gallonsRefueled?: number | null;
}) {
  try {
    const body = {
      id,
      equipmentId,
      startTime,
      endTime,
      comment,
      status,
      disconnectRefuelLog,
      refuelLogId,
      gallonsRefueled,
    };
    const response = await apiRequest(
      `/api/v1/timesheet/equipment-log/${id}`,
      "PUT",
      body
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update equipment log");
    }
    return response;
  } catch (error) {
    console.error("Error updating employee equipment log:", error);
    throw new Error(`Failed to update employee equipment log: ${error}`);
  }
}
