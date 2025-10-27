import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SingleCombobox } from "@/components/ui/single-combobox";
import { X, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

export interface MechanicProject {
  id: number;
  hours: number | null;
  equipmentId: string;
  description: string | null;
  Equipment?: { id: string; name: string } | null;
}

interface MechanicProjectProps {
  mechanicProjects: MechanicProject[];
  setMechanicProjects: React.Dispatch<React.SetStateAction<MechanicProject[]>>;
  equipmentOptions: { value: string; label: string }[];
}

export const MechanicProject: React.FC<MechanicProjectProps> = ({
  mechanicProjects,
  setMechanicProjects,
  equipmentOptions,
}) => {
  // Handler functions
  const handleProjectChange = (
    idx: number,
    field: keyof MechanicProject,
    value: string | number | null | { id: string; name: string },
  ) => {
    setMechanicProjects((prev) => {
      const updated = [...prev];

      // Create a new project object with updated field
      updated[idx] = {
        ...updated[idx],
        [field]: value,
      };

      return updated;
    });
  };

  const addProject = () => {
    setMechanicProjects((prev) => [
      ...prev,
      {
        id: Date.now(),
        hours: null,
        equipmentId: "",
        description: "",
        Equipment: null,
      },
    ]);
  };

  const removeProject = (idx: number) => {
    setMechanicProjects((prev) => prev.filter((_, i) => i !== idx));
  };

  // Check if add button should be disabled
  const disableAdd =
    mechanicProjects.length > 0 &&
    (!mechanicProjects[mechanicProjects.length - 1].equipmentId ||
      mechanicProjects[mechanicProjects.length - 1].hours === null);

  return (
    <div className="col-span-2 mt-2">
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex-1">
          <p className="block font-semibold text-base">Maintenance Projects</p>
          <p className="text-xs text-gray-500 pt-1">
            Add maintenance projects performed during this timesheet
          </p>
        </div>
      </div>

      {mechanicProjects.map((project, idx) => (
        <div
          key={project.id || idx}
          className="bg-slate-50 flex flex-col mb-2 border p-2 rounded relative"
        >
          {/* Equipment Selection */}
          <div className="flex flex-row gap-4 pb-2">
            <div className="w-[350px]">
              <Label htmlFor="equipmentId" className="block text-xs">
                Equipment Worked On
              </Label>
              <SingleCombobox
                options={equipmentOptions}
                value={project.equipmentId || ""}
                onChange={(val) => {
                  const selected = equipmentOptions.find(
                    (eq) => eq.value === val,
                  );
                  // Update equipmentId directly
                  handleProjectChange(
                    idx,
                    "equipmentId",
                    selected ? selected.value : "",
                  );

                  handleProjectChange(
                    idx,
                    "Equipment",
                    selected
                      ? { id: selected.value, name: selected.label }
                      : null,
                  );
                }}
                placeholder="Select equipment"
                filterKeys={["value", "label"]}
              />
            </div>
          </div>

          {/* Hours Input */}
          <div className="flex flex-row gap-4 pb-2">
            <div className="w-[350px]">
              <label className="block text-xs">Hours</label>
              <Input
                type="number"
                placeholder="Enter hours"
                value={project.hours || ""}
                onChange={(e) =>
                  handleProjectChange(
                    idx,
                    "hours",
                    Number(e.target.value) || null,
                  )
                }
                className="bg-white w-[350px] text-xs"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-row gap-4 pb-2">
            <div className="w-full">
              <label className="block text-xs">Description</label>
              <Textarea
                placeholder="Enter description or notes"
                value={project.description || ""}
                onChange={(e) =>
                  handleProjectChange(idx, "description", e.target.value)
                }
                className="bg-white w-full text-xs resize-y min-h-[100px]"
              />
            </div>
          </div>

          {/* Delete Button */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => removeProject(idx)}
            className="absolute top-0 right-0"
          >
            <X className="w-4 h-4" color="red" />
          </Button>
        </div>
      ))}
      <div className="flex">
        <Button
          type="button"
          onClick={addProject}
          disabled={disableAdd}
          className={disableAdd ? "opacity-50 cursor-not-allowed mt-2" : "mt-2"}
        >
          <Plus className="h-8 w-8" color="white" />
          Add New Project
        </Button>
      </div>
    </div>
  );
};
