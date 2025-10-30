// hooks/useEmployeeData.ts
import { useState, useEffect } from "react";
import { apiRequestNoResCheck } from "@/app/lib/utils/api-Utils";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  email: string;
  DOB?: string | Date;
  clockedIn?: boolean;
};

type Contact = {
  phoneNumber: string;
  emergencyContact?: string;
  emergencyContactNumber?: string;
};

interface EmployeeDataResult {
  employee: Employee | null;
  contacts: Contact | null;
  loading: boolean;
  error: string | null; // Consider a more specific error type
}

export const useEmployeeData = (
  employeeId: string | undefined
): EmployeeDataResult => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [contacts, setContacts] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId) {
        return;
      }
      setLoading(true);
      setError(null);

      try {
        // Fetch employee info (profile + contact)
        const infoRes = await apiRequestNoResCheck(
          `/api/v1/user/${employeeId}/info`,
          "GET"
        );
        // Fetch online status
        const statusRes = await apiRequestNoResCheck(
          `/api/v1/user/${employeeId}/online`,
          "GET"
        );

        // Parse JSON from both responses
        const infoJson = await infoRes.json();
        const statusJson = await statusRes.json();

        // infoJson: { success, data: { employeeData, contact }, message }
        // statusJson: { success, data: { id, clockedIn }, message }
        let employeeData = infoJson.data?.employeeData;
        if (employeeData && statusJson?.data) {
          employeeData.clockedIn = statusJson.data.clockedIn;
        }
        setEmployee(employeeData);
        setContacts(infoJson.data?.contact);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  return { employee, contacts, loading, error };
};
