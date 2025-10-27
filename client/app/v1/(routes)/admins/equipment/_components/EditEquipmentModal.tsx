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
import { useEquipmentDataById } from "./useEquipmentDataById";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SquareCheck, SquareXIcon, X } from "lucide-react";
import { format } from "date-fns";
import { updateEquipmentAsset } from "@/actions/AssetActions";
import { toast } from "sonner";
import { useDashboardData } from "../../_pages/sidebar/DashboardDataContext";
import Spinner from "@/components/(animations)/spinner";
import { Skeleton } from "@/components/ui/skeleton";

type Equipment = {
  id: string;
  qrId: string;
  code?: string;
  name: string;
  description: string;
  memo?: string;
  ownershipType?: "OWNED" | "LEASED" | "RENTAL";
  equipmentTag: "TRUCK" | "TRAILER" | "VEHICLE" | "EQUIPMENT";
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT";
  state: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "NEEDS_REPAIR" | "RETIRED";
  createdAt: string | Date;
  updatedAt: string | Date;
  // Direct vehicle/equipment properties
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  serialNumber?: string;
  acquiredDate?: string | Date;
  acquiredCondition?: "NEW" | "USED";
  licensePlate?: string;
  licenseState?: string;
  registrationExpiration?: string | Date;
  createdVia?: "MOBILE" | "WEB" | "IMPORT";
  overWeight?: boolean;
  currentWeight?: number;
  creationReason?: string;
  createdById?: string;
  createdBy: {
    firstName?: string;
    lastName?: string;
  };
};

