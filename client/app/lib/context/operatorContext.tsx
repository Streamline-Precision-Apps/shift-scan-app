"use client";
import { setEquipment } from "@/app/lib/actions/cookieActions";
import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { apiRequest } from "../utils/api-Utils";

type EquipmentIdProps = {
  equipmentId: string | null;
  setEquipmentId: (equipmentId: string | null) => void;
};

const EquipmentData = createContext<EquipmentIdProps | undefined>(undefined);

export const EquipmentIdProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [equipmentId, setEquipmentId] = useState<string | null>(null);

  // Load initial state from localStorage if available
  useEffect(() => {
    const initializeEquipment = async () => {
      try {
        // Fetch cookie data once during initialization
        const previousTruck = await apiRequest(
          "/api/cookies?name=equipment",
          "GET"
        );

        if (previousTruck && previousTruck !== "") {
          setEquipmentId(previousTruck);
        }
      } catch (error) {
        console.error("Error fetching job site cookie:", error);
      }
    };

    initializeEquipment();
  }, []); // Run only on mount

  useEffect(() => {
    const saveEquipmentId = async () => {
      // Renamed function
      try {
        if (equipmentId !== "") {
          await setEquipment(equipmentId || ""); // Set the cookie if equipmentId changes
        }
      } catch (error) {
        console.error("Error saving equipment cookie:", error);
      }
    };
    saveEquipmentId();
  }, [equipmentId]);

  return (
    <EquipmentData.Provider value={{ equipmentId, setEquipmentId }}>
      {children}
    </EquipmentData.Provider>
  );
};

export const useOperator = () => {
  const context = useContext(EquipmentData);
  if (!context) {
    throw new Error("useOperator must be used within a EquipmentIdProvider"); // Updated error message
  }
  return context;
};
