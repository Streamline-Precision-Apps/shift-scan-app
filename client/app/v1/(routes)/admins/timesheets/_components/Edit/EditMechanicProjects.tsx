import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SingleCombobox } from "@/components/ui/single-combobox";
import { X, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
export interface MechanicProject {
  id: number;
  timeSheetId?: number;
  hours: number | null;
  equipmentId: string;
  description: string | null;
  Equipment?: { id: string; name: string } | null;
}

interface EditMechanicProjectsProps {
  projects: MechanicProject[];
  onProjectChange: (
    idx: number,
    field: keyof MechanicProject,
    value: string | number | null | { id: string; name: string },
  ) => void;
  onAddProject: () => void;
  onRemoveProject: (idx: number) => void;
  originalProjects?: MechanicProject[];
  onUndoProjectField?: (idx: number, field: keyof MechanicProject) => void;
  equipmentOptions: { value: string; label: string }[];
  disableAdd?: boolean;
}

export const EditMechanicProjects: React.FC<EditMechanicProjectsProps> = ({
  projects,
  onProjectChange,
  onAddProject,
  onRemoveProject,
  originalProjects = [],
  onUndoProjectField,
  equipmentOptions,
  disableAdd = false,
}) => (
  <div className="col-span-2 mt-4">
    <div className="flex flex-row justify-between items-center mb-4">
      <div className="flex-1">
        <p className="block font-semibold text-sm">Maintenance Projects</p>
        <p className="text-xs text-gray-500 pt-1">
          Add maintenance projects performed during this timesheet
        </p>
      </div>
    </div>

    {projects.map((project, idx) => (
      <div
        key={project.id}
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
                onProjectChange(
                  idx,
                  "equipmentId",
                  selected ? selected.value : "",
                );

                onProjectChange(
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
          {originalProjects[idx] &&
            project.equipmentId !== originalProjects[idx].equipmentId &&
            onUndoProjectField && (
              <div className="flex items-end">
                <Button
                  type="button"
                  size="default"
                  className="w-fit"
                  onClick={() => onUndoProjectField(idx, "equipmentId")}
                >
                  <p className="text-xs">Undo</p>
                </Button>
              </div>
            )}
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
                onProjectChange(idx, "hours", Number(e.target.value) || null)
              }
              className="bg-white w-[350px] text-xs"
            />
          </div>
          {originalProjects[idx] &&
            project.hours !== originalProjects[idx].hours &&
            onUndoProjectField && (
              <div className="flex items-end">
                <Button
                  type="button"
                  size="default"
                  className="w-fit"
                  onClick={() => onUndoProjectField(idx, "hours")}
                >
                  <p className="text-xs">Undo</p>
                </Button>
              </div>
            )}
        </div>

        {/* Description Textarea */}
        <div className="flex flex-row gap-4 pb-2">
          <div className="w-full">
            <label className="block text-xs">Description</label>

            <Textarea
              placeholder="Enter description or notes"
              value={project.description || ""}
              onChange={(e) =>
                onProjectChange(idx, "description", e.target.value)
              }
              className="bg-white w-full text-xs resize-y min-h-[100px] "
            />
          </div>
        </div>
        <div className="flex h-8">
          {originalProjects[idx] &&
            project.description !== originalProjects[idx].description &&
            onUndoProjectField && (
              <Button
                type="button"
                size={"sm"}
                className="w-[50px]"
                onClick={() => onUndoProjectField(idx, "description")}
              >
                <p className="text-xs">Undo</p>
              </Button>
            )}
        </div>

        {/* Delete Button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => onRemoveProject(idx)}
          className="absolute top-0 right-0"
        >
          <X className="w-4 h-4" color="red" />
        </Button>
      </div>
    ))}
    <div className="flex ">
      <Button
        type="button"
        onClick={onAddProject}
        disabled={disableAdd}
        className={disableAdd ? "opacity-50 cursor-not-allowed mt-2" : "mt-2"}
      >
        <Plus className="h-8 w-8" color="white" />
        Add New Project
      </Button>
    </div>
  </div>
);
