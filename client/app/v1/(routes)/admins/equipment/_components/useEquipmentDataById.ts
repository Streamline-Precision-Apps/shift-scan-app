"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * EquipmentVehicleInfo type for vehicle-specific info
 */
export interface EquipmentVehicleInfo {
  make: string;
  model: string;
  year: string;
}

/**
 * EquipmentSummary type for equipment/vehicle/truck/trailer asset
 */
export type Equipment = {
  id: string;
  qrId: string;
  code?: string;
  name: string;
  description: string;
  memo?: string;
  ownershipType?: "OWNED" | "LEASED" | "RENTAL";
  equipmentTag: "TRUCK" | "TRAILER" | "VEHICLE" | "EQUIPMENT";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT";
  state: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "NEEDS_REPAIR" | "RETIRED";
  isDisabledByAdmin: boolean;
  overWeight?: boolean;
  currentWeight?: number | null;
  createdById?: string;
  createdVia: string;
  createdAt: Date;
  updatedAt: Date;
  creationReason?: string;
  // Direct vehicle/equipment properties
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  serialNumber?: string;
  acquiredDate?: Date;
  acquiredCondition?: Date;
  licensePlate?: string;
  licenseState?: string;
  registrationExpiration?: Date;
};
export const useEquipmentDataById = (id: string) => {
  const [equipmentDetails, setEquipmentDetails] = useState<Equipment | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const rerender = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const fetchEquipmentSummaries = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/getEquipmentByEquipmentId/" + id);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        setEquipmentDetails(data);
      } catch (error) {
        console.error("Failed to fetch equipment details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentSummaries();
  }, [refreshKey]);

  return {
    equipmentDetails,
    setEquipmentDetails,
    loading,
    setLoading,
    rerender,
  };
};
