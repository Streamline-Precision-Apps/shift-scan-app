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
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Permission } from "../../../../../../prisma/generated/prisma";

// Utility function to get allowed permissions based on current user's permission level
const getAllowedPermissions = (currentUserPermission: string): string[] => {
  const permissionHierarchy = ["USER", "MANAGER", "ADMIN", "SUPERADMIN"];
  const currentIndex = permissionHierarchy.indexOf(currentUserPermission);

  if (currentIndex === -1) return ["USER"]; // Default fallback

  // User can only assign permissions equal to or lower than their own
  return permissionHierarchy.slice(0, currentIndex + 1);
};
import { useUserData } from "./useUserData";
import Spinner from "@/components/(animations)/spinner";
import { editUserAdmin } from "@/actions/adminActions";

export default function EditUserModal({
  cancel,
  rerender,
  pendingEditId,
}: {
  cancel: () => void;
  rerender: () => void;
  pendingEditId: string;
}) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const { userData, setUserData, loading, crew } = useUserData({
    userid: pendingEditId,
  });

  // Get allowed permissions based on current user's permission level
  const allowedPermissions = session?.user?.permission
    ? getAllowedPermissions(session.user.permission)
    : ["USER"];

  // Check if the user being edited has a permission level higher than what current user can assign
  const isEditingHigherPermissionUser = userData?.permission
    ? !allowedPermissions.includes(userData.permission)
    : false;

  const handleEditUser = async () => {
    setSubmitting(true);
    const result = await editUserAdmin({
      id: userData.id,
      terminationDate: userData.terminationDate,
      username: userData.username,
      firstName: userData.firstName,
      middleName: userData.middleName,
      lastName: userData.lastName,
      secondLastName: userData.secondLastName,
      permission: userData.permission,
      truckView: userData.truckView,
      tascoView: userData.tascoView,
      mechanicView: userData.mechanicView,
      laborView: userData.laborView,
      crews: userData.Crews,
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("User updated successfully", { duration: 3000 });
      rerender();
      cancel();
    } else {
      toast.error("Failed to update user", { duration: 3000 });
    }
  };

  if (loading || !userData || !crew) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg max-w-[1000px] w-full max-h-[80vh] overflow-y-auto no-scrollbar p-8 flex flex-col items-center">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Update User Information</h2>
              <p className="text-xs text-gray-600">
                Fill in the details to update the user information.
              </p>
              <p className="text-xs text-red-500">
                All fields marked with * are required
              </p>
            </div>
            <Spinner />
          </div>
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
            <h2 className="text-lg font-semibold">Update User Information</h2>
            <p className="text-xs text-gray-600">
              Fill in the details to update the user information.
            </p>
            <p className="text-xs text-red-500">
              All fields marked with * are required
            </p>
          </div>
          <form
            className="flex flex-col gap-8 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleEditUser();
            }}
          >
            <div className="flex flex-row flex-wrap gap-8 md:flex-nowrap">
              {/* Left: User creation fields */}
              <div className="flex-1 min-w-[280px] flex flex-col gap-4">
                <div>
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={userData.firstName}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
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
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    value={userData.middleName || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        middleName: e.target.value,
                      }))
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={userData.lastName}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
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
                  <Label htmlFor="secondLastName">Second Last Name</Label>
                  <Input
                    id="secondLastName"
                    name="secondLastName"
                    value={userData.secondLastName || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        secondLastName: e.target.value,
                      }))
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={userData.username}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeStatus">Employee Status</Label>
                  <Select
                    value={userData.terminationDate ? "inactive" : "active"}
                    onValueChange={(value) => {
                      if (value === "active") {
                        setUserData((prev) => ({
                          ...prev,
                          terminationDate: "",
                        }));
                      } else {
                        const today = new Date();
                        const iso = today.toISOString().split("T")[0];
                        setUserData((prev) => ({
                          ...prev,
                          terminationDate: iso,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right: Permissions, views, and crew assignment */}
              <div className="flex-1 min-w-[280px] flex flex-col gap-6">
                <div>
                  <Label htmlFor="permission">
                    Permission <span className="text-red-500">*</span>
                  </Label>
                  {isEditingHigherPermissionUser && (
                    <p className="text-xs text-orange-600 mb-1">
                      Cannot modify permission - This user has a higher access
                      level than yours
                    </p>
                  )}
                  <Select
                    value={userData.permission}
                    onValueChange={(value) =>
                      setUserData((prev) => ({ ...prev, permission: value }))
                    }
                    disabled={isEditingHigherPermissionUser}
                  >
                    <SelectTrigger id="permission" className="w-full text-xs">
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      {isEditingHigherPermissionUser ? (
                        // If editing a user with higher permissions, show their current permission but disabled
                        <SelectItem
                          key={userData.permission}
                          value={userData.permission}
                        >
                          {userData.permission} (Cannot modify - Higher access
                          level)
                        </SelectItem>
                      ) : (
                        allowedPermissions.map((perm: string) => (
                          <SelectItem key={perm} value={perm}>
                            {perm}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Label className="col-span-2 pb-2">
                    Select All Roles that Apply
                  </Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="truckView"
                      checked={userData.truckView}
                      onCheckedChange={(checked) =>
                        setUserData((prev) => ({
                          ...prev,
                          truckView: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="truckView">Trucking</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="tascoView"
                      checked={userData.tascoView}
                      onCheckedChange={(checked) =>
                        setUserData((prev) => ({
                          ...prev,
                          tascoView: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="tascoView">Tasco</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mechanicView"
                      checked={userData.mechanicView}
                      onCheckedChange={(checked) =>
                        setUserData((prev) => ({
                          ...prev,
                          mechanicView: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="mechanicView">Mechanic</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="laborView"
                      checked={userData.laborView}
                      onCheckedChange={(checked) =>
                        setUserData((prev) => ({
                          ...prev,
                          laborView: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="laborView">General</Label>
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-1">
                    Assign to Crews
                  </Label>
                  <div className="h-[350px] overflow-y-auto border rounded p-2 grid grid-cols-1 gap-2 bg-gray-50">
                    {crew.length === 0
                      ? Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))
                      : crew.map((c) => (
                          <label
                            key={c.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Checkbox
                              checked={
                                Array.isArray(userData.Crews) &&
                                userData.Crews.some((sel) => sel.id === c.id)
                              }
                              onCheckedChange={(checked) => {
                                setUserData((prev) => {
                                  const crews = Array.isArray(prev.Crews)
                                    ? prev.Crews
                                    : [];
                                  if (checked) {
                                    // Add crew if not already present
                                    if (!crews.some((sel) => sel.id === c.id)) {
                                      return {
                                        ...prev,
                                        Crews: [...crews, c],
                                      };
                                    }
                                    return prev;
                                  } else {
                                    // Remove crew if present
                                    return {
                                      ...prev,
                                      Crews: crews.filter(
                                        (sel) => sel.id !== c.id,
                                      ),
                                    };
                                  }
                                });
                              }}
                            />
                            {c.name}{" "}
                            <span className="italic text-gray-400">
                              ({c.crewType})
                            </span>
                          </label>
                        ))}
                  </div>
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
                  Update User
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
