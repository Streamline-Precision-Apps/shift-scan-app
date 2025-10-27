"use client";
import { useState, useEffect } from "react";

export type userInfo = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  username: string;
  DOB: string | null;
  image: string | null;
  email: string | null;
  terminationDate: string | null;
  truckView: boolean;
  tascoView: boolean;
  mechanicView: boolean;
  laborView: boolean;
  permission: string;
  startDate: string | null;
  Contact: {
    phoneNumber: string | null;
    emergencyContact: string | null;
    emergencyContactNumber: string | null;
  };
  Crews: { id: string; name: string; leadId: string }[];
};

export interface CrewData {
  id: string;
  name: string;
  leadId: string;
  crewType: "MECHANIC" | "TRUCK_DRIVER" | "LABOR" | "TASCO" | "";
  Users: { id: string; firstName: string; lastName: string }[];
}

export const useUserData = ({ userid }: { userid: string }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [crew, setCrew] = useState<CrewData[]>([]);
  const [userData, setUserData] = useState<userInfo>({} as userInfo);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/employeeInfo/${userid}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch personnel details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userid]);

  useEffect(() => {
    const fetchCrews = async () => {
      const response = await fetch("/api/getAllCrews", {
        next: { tags: ["crews"] },
      });
      const data = await response.json();
      setCrew(data || []);
    };
    fetchCrews();
  }, []);

  return {
    userData,
    setUserData,
    loading,
    crew,
    setCrew,
  };
};
