import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { DateTimePicker } from "../../../_pages/DateTimePicker";
import { SingleCombobox } from "@/components/ui/single-combobox";

export type MaintenanceLogDraft = {
  startTime: string;
  endTime: string;
  maintenanceId: string;
};

type Props = {
  maintenanceLogs: MaintenanceLogDraft[];
  setMaintenanceLogs: React.Dispatch<
    React.SetStateAction<MaintenanceLogDraft[]>
  >;
  maintenanceEquipmentOptions: { value: string; label: string }[];
};

export function MaintenanceSection({
  maintenanceLogs,
  setMaintenanceLogs,
  maintenanceEquipmentOptions,
}: Props) {
  return (
    <div className=" border-t-2 border-black pt-4 pb-2">
      <div className="mb-4">
        <h3 className="font-semibold text-xl mb-1">
          Additional Maintenance Details
        </h3>
        <p className="text-sm text-gray-600">
          Fill out the additional details for this timesheet to report more
          accurate maintenance logs.
        </p>
      </div>
      {maintenanceLogs.map((log, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-6 mb-4 border rounded p-4 relative"
        >
          <div className="flex flex-col gap-4 pt-4 pb-2">
            <SingleCombobox
              label="Project"
              options={maintenanceEquipmentOptions}
              value={log.maintenanceId}
              onChange={(val, option) => {
                const updated = [...maintenanceLogs];
                updated[idx].maintenanceId = val;
                setMaintenanceLogs(updated);
              }}
              placeholder="Select Project Id"
              filterKeys={["label", "value"]}
            />
            <DateTimePicker
              label="Start Time"
              value={log.startTime}
              onChange={(val) => {
                const updated = [...maintenanceLogs];
                updated[idx].startTime = val;
                setMaintenanceLogs(updated);
              }}
            />

            <DateTimePicker
              label="End Time"
              value={log.endTime}
              onChange={(val) => {
                const updated = [...maintenanceLogs];
                updated[idx].endTime = val;
                setMaintenanceLogs(updated);
              }}
            />

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() =>
                setMaintenanceLogs(maintenanceLogs.filter((_, i) => i !== idx))
              }
              className="absolute top-2 right-2"
            >
              <img src="/trash.svg" alt="Delete" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        onClick={() =>
          setMaintenanceLogs([
            ...maintenanceLogs,
            {
              startTime: "",
              endTime: "",
              maintenanceId: "",
            },
          ])
        }
      >
        Add Maintenance Log
      </Button>
    </div>
  );
}
