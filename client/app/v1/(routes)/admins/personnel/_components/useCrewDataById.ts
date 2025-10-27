"use client";
import { useState, useEffect } from "react";
export interface CrewData {
  id: string;
  name: string;
  leadId: string;
  crewType: "MECHANIC" | "TRUCK_DRIVER" | "LABOR" | "TASCO" | "";
  createdAt: string;
  updatedAt: string;
  Users: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    secondLastName: string | null;
  }[];
}

export type User = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  permission: string;
};

export const useCrewDataById = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(false);
  const [crewData, setCrewData] = useState<CrewData | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const fetchCrewData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/getCrewByIdAdmin/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      setCrewData(data as CrewData);
    } catch (error) {
      console.error("Failed to fetch personnel details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrewMembers = async () => {
    try {
      const res = await fetch(`/api/getAllEmployees`);
      if (!res.ok) throw new Error("Failed to fetch crew members");
      const data = await res.json();
      setUsers(data as User[]);
    } catch (error) {
      console.error("Failed to fetch crew members:", error);
    }
  };

  useEffect(() => {
    fetchCrewMembers();
    fetchCrewData();
  }, [id]);

  // Utility function to update any field in crewData
  function updateCrewData<K extends keyof CrewData>(
    key: K,
    value: CrewData[K],
  ) {
    setCrewData((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  }

  return {
    loading,
    crewData,
    updateCrewData,
    setCrewData,
    users,
  };
};
