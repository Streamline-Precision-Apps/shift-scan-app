import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { SingleCombobox } from "@/components/ui/single-combobox";
import { X } from "lucide-react";
import { DateTimePicker } from "@/components/ui/dateTimePicker";

export type LaborLogDraft = {
  equipment: { id: string; name: string };
  startTime: string;
  endTime: string;
};

type Props = {
  laborLogs: LaborLogDraft[];
  setLaborLogs: React.Dispatch<React.SetStateAction<LaborLogDraft[]>>;
  equipmentOptions: { value: string; label: string }[];
};

export function LaborSection({
  laborLogs,
  setLaborLogs,
  equipmentOptions,
}: Props) {
  // ...existing code for rendering labor logs UI, using the props above...
  // Copy the JSX and logic for the Labor section from the main modal, replacing state/handlers with props
  return (
    <div className="col-span-2">
      <div className="flex flex-col mb-4">
        <h3 className="block font-semibold text-base">Equipment Logs</h3>
        <p className="text-xs text-gray-600 pt-1">
          Report equipment usage, you can add multiple entries.
        </p>
      </div>
      {laborLogs.map((log, idx) => (
        <div
          key={idx}
          className="bg-slate-50 border rounded p-2 mb-2 flex flex-col gap-4 relative"
        >
          <div className="flex flex-row items-end">
            <div className="w-[350px]">
              <SingleCombobox
                font={"font-normal"}
                label="Equipment"
                options={equipmentOptions}
                value={log.equipment.id}
                onChange={(val, option) => {
                  const updated = [...laborLogs];
                  updated[idx].equipment = option
                    ? { id: option.value, name: option.label }
                    : { id: "", name: "" };
                  setLaborLogs(updated);
                }}
                placeholder="Select Equipment"
                filterKeys={["value", "label"]}
              />
            </div>
          </div>

          <Button
            type="button"
            size={"icon"}
            variant="ghost"
            onClick={() => setLaborLogs(laborLogs.filter((_, i) => i !== idx))}
            className="absolute top-0 right-0"
          >
            <X className="h-4 w-4" color="red" />
          </Button>

          <div className="flex flex-row items-end">
            <div>
              <Input
                type="time"
                placeholder="Start Time"
                value={log.startTime}
                onChange={(e) => {
                  const updated = [...laborLogs];
                  updated[idx].startTime = e.target.value;
                  setLaborLogs(updated);
                }}
                className="w-[350px] bg-white"
              />
            </div>
          </div>
          <div className="flex flex-row items-end">
            <div>
              <Input
                type="time"
                placeholder="End Time"
                value={log.endTime}
                onChange={(e) => {
                  const updated = [...laborLogs];
                  updated[idx].endTime = e.target.value;
                  setLaborLogs(updated);
                }}
                className="w-[350px] bg-white"
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        className="mt-2"
        disabled={
          laborLogs.length > 0 &&
          (!laborLogs[laborLogs.length - 1].equipment.id ||
            !laborLogs[laborLogs.length - 1].startTime ||
            !laborLogs[laborLogs.length - 1].endTime)
        }
        onClick={() =>
          setLaborLogs([
            ...laborLogs,
            {
              equipment: { id: "", name: "" },
              startTime: "",
              endTime: "",
            },
          ])
        }
      >
        Add Equipment Log
      </Button>
    </div>
  );
}
