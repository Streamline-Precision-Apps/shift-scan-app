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
import { registerEquipment } from "@/actions/AssetActions";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { US_STATES } from "@/data/stateValues";
import { X } from "lucide-react";

export default function CreateEquipmentModal({
  cancel,
  rerender,
}: {
  cancel: () => void;
  rerender: () => void;
}) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    memo: "",
    ownershipType: "",
    make: "",
    model: "",
    year: "",
    color: "",
    serialNumber: "",
    acquiredDate: null,
    acquiredCondition: "",
    licensePlate: "",
    licenseState: "",
    equipmentTag: "",
    state: "AVAILABLE",
    approvalStatus: "APPROVED",
    isDisabledByAdmin: false,
    overWeight: null,
    currentWeight: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "overWeight"
          ? value === "true"
            ? true
            : value === "false"
              ? false
              : null
          : value,
    }));
  };

  const handleCheckboxChange = (
    name: string,
    checked: boolean | "indeterminate",
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked === "indeterminate" ? null : checked,
    }));
  };

  const handleVehicleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleCreateEquipment = async () => {
    setSubmitting(true);
    try {
      // Basic validation
      if (!formData.name.trim()) {
        toast.error("Equipment name is required", { duration: 3000 });
        setSubmitting(false);
        return;
      }
      if (!formData.equipmentTag) {
        toast.error("Equipment type is required", { duration: 3000 });
        setSubmitting(false);
        return;
      }
      // Prepare payload
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        memo: formData.memo?.trim() || "",
        ownershipType: formData.ownershipType || null,
        make: formData.make || null,
        model: formData.model || null,
        year: formData.year || null,
        color: formData.color || null,
        serialNumber: formData.serialNumber || null,
        acquiredDate: formData.acquiredDate
          ? new Date(formData.acquiredDate)
          : null,
        acquiredCondition: formData.acquiredCondition || null,
        licensePlate: formData.licensePlate || null,
        licenseState: formData.licenseState || null,
        equipmentTag: formData.equipmentTag,
        state: formData.state,
        approvalStatus: formData.approvalStatus,
        isDisabledByAdmin: formData.isDisabledByAdmin,
        overWeight: formData.overWeight,
        currentWeight: formData.currentWeight,
      };
      const createdById = session?.user.id;
      if (!createdById) {
        toast.error("You must be logged in to create equipment.", {
          duration: 3000,
        });
        setSubmitting(false);
        return;
      }
      const result = await registerEquipment(payload, createdById);
      if (result.success) {
        toast.success("Equipment created successfully!", { duration: 3000 });
        rerender();
        cancel();
      } else {
        toast.error(result.error || "Failed to create equipment", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error creating equipment:", error);
      toast.error("Failed to create equipment", { duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[600px] max-h-[80vh]  px-6 py-4 flex flex-col items-center">
        <div className="w-full flex flex-col border-b border-gray-100 pb-3 relative">
          <h2 className="text-lg text-black font-semibold ">
            Create Equipment
          </h2>
          <p className="text-xs text-gray-600">
            Fill in the details to create new equipment.
          </p>
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
        <div className="flex-1 w-full px-2 pb-10 overflow-y-auto no-scrollbar">
          <div className="w-full mt-3 ">
            {/* Section: General Information */}
            <div className="space-y-2 mb-5">
              <h3 className="text-md font-semibold">General Information</h3>
              <div className="border bg-slate-50 rounded-md p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label htmlFor="code" className={`text-sm `}>
                      ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name" className={`text-sm `}>
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
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full text-xs min-h-[80px] bg-white"
                      placeholder="Enter equipment description..."
                      style={{ resize: "none" }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="memo" className="text-sm font-medium">
                      Memo
                    </Label>
                    <Textarea
                      name="memo"
                      rows={2}
                      value={formData.memo}
                      onChange={handleInputChange}
                      className="w-full text-xs min-h-[60px] bg-white"
                      placeholder="Enter any additional notes..."
                      style={{ resize: "none" }}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="equipmentTag"
                      className={`text-sm font-medium `}
                    >
                      Equipment Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="equipmentTag"
                      value={formData.equipmentTag}
                      onValueChange={(value) =>
                        handleSelectChange("equipmentTag", value)
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
              <div className="border bg-slate-50 rounded-md p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label htmlFor="ownershipType" className={`text-sm `}>
                      Ownership Type
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("ownershipType", value)
                      }
                      value={formData.ownershipType}
                    >
                      <SelectTrigger className="text-xs bg-white">
                        <SelectValue placeholder="Select Ownership Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNED">Owned</SelectItem>
                        <SelectItem value="LEASED">Leased</SelectItem>
                        <SelectItem value="RENTAL">Rental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="acquiredDate" className={`text-sm `}>
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
                    <Label htmlFor="acquiredCondition" className={`text-sm `}>
                      Acquired Condition
                    </Label>
                    <Select
                      name="acquiredCondition"
                      value={formData.acquiredCondition}
                      onValueChange={(value) =>
                        handleSelectChange("acquiredCondition", value)
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

            {/* Section: Vehicle/Equipment Specifications */}
            <div className="space-y-2 mb-5">
              <h3 className="text-md font-semibold ">
                Equipment Specifications
              </h3>
              <div className="border bg-slate-50 rounded-md p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label htmlFor="make" className={`text-sm font-medium `}>
                      Make
                    </Label>
                    <Input
                      type="text"
                      name="make"
                      value={formData.make || ""}
                      onChange={handleInputChange}
                      placeholder="Make"
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model" className={`text-sm font-medium`}>
                      Model
                    </Label>
                    <Input
                      type="text"
                      name="model"
                      value={formData.model || ""}
                      onChange={handleInputChange}
                      placeholder="Model"
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className={`text-sm font-medium `}>
                      Year
                    </Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      name="year"
                      value={formData.year || ""}
                      onChange={handleInputChange}
                      placeholder="YYYY"
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color" className={`text-sm font-medium `}>
                      Color
                    </Label>
                    <Input
                      type="text"
                      name="color"
                      value={formData.color || ""}
                      onChange={handleInputChange}
                      placeholder="Color"
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="serialNumber"
                      className={`text-sm font-medium `}
                    >
                      Serial Number
                    </Label>
                    <Input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber || ""}
                      onChange={handleInputChange}
                      placeholder="Serial Number"
                      className="text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: License Information */}
            <div className="space-y-2 mb-5">
              <h3 className="text-md font-semibold ">License Information</h3>
              <div className="border rounded-md bg-slate-50 p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label
                      htmlFor="licensePlate"
                      className={`text-sm font-medium `}
                    >
                      License Number
                    </Label>
                    <Input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate || ""}
                      onChange={handleInputChange}
                      placeholder="Enter License Number"
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="licenseState"
                      className={`text-sm font-medium `}
                    >
                      License State
                    </Label>

                    <Select
                      name="licenseState"
                      value={formData.licenseState}
                      onValueChange={(value) =>
                        handleSelectChange("licenseState", value)
                      }
                    >
                      <SelectTrigger className="text-xs bg-white">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.name} value={state.code}>
                            {state.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Weight Information */}
            <div className="space-y-2 mb-5">
              <h3 className="text-md font-semibold">Weight Information</h3>
              <div className="bg-slate-50 border rounded-md p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label htmlFor="currentWeight" className={`text-sm `}>
                      {`Current Weight (lbs)`}
                    </Label>
                    <Input
                      type="number"
                      name="currentWeight"
                      onChange={handleInputChange}
                      value={
                        formData.currentWeight === null
                          ? ""
                          : formData.currentWeight
                      }
                      placeholder="0"
                      className="text-xs bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="overWeight"
                      checked={formData.overWeight === true}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("overWeight", checked)
                      }
                    />
                    <Label
                      htmlFor="overWeight"
                      className={`text-sm cursor-pointer`}
                    >
                      Is Overweight?
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Safety Documents */}
            <div className="w-full flex flex-col p-1 mt-3">
              <p className="text-base font-medium">
                Safety Documents and Policies
              </p>
              <p className="text-sm text-slate-500">Coming Soon!</p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-row justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size={"sm"}
            className="bg-gray-100 text-gray-800 hover:bg-gray-50 hover:text-gray-800"
            onClick={cancel}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size={"sm"}
            className={`bg-sky-500 text-white hover:bg-sky-400 hover:text-white`}
            onClick={handleCreateEquipment}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create & Approve"}
          </Button>
        </div>
      </div>
    </div>
  );
}
