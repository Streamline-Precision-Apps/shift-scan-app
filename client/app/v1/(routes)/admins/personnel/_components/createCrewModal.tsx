"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createCrew } from "@/actions/adminActions";
import { WorkType } from "../../../../../../prisma/generated/prisma";
import Spinner from "@/components/(animations)/spinner";
import { CrewMemberCheckboxList } from "./CrewMemberCheckboxList";
import {
  SingleCombobox,
  ComboboxOption,
} from "@/components/ui/single-combobox";

type User = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  permission: string;
  terminationDate: Date | null;
};

export interface CrewData {
  name: string;
  leadId: string;
  crewType: WorkType | "";
  Users: {
    id: string;
  }[];
}

export default function CreateCrewModal({
  cancel,
  rerender,
}: {
  cancel: () => void;
  rerender: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CrewData>({
    name: "",
    leadId: "",
    crewType: "",
    Users: [],
  });

  useEffect(() => {
    // Fetch users from the server or context
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/getAllEmployees?filter=all");
        const data = await response.json();
        setUsers(data as User[]);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Create user options for the combobox
  const userOptions = users.map((user) => ({
    value: user.id,
    label:
      `${user.firstName ? `${user.firstName}` : ""}${user.middleName ? ` ${user.middleName}` : ""}${user.lastName ? ` ${user.lastName}` : ""}${user.secondLastName ? ` ${user.secondLastName}` : ""}`.trim(),
  }));

  // Helper to ensure lead is always in Users
  const ensureLeadInUsers = (leadId: string, users: { id: string }[]) => {
    if (!leadId) return users;
    if (!users.some((u) => u.id === leadId)) {
      return [...users, { id: leadId }];
    }
    return users;
  };

  const handleCreatePersonnel = async () => {
    setSubmitting(true);
    try {
      // Basic validation
      if (
        !formData.name.trim() ||
        !formData.leadId.trim() ||
        !formData.crewType.trim() ||
        formData.Users.length === 0
      ) {
        toast.error("Please fill in all required fields.", { duration: 3000 });
        setSubmitting(false);
        return;
      }

      // Prepare payload
      const formD = new FormData();
      // Always ensure lead is in Users before submit
      const usersWithLead = ensureLeadInUsers(formData.leadId, formData.Users);
      formD.append("name", formData.name);
      formD.append("leadId", formData.leadId);
      formD.append("crewType", formData.crewType);
      formD.append("Users", JSON.stringify(usersWithLead));

      // TODO: Replace with correct personnel creation action if available
      const result = await createCrew(formD);
      if (result.success) {
        toast.success("Personnel created successfully!", { duration: 3000 });
        rerender();
        cancel();
      } else {
        toast.error("Failed to create personnel", { duration: 3000 });
      }
    } catch (error) {
      toast.error("Failed to create personnel", { duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg max-w-[1000px] w-full max-h-[80vh] overflow-y-auto no-scrollbar p-8 flex flex-col items-center">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Create Crew</h2>
              <p className="text-xs text-gray-600">
                Fill in the details to create a new crew.
              </p>
              <p className="text-xs text-red-500">
                All fields marked with * are required
              </p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-[1000px] w-full max-h-[80vh] overflow-y-auto no-scrollbar p-8 flex flex-col items-center relative">
        {/* Loading overlay when submitting */}
        {submitting && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg z-10">
            <Spinner />
          </div>
        )}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Create Crew</h2>
            <p className="text-xs text-gray-600">
              Fill in the details to create a new crew.
            </p>
            <p className="text-xs text-red-500">
              All fields marked with * are required
            </p>
          </div>
          <form
            className="flex flex-col gap-8 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreatePersonnel();
            }}
          >
            <div className="flex flex-row flex-wrap gap-8 md:flex-nowrap">
              {/* Left: User creation fields */}
              <div className="flex-1 min-w-[280px] flex flex-col gap-4">
                <div>
                  <Label htmlFor="name">
                    Crew Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="crewType">
                    Crew Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.crewType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        crewType: value as
                          | "MECHANIC"
                          | "TRUCK_DRIVER"
                          | "LABOR"
                          | "TASCO"
                          | "",
                      }))
                    }
                  >
                    <SelectTrigger
                      className="w-full text-xs"
                      id="crewType"
                      name="crewType"
                    >
                      <SelectValue placeholder="Select a crew type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MECHANIC" className="text-xs">
                        Mechanic
                      </SelectItem>
                      <SelectItem value="TRUCK_DRIVER" className="text-xs">
                        Truck Driver
                      </SelectItem>
                      <SelectItem value="LABOR" className="text-xs">
                        Labor
                      </SelectItem>
                      <SelectItem value="TASCO" className="text-xs">
                        Tasco
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <SingleCombobox
                    label="Crew Lead"
                    options={users
                      .filter((user) => user.permission !== "USER")
                      .map(
                        (user): ComboboxOption => ({
                          value: user.id,
                          label: `${user.firstName} ${user.lastName}${user.middleName ? ` ${user.middleName}` : ""}${user.secondLastName ? ` ${user.secondLastName}` : ""}${user.permission ? ` (${user.permission})` : ""}`,
                          firstName: user.firstName,
                          lastName: user.lastName,
                          middleName: user.middleName || "",
                          permission: user.permission,
                        }),
                      )}
                    value={formData.leadId}
                    onChange={(value) => {
                      setFormData((prev) => {
                        // Remove previous lead from Users if present
                        let updatedUsers = prev.Users.filter(
                          (u) => u.id !== prev.leadId,
                        );
                        // Add new lead if not present
                        if (value) {
                          if (!updatedUsers.some((u) => u.id === value)) {
                            updatedUsers = [...updatedUsers, { id: value }];
                          }
                        }
                        return { ...prev, leadId: value, Users: updatedUsers };
                      });
                    }}
                    placeholder="Search and select a crew lead"
                    filterKeys={[
                      "firstName",
                      "lastName",
                      "middleName",
                      "permission",
                    ]}
                    required={true}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[280px] flex flex-col gap-6">
                <div>
                  <Label>
                    Select Crew Members <span className="text-red-500">*</span>
                  </Label>
                  <CrewMemberCheckboxList
                    options={userOptions}
                    value={formData.Users.map((u) => u.id)}
                    onChange={(selectedIds: string[]) => {
                      setFormData((prev) => ({
                        ...prev,
                        Users: selectedIds.map((id) => ({ id })),
                      }));
                    }}
                    placeholder="Search crew members..."
                    leadId={formData.leadId}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-2 w-full mt-4">
              <div className="flex flex-row justify-end gap-2 w-full">
                <Button
                  variant="outline"
                  type="button"
                  onClick={cancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded"
                  disabled={submitting}
                >
                  Create Crew
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
