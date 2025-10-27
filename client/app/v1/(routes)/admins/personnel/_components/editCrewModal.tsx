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
import { useState } from "react";
import { toast } from "sonner";
import Spinner from "@/components/(animations)/spinner";
import { useCrewDataById } from "./useCrewDataById";
import { CrewData } from "./useCrewDataById";
import { editCrew } from "@/actions/adminActions";
import { CrewMemberCheckboxList } from "./CrewMemberCheckboxList";
import {
  SingleCombobox,
  ComboboxOption,
} from "@/components/ui/single-combobox";

export default function EditCrewModal({
  cancel,
  rerender,
  pendingEditId,
}: {
  cancel: () => void;
  rerender: () => void;
  pendingEditId: string;
}) {
  const { loading, crewData, updateCrewData, users, setCrewData } =
    useCrewDataById({
      id: pendingEditId,
    });
  const [submitting, setSubmitting] = useState(false);
  // Helper to ensure lead is always in Users
  const ensureLeadInUsers = (leadId: string, usersArray: CrewData["Users"]) => {
    if (!leadId) return usersArray;

    // Check if lead is already in the users array
    const leadExists = usersArray.some((u) => u.id === leadId);
    if (leadExists) return usersArray;

    // Find lead user data from users array
    const leadUser = users.find((u) => u.id === leadId);
    if (!leadUser) {
      console.warn("Lead user not found in users array");
      return usersArray;
    }

    // Add lead to users array with all required fields
    return [
      ...usersArray,
      {
        id: leadUser.id,
        firstName: leadUser.firstName,
        middleName: leadUser.middleName,
        lastName: leadUser.lastName,
        secondLastName: leadUser.secondLastName,
      },
    ];
  };

  // Create user options for the combobox
  const userOptions = users
    ? users.map((user) => ({
        value: user.id,
        label:
          `${user.firstName ? `${user.firstName}` : ""}${user.middleName ? ` ${user.middleName}` : ""}${user.lastName ? ` ${user.lastName}` : ""}${user.secondLastName ? ` ${user.secondLastName}` : ""}`.trim(),
      }))
    : [];

  const handleUpdateCrew = async () => {
    setSubmitting(true);
    try {
      if (
        !crewData?.name.trim() ||
        !crewData?.leadId.trim() ||
        !crewData?.crewType.trim() ||
        crewData?.Users.length === 0
      ) {
        toast.error("Please fill in all required fields.", { duration: 3000 });
        setSubmitting(false);
        return;
      }

      // Prepare payload
      const formD = new FormData();

      // Ensure the lead is in the list of users
      const usersWithLead = ensureLeadInUsers(crewData.leadId, crewData.Users);

      // Simplify the user objects to just the ID for the API
      const simplifiedUsers = usersWithLead.map((user) => ({ id: user.id }));

      formD.append("id", pendingEditId);
      formD.append("name", crewData.name);
      formD.append("leadId", crewData.leadId);
      formD.append("crewType", crewData.crewType);
      formD.append("Users", JSON.stringify(simplifiedUsers));

      const result = await editCrew(formD);
      if (result.success) {
        toast.success("Crew updated successfully!", { duration: 3000 });
        rerender();
        cancel();
      } else {
        toast.error("Failed to update crew", { duration: 3000 });
      }
    } catch (error) {
      console.error("Error updating crew:", error);
      toast.error("Failed to update crew", { duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !crewData || !users) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg max-w-[1000px] w-full  max-h-[80vh] overflow-y-auto no-scrollbar p-8 flex flex-col items-center">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Edit Crew</h2>
              <p className="text-xs text-gray-600">
                Update the details for this crew.
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
            <h2 className="text-lg font-semibold">Edit Crew</h2>
            <p className="text-xs text-gray-600">
              Update the details for this crew.
            </p>
            <p className="text-xs text-red-500">
              All fields marked with * are required
            </p>
          </div>
          <form
            className="flex flex-col gap-8 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateCrew();
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
                    value={crewData?.name || ""}
                    onChange={(e) => updateCrewData("name", e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                    className="w-full text-xs"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="crewType">
                    Crew Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={crewData?.crewType}
                    onValueChange={(value) =>
                      updateCrewData(
                        "crewType",
                        value as
                          | "MECHANIC"
                          | "TRUCK_DRIVER"
                          | "LABOR"
                          | "TASCO"
                          | "",
                      )
                    }
                    disabled={loading}
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
                    value={crewData?.leadId || ""}
                    onChange={(value) => {
                      // Update the lead ID
                      updateCrewData("leadId", value);

                      // Ensure the new lead is also added to the crew members
                      setCrewData((prev) => {
                        if (!prev) return prev;

                        // Check if new lead is already in the crew
                        const leadAlreadyInCrew = prev.Users.some(
                          (u) => u.id === value,
                        );

                        if (!leadAlreadyInCrew && value) {
                          // Find the user data for the new lead
                          const leadUser = users?.find((u) => u.id === value);
                          if (leadUser) {
                            // Add the new lead to the crew members
                            const updatedUsers = [
                              ...prev.Users,
                              {
                                id: leadUser.id,
                                firstName: leadUser.firstName,
                                middleName: leadUser.middleName,
                                lastName: leadUser.lastName,
                                secondLastName: leadUser.secondLastName,
                              },
                            ];

                            return { ...prev, Users: updatedUsers };
                          }
                        }

                        return prev;
                      });
                    }}
                    placeholder="Search and select a crew lead"
                    filterKeys={[
                      "firstName",
                      "lastName",
                      "middleName",
                      "permission",
                    ]}
                    disabled={loading}
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
                    value={crewData?.Users?.map((u) => u.id) || []}
                    onChange={(selectedIds: string[]) => {
                      setCrewData((prev) => {
                        if (!prev) return prev;

                        // Ensure the lead is always included
                        const uniqueIds = new Set(selectedIds);
                        if (prev.leadId && !uniqueIds.has(prev.leadId)) {
                          uniqueIds.add(prev.leadId);
                        }

                        // Create updated users array with full user data
                        const updatedUsers = Array.from(uniqueIds).map((id) => {
                          const existingUser = prev.Users.find(
                            (u) => u.id === id,
                          );
                          if (existingUser) return existingUser;

                          // Find user data from users array
                          const userData = users?.find((u) => u.id === id);
                          return {
                            id: userData?.id || id,
                            firstName: userData?.firstName || "",
                            middleName: userData?.middleName || null,
                            lastName: userData?.lastName || "",
                            secondLastName: userData?.secondLastName || null,
                          };
                        });

                        return { ...prev, Users: updatedUsers };
                      });
                    }}
                    placeholder="Search crew members..."
                    leadId={crewData?.leadId}
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
                  disabled={submitting || loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded"
                  disabled={submitting || loading}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
