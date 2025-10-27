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
import { createUserAdmin } from "@/actions/adminActions";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/(animations)/spinner";

// Utility function to get allowed permissions based on current user's permission level
const getAllowedPermissions = (currentUserPermission: string): string[] => {
  const permissionHierarchy = ["USER", "MANAGER", "ADMIN", "SUPERADMIN"];
  const currentIndex = permissionHierarchy.indexOf(currentUserPermission);

  if (currentIndex === -1) return ["USER"]; // Default fallback

  // User can only assign permissions equal to or lower than their own
  return permissionHierarchy.slice(0, currentIndex + 1);
};

interface CreatePersonnel {
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  password: string;
  terminationDate: string; // ISO string for input compatibility
  permission: string;
  truckView: boolean;
  tascoView: boolean;
  mechanicView: boolean;
  laborView: boolean;
  crews: {
    id: string;
  }[];
}

export interface CrewData {
  id: string;
  name: string;
  leadId: string;
  crewType: "MECHANIC" | "TRUCK_DRIVER" | "LABOR" | "TASCO" | "";
  Users: { id: string; firstName: string; lastName: string }[];
}

export default function CreateUserModal({
  cancel,
  rerender,
}: {
  cancel: () => void;
  rerender: () => void;
}) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [crew, setCrew] = useState<CrewData[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Get allowed permissions based on current user's permission level
  const allowedPermissions = session?.user?.permission
    ? getAllowedPermissions(session.user.permission)
    : ["USER"];
  const [formData, setFormData] = useState<CreatePersonnel>({
    username: "",
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    password: "",
    terminationDate: "",
    permission: "",
    truckView: false,
    tascoView: false,
    mechanicView: false,
    laborView: false,
    crews: [],
  });

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

  const handleCreatePersonnel = async () => {
    setSubmitting(true);
    try {
      // Basic validation
      if (
        !formData.username.trim() ||
        !formData.firstName.trim() ||
        !formData.lastName.trim() ||
        !formData.password.trim() ||
        !formData.permission.trim()
      ) {
        toast.error("Please fill in all required fields.", { duration: 3000 });
        setSubmitting(false);
        return;
      }

      // Prepare payload
      const payload = {
        ...formData,
        terminationDate: formData.terminationDate
          ? new Date(formData.terminationDate)
          : null,
        createdById: session?.user.id ?? "",
      };

      // TODO: Replace with correct personnel creation action if available
      const result = await createUserAdmin(payload);
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
            <h2 className="text-lg font-semibold">Create Personnel</h2>
            <p className="text-xs text-gray-600">
              Fill in the details to create a new personnel/user.
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
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
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
                    value={formData.middleName}
                    onChange={(e) =>
                      setFormData((prev) => ({
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
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
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
                    value={formData.secondLastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
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
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
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
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      required
                      className="w-full text-xs"
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      size={"icon"}
                      tabIndex={-1}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-600 focus:outline-none rounded-lg"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <img
                        src={showPassword ? "/eye-blue.svg" : "/eye.svg"}
                        alt={showPassword ? "Hide password" : "Show password"}
                        className="w-5 h-5"
                      />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="employeeStatus">Employee Status</Label>
                  <Select
                    value={formData.terminationDate ? "inactive" : "active"}
                    onValueChange={(value) => {
                      if (value === "active") {
                        setFormData((prev) => ({
                          ...prev,
                          terminationDate: "",
                        }));
                      } else {
                        const today = new Date();
                        const iso = today.toISOString().split("T")[0];
                        setFormData((prev) => ({
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
                  <p className="text-xs text-gray-600 mb-1">
                    You can only assign permission levels equal to or lower than
                    your current level (
                    {allowedPermissions[allowedPermissions.length - 1] ||
                      "USER"}
                    )
                  </p>
                  <Select
                    value={formData.permission}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, permission: value }))
                    }
                  >
                    <SelectTrigger id="permission" className="w-full text-xs">
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedPermissions.map((perm: string) => (
                        <SelectItem key={perm} value={perm}>
                          {perm}
                        </SelectItem>
                      ))}
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
                      checked={formData.truckView}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
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
                      checked={formData.tascoView}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
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
                      checked={formData.mechanicView}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
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
                      checked={formData.laborView}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
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
                              checked={formData.crews.some(
                                (sel) => sel.id === c.id,
                              )}
                              onCheckedChange={(checked) => {
                                setFormData((prev) => {
                                  const already = prev.crews.some(
                                    (sel) => sel.id === c.id,
                                  );
                                  return {
                                    ...prev,
                                    crews: checked
                                      ? [...prev.crews, { id: c.id }]
                                      : prev.crews.filter(
                                          (sel) => sel.id !== c.id,
                                        ),
                                  };
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
                  Create Personnel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
