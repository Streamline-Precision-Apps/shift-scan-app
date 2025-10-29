// hooks/useEmployeeData.ts
import { useState, useEffect } from "react";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  email: string;
  DOB?: Date;
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
  employeeId: string | undefined,
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
        const response = await fetch(`/api/getUserInfo/${employeeId}`);
        if (!response.ok) {
          const message = `An error occurred: ${response.status}`;
          throw new Error(message);
        }
        const res = await response.json();

        // check dynamic status
        const statusRes = await fetch(`/api/userStatus/${employeeId}`);
        const statusData = await statusRes.json();

        if (res.employeeData) {
          res.employeeData.clockedIn = statusData.clockedIn;
        }

        setEmployee(res.employeeData);
        setContacts(res.contact);
      } catch (err) {
        console.error(err);
        setError(err as string);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  return { employee, contacts, loading, error };
};