export default function EditEquipmentModal({
  cancel,
  pendingEditId,
  rerender,
}: {
  cancel: () => void;
  pendingEditId: string;
  rerender: () => void;
}) {
  const { refresh } = useDashboardData();
  const { equipmentDetails, loading } = useEquipmentDataById(pendingEditId);
  const [formData, setFormData] = useState<Equipment | null>(null);
  const [originalForm, setOriginalForm] = useState<Equipment | null>(null);

  useEffect(() => {
    if (equipmentDetails) {
      setFormData(equipmentDetails as unknown as Equipment);
      setOriginalForm(equipmentDetails as unknown as Equipment);
    }
  }, [equipmentDetails]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              type === "number" ? (value === "" ? null : Number(value)) : value,
          }
        : prev,
    );
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSaveChanges = async () => {
    if (!formData || !originalForm) return;

    try {
      const fd = new FormData();

      const changedFields: Record<string, unknown> = {};

      // Required ID
      fd.append("id", formData.id);
      changedFields["id"] = formData.id;

      // Only append fields that have changed
      if (formData.name !== originalForm.name) {
        fd.append("name", formData.name);
        changedFields["name"] = formData.name;
      }

      if (formData.code !== originalForm.code) {
        fd.append("code", formData.code || "");
        changedFields["code"] = formData.code;
      }

      if (formData.description !== originalForm.description) {
        fd.append("description", formData.description || "");
        changedFields["description"] = formData.description;
      }

      if (formData.memo !== originalForm.memo) {
        fd.append("memo", formData.memo || "");
        changedFields["memo"] = formData.memo;
      }

      if (formData.equipmentTag !== originalForm.equipmentTag) {
        fd.append("equipmentTag", formData.equipmentTag);
        changedFields["equipmentTag"] = formData.equipmentTag;
      }

      if (formData.ownershipType !== originalForm.ownershipType) {
        fd.append("ownershipType", formData.ownershipType || "");
        changedFields["ownershipType"] = formData.ownershipType;
      }

      if (formData.make !== originalForm.make) {
        fd.append("make", formData.make || "");
        changedFields["make"] = formData.make;
      }

      if (formData.model !== originalForm.model) {
        fd.append("model", formData.model || "");
        changedFields["model"] = formData.model;
      }

      if (formData.year !== originalForm.year) {
        fd.append("year", formData.year || "");
        changedFields["year"] = formData.year;
      }

      if (formData.color !== originalForm.color) {
        fd.append("color", formData.color || "");
        changedFields["color"] = formData.color;
      }

      if (formData.serialNumber !== originalForm.serialNumber) {
        fd.append("serialNumber", formData.serialNumber || "");
        changedFields["serialNumber"] = formData.serialNumber;
      }

      if (String(formData.acquiredDate) !== String(originalForm.acquiredDate)) {
        if (formData.acquiredDate) {
          fd.append(
            "acquiredDate",
            new Date(formData.acquiredDate).toISOString(),
          );
          changedFields["acquiredDate"] = new Date(
            formData.acquiredDate,
          ).toISOString();
        } else {
          fd.append("acquiredDate", "");
          changedFields["acquiredDate"] = "";
        }
      }

      if (formData.acquiredCondition !== originalForm.acquiredCondition) {
        fd.append("acquiredCondition", formData.acquiredCondition || "");
        changedFields["acquiredCondition"] = formData.acquiredCondition;
      }

      if (formData.licensePlate !== originalForm.licensePlate) {
        fd.append("licensePlate", formData.licensePlate || "");
        changedFields["licensePlate"] = formData.licensePlate;
      }

      if (formData.licenseState !== originalForm.licenseState) {
        fd.append("licenseState", formData.licenseState || "");
        changedFields["licenseState"] = formData.licenseState;
      }

      // Registration expiration is still in the API even if we removed it from UI
      if (
        String(formData.registrationExpiration) !==
        String(originalForm.registrationExpiration)
      ) {
        if (formData.registrationExpiration) {
          fd.append(
            "registrationExpiration",
            new Date(formData.registrationExpiration).toISOString(),
          );
          changedFields["registrationExpiration"] = new Date(
            formData.registrationExpiration,
          ).toISOString();
        } else {
          fd.append("registrationExpiration", "");
          changedFields["registrationExpiration"] = "";
        }
      }

      if (formData.currentWeight !== originalForm.currentWeight) {
        fd.append("currentWeight", String(formData.currentWeight || 0));
        changedFields["currentWeight"] = formData.currentWeight;
      }

      if (formData.overWeight !== originalForm.overWeight) {
        fd.append("overWeight", String(formData.overWeight || false));
        changedFields["overWeight"] = formData.overWeight;
      }

      if (formData.approvalStatus !== originalForm.approvalStatus) {
        fd.append("approvalStatus", formData.approvalStatus);
        changedFields["approvalStatus"] = formData.approvalStatus;
      }

      if (formData.status !== originalForm.status) {
        fd.append("status", formData.status);
        changedFields["status"] = formData.status;
      }

      if (formData.creationReason !== originalForm.creationReason) {
        fd.append("creationReason", formData.creationReason || "");
        changedFields["creationReason"] = formData.creationReason;
      }

      // Display changed fields in toast for debugging
      toast.info(`Updating ${Object.keys(changedFields).length - 1} fields`, {
        duration: 3000,
      }); // -1 for the ID field

      const result = await updateEquipmentAsset(fd);
      if (result?.success) {
        toast.success("Equipment updated successfully.", { duration: 3000 });
        cancel();
        refresh();
        rerender();
      } else {
        throw new Error(result?.message || "Failed to update equipment.");
      }
    } catch (err) {
      toast.error("Error updating equipment. Please try again.", {
        duration: 3000,
      });
      console.error(err);
    }
  };

  if (loading || !formData || !originalForm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg w-[600px] h-[80vh]  px-6 py-4 flex flex-col items-center">
          <div className="w-full flex flex-col border-b border-gray-100 pb-3 relative">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">{`Edit Equipment`}</h3>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex flex-row gap-2 items-center">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <div className="flex flex-row gap-2  justify-between items-center">
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant={"ghost"}
              size={"icon"}
              onClick={cancel}
              className="absolute top-0 right-0 cursor-pointer"
            >
              <X width={20} height={20} />
            </Button>
          </div>
          {/* Content - Form */}
          <div className="flex-1 w-full px-2 pb-10 overflow-y-auto no-scrollbar">
            <div className="flex flex-row items-center justify-center h-full">
              <Spinner />
            </div>
          </div>
          <div className="w-full flex flex-col justify-end gap-3 pt-4 border-t border-gray-100">
            <div className="flex flex-row justify-end gap-2 w-full">
              <Button
                variant="outline"
                size={"sm"}
                onClick={cancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size={"sm"}
                onClick={handleSaveChanges}
                className={`bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[600px] h-[80vh]  px-6 py-4 flex flex-col items-center">
        <div className="w-full flex flex-col border-b border-gray-100 pb-3 relative">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">{`Edit Equipment`}</h3>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex flex-row gap-2 items-center">
                <span
                  className={`w-fit text-xs px-2 py-1 ${
                    originalForm.approvalStatus === "APPROVED"
                      ? "text-green-600 bg-green-100 rounded-lg"
                      : originalForm.approvalStatus === "PENDING"
                        ? "text-sky-600 bg-sky-100 rounded-lg"
                        : "text-red-600 bg-red-100 rounded-lg"
                  }`}
                >
                  {originalForm.approvalStatus
                    .toLowerCase()
                    .slice(0, 1)
                    .toUpperCase() +
                    originalForm.approvalStatus.toLowerCase().slice(1)}
                </span>
                <span className=" bg-gray-100 rounded-lg text-gray-600 text-xs px-2 py-1">
                  {`Last updated: ${format(formData.updatedAt, "PP")}`}
                </span>
              </div>
              <div className="flex flex-row gap-2  justify-between items-center">
                <span className=" w-fit bg-gray-100 rounded-lg text-gray-600 text-xs px-2 py-1">
                  {`Created by: ${
                    formData.createdBy.firstName +
                      " " +
                      formData.createdBy.lastName || "System"
                  }
                `}
                </span>
                {/* <div className="flex flex-row items-center gap-2 ">
                  <p className="text-xs text-gray-600">
                    {formData.status === "ARCHIVED"
                      ? "Equipment Archived"
                      : "Equipment Active"}
                  </p>
                  <Switch
                    checked={!formData.status || formData.status !== "ARCHIVED"}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => ({
                        ...prev!,
                        status: checked ? "ACTIVE" : "ARCHIVED",
                      }));
                    }}
                  />
                </div> */}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant={"ghost"}
            size={"icon"}
            onClick={cancel}
            className="absolute top-0 right-0 cursor-pointer"
          >
            <X width={20} height={20} />
          </Button>
        </div>
        {/* Content - Form */}
        <div className="flex-1 w-full px-2 pb-10 overflow-y-auto no-scrollbar">
          {/* updated last and enable equipment */}

          <div className="flex flex-col  mt-4">
            {originalForm.approvalStatus === "PENDING" && (
              <div className="flex flex-col mb-4 p-4 border rounded-md bg-slate-50">
                <Label htmlFor="creationReason" className="text-sm">
                  Reason for creation
                </Label>
                <Textarea
                  name="creationReason"
                  value={formData.creationReason}
                  onChange={handleInputChange}
                  className="w-full text-xs bg-white"
                />
              </div>
            )}

            {/* Section: General Information */}
            <div className="space-y-2 mb-5">
              <h3 className="text-md font-semibold ">General Information</h3>
              <div className="border rounded-md bg-slate-50 p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label htmlFor="code" className="text-sm">
                      ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="code"
                      value={formData.code || ""}
                      onChange={handleInputChange}
                      className="w-full text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-sm">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full text-xs bg-white"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      className="w-full text-xs min-h-[80px] bg-white"
                      style={{ resize: "none" }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="memo" className="text-sm font-medium">
                      Memo
                    </Label>
                    <Textarea
                      name="memo"
                      value={formData.memo || ""}
                      onChange={handleInputChange}
                      className="w-full text-xs min-h-[60px] bg-white"
                      placeholder="Enter any additional notes..."
                      style={{ resize: "none" }}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="equipmentTag"
                      className="text-sm font-medium"
                    >
                      Equipment Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="equipmentTag"
                      value={formData.equipmentTag}
                      onValueChange={(value) =>
                        handleSelectChange(
                          "equipmentTag",
                          value as
                            | "TRUCK"
                            | "TRAILER"
                            | "VEHICLE"
                            | "EQUIPMENT",
                        )
                      }
                    >
                      <SelectTrigger className="text-xs bg-white">
                        <SelectValue placeholder="Select Equipment Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRUCK">Truck</SelectItem>
                        <SelectItem value="TRAILER">Trailer</SelectItem>
                        <SelectItem value="VEHICLE">Vehicle</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Ownership Information */}
            <div className="space-y-2 mb-5">
              <h3 className="text-md font-semibold ">Ownership Information</h3>

              <div className="border rounded-md p-4 bg-slate-50">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label
                      htmlFor="ownershipType"
                      className="text-sm font-medium"
                    >
                      Ownership Type
                    </Label>
                    <Select
                      name="ownershipType"
                      value={formData.ownershipType || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev!,
                          ownershipType: value as "OWNED" | "LEASED",
                        }))
                      }
                    >
                      <SelectTrigger className="text-xs bg-white">
                        <SelectValue placeholder="Select Ownership Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNED">Owned</SelectItem>
                        <SelectItem value="LEASED">Leased</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="acquiredDate"
                      className="text-sm font-medium"
                    >
                      Acquired Date
                    </Label>
                    <Input
                      type="date"
                      name="acquiredDate"
                      value={
                        formData.acquiredDate
                          ? new Date(formData.acquiredDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleInputChange}
                      className="w-full text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="acquiredCondition"
                      className="text-sm font-medium"
                    >
                      Acquired Condition
                    </Label>
                    <Select
                      name="acquiredCondition"
                      value={formData.acquiredCondition || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev!,
                          acquiredCondition: value as "NEW" | "USED",
                        }))
                      }
                    >
                      <SelectTrigger className="text-xs bg-white">
                        <SelectValue placeholder="Select Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="USED">Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Equipment Specifications */}
            <div className="space-y-2 mb-5">
              <h3 className="text-md font-semibold ">
                Equipment Specifications
              </h3>

              <div className="border rounded-md bg-slate-50 p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label htmlFor="make" className="text-sm font-medium">
                      Make
                    </Label>
                    <Input
                      type="text"
                      name="make"
                      value={formData.make || ""}
                      onChange={handleInputChange}
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model" className="text-sm font-medium">
                      Model
                    </Label>
                    <Input
                      type="text"
                      name="model"
                      value={formData.model || ""}
                      onChange={handleInputChange}
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-sm font-medium">
                      Year
                    </Label>
                    <Input
                      type="text"
                      name="year"
                      value={formData.year || ""}
                      onChange={handleInputChange}
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color" className="text-sm font-medium">
                      Color
                    </Label>
                    <Input
                      type="text"
                      name="color"
                      value={formData.color || ""}
                      onChange={handleInputChange}
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="serialNumber"
                      className="text-sm font-medium"
                    >
                      Serial Number
                    </Label>
                    <Input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber || ""}
                      onChange={handleInputChange}
                      className="text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: License Information */}
            <div className="space-y-2 mb-5">
              <h3 className="text-md font-semibold mb-3 border-b pb-2">
                License Information
              </h3>
              <div className="border rounded-md bg-slate-50 p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label
                      htmlFor="licensePlate"
                      className="text-sm font-medium"
                    >
                      License Number
                    </Label>
                    <Input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate || ""}
                      onChange={handleInputChange}
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="licenseState"
                      className="text-sm font-medium"
                    >
                      License State
                    </Label>
                    <Input
                      type="text"
                      name="licenseState"
                      value={formData.licenseState || ""}
                      onChange={handleInputChange}
                      className="text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Weight Information */}
            <div className="space-y-2 mb-5">
              <h3 className="text-md font-semibold mb-3 border-b pb-2">
                Weight Information
              </h3>
              <div className="border rounded-md bg-slate-50 p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label htmlFor="overWeight" className="text-sm">
                      Overweight Equipment
                    </Label>
                    <Select
                      name="overWeight"
                      value={formData.overWeight ? "true" : "false"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev!,
                          overWeight: value === "true",
                        }))
                      }
                    >
                      <SelectTrigger className="w-full text-xs bg-white">
                        <SelectValue placeholder="Select Overweight Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currentWeight" className="text-sm">
                      Current Weight (lbs)
                    </Label>
                    <Input
                      type="number"
                      name="currentWeight"
                      value={formData.currentWeight ?? ""}
                      onChange={handleInputChange}
                      className="text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer Section - Buttons */}
        <div className="w-full flex flex-col justify-end gap-3 pt-4 border-t border-gray-100">
          <div className="flex flex-row justify-end gap-2 w-full">
            {originalForm && originalForm.approvalStatus === "PENDING" && (
              <>
                <Button
                  size={"sm"}
                  type="button"
                  variant="outline"
                  className={`bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded ${
                    formData.approvalStatus !== "REJECTED"
                      ? "bg-opacity-50 "
                      : " border-red-800 hover:border-red-900 border-2"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, approvalStatus: "REJECTED" })
                  }
                  disabled={loading}
                >
                  {formData.approvalStatus === "REJECTED" ? "" : "Deny"}
                  {formData.approvalStatus === "REJECTED" && (
                    <SquareXIcon className="text-red-800" />
                  )}
                </Button>
                <Button
                  type="button"
                  size={"sm"}
                  variant="outline"
                  className={`bg-green-400 hover:bg-green-300 text-green-800 px-4 py-2 rounded ${
                    formData.approvalStatus !== "APPROVED"
                      ? "bg-opacity-50 "
                      : " border-green-800 hover:border-green-900 border-2"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, approvalStatus: "APPROVED" })
                  }
                  disabled={loading}
                >
                  <div className="flex flex-row items-center gap-2">
                    {formData.approvalStatus === "APPROVED" ? `` : "Approve"}
                    {formData.approvalStatus === "APPROVED" && (
                      <SquareCheck className="text-green-800" />
                    )}
                  </div>
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size={"sm"}
              onClick={cancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 hover:text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size={"sm"}
              onClick={handleSaveChanges}
              className={`bg-sky-500 hover:bg-sky-400 text-white hover:text-white px-4 py-2 rounded ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Save Changes
            </Button>
          </div>
          {originalForm && originalForm.approvalStatus === "PENDING" && (
            <div className="flex flex-row justify-end ">
              <p className="text-xs  text-gray-500">
                {`Marked as ${
                  formData.approvalStatus
                    .toLowerCase()
                    .slice(0, 1)
                    .toUpperCase() +
                  formData.approvalStatus.toLowerCase().slice(1)
                } save changes to update the status.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
