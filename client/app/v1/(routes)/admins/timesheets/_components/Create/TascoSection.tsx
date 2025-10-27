"use client";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { SingleCombobox } from "@/components/ui/single-combobox";

export type TascoLogDraft = {
  shiftType: "ABCD Shift" | "E Shift" | "F Shift" | "";
  laborType: "Equipment Operator" | "Labor" | "";
  materialType: string;
  loadQuantity: string;
  screenType: "SCREENED" | "UNSCREENED" | "";
  refuelLogs: { gallonsRefueled: string }[];
  equipment: { id: string; name: string }[];
};

type Props = {
  tascoLogs: TascoLogDraft[];
  setTascoLogs: React.Dispatch<React.SetStateAction<TascoLogDraft[]>>;
  materialTypes: { id: string; name: string }[];
  equipmentOptions: { value: string; label: string }[];
};

export function TascoSection({
  tascoLogs,
  setTascoLogs,
  materialTypes,
  equipmentOptions,
}: Props) {
  return (
    <div className="col-span-2 ">
      <div className="flex flex-col border-t border-gray-100 ">
        <h3 className="font-semibold text-base py-2">Tasco Summary</h3>
      </div>
      {tascoLogs.map((log, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-6 relative p-2 mb-2 border-b"
        >
          <div className="flex flex-col gap-4 pb-4 border bg-slate-50 rounded p-2">
            {/* Equipment Combobox */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-4">
                <div className="w-[350px]">
                  <label htmlFor="equipmentId" className="block text-xs">
                    Equipment
                  </label>
                  <SingleCombobox
                    options={equipmentOptions}
                    value={log.equipment[0]?.id || ""}
                    onChange={(val, option) => {
                      const updated = [...tascoLogs];
                      updated[idx].equipment[0] = option
                        ? { id: option.value, name: option.label }
                        : { id: "", name: "" };
                      setTascoLogs(updated);
                    }}
                    placeholder="Select Equipment"
                  />
                </div>
              </div>
              <div className="flex flex-row gap-4">
                <div className="w-[350px]">
                  <label htmlFor="shiftType" className="block text-xs">
                    Shift Type
                  </label>
                  <Select
                    name="shiftType"
                    value={log.shiftType}
                    onValueChange={(val) => {
                      const updated = [...tascoLogs];
                      updated[idx].shiftType =
                        val as TascoLogDraft["shiftType"];
                      setTascoLogs(updated);
                    }}
                  >
                    <SelectTrigger className="bg-white w-[350px] text-xs">
                      <SelectValue placeholder="Select Shift Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ABCD Shift">ABCD Shift</SelectItem>
                      <SelectItem value="E Shift">E Shift</SelectItem>
                      <SelectItem value="F Shift">F Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-row gap-4">
                <div className="w-[350px]">
                  <label htmlFor="laborType" className="block text-xs">
                    Labor Type
                  </label>
                  <Select
                    name="laborType"
                    value={log.laborType}
                    onValueChange={(val) => {
                      const updated = [...tascoLogs];
                      updated[idx].laborType =
                        val as TascoLogDraft["laborType"];
                      setTascoLogs(updated);
                    }}
                  >
                    <SelectTrigger className="bg-white w-[350px] text-xs">
                      <SelectValue placeholder="Select Labor Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Equipment Operator">
                        Equipment Operator
                      </SelectItem>
                      <SelectItem value="Labor">Labor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <div className="w-[350px]">
                <label htmlFor="materialType" className="block text-xs">
                  Material Type
                </label>
                <SingleCombobox
                  options={materialTypes.map((m) => ({
                    value: m.name,
                    label: m.name,
                  }))}
                  value={log.materialType}
                  onChange={(val) => {
                    const updated = [...tascoLogs];
                    updated[idx].materialType = val;
                    setTascoLogs(updated);
                  }}
                  placeholder="Select Material"
                />
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <div className="w-[350px]">
                <label className="block text-xs">Number of Loads</label>
                <Input
                  type="number"
                  placeholder="Enter number of loads"
                  value={log.loadQuantity}
                  onChange={(e) => {
                    const updated = [...tascoLogs];
                    updated[idx].loadQuantity = e.target.value;
                    setTascoLogs(updated);
                  }}
                  className="bg-white border rounded px-2 py-1 w-full text-xs"
                />
              </div>
            </div>
            {/* <div className="flex flex-row gap-4">
              <div className="w-[350px]">
                <label htmlFor="screenType" className="block text-xs">
                  Screen Type
                </label>
                <Select
                  name="screenType"
                  value={log.screenType}
                  onValueChange={(val) => {
                    const updated = [...tascoLogs];
                    updated[idx].screenType =
                      val as TascoLogDraft["screenType"];
                    setTascoLogs(updated);
                  }}
                >
                  <SelectTrigger className="bg-white w-[350px] text-xs">
                    <SelectValue placeholder="Select Screen Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCREENED">Screened</SelectItem>
                    <SelectItem value="UNSCREENED">Unscreened</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div> */}
          </div>
          {/* Refuel Logs Section */}
          <div className="mb-2 border-t pt-4">
            <div className="flex flex-row justify-between ">
              <p className="text-sm font-semibold">Refuel Logs</p>
              <Button
                type="button"
                size="icon"
                onClick={() => {
                  const updated = [...tascoLogs];
                  updated[idx].refuelLogs.push({ gallonsRefueled: "" });
                  setTascoLogs(updated);
                }}
                className=""
                title="Add Refuel Log"
              >
                <img src="/plus-white.svg" alt="add" className="w-4 h-4" />
              </Button>
            </div>
            {log.refuelLogs && log.refuelLogs.length > 0
              ? log.refuelLogs.map((ref, refIdx) => (
                  <div
                    key={refIdx}
                    className="bg-slate-50 flex gap-2 my-2 items-end border p-2 rounded relative"
                  >
                    <div>
                      <label className="block text-xs ">Gallons Refueled</label>
                      <Input
                        type="number"
                        placeholder="Enter total gallons"
                        value={ref.gallonsRefueled}
                        onChange={(e) => {
                          const updated = [...tascoLogs];
                          updated[idx].refuelLogs[refIdx].gallonsRefueled =
                            e.target.value;
                          setTascoLogs(updated);
                        }}
                        className="bg-white w-[350px] text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const updated = [...tascoLogs];
                        updated[idx].refuelLogs = updated[
                          idx
                        ].refuelLogs.filter((_, i) => i !== refIdx);
                        setTascoLogs(updated);
                      }}
                      className="absolute top-0 right-0"
                    >
                      <X className="h-4 w-4" color="red" />
                    </Button>
                  </div>
                ))
              : null}
          </div>
        </div>
      ))}
    </div>
  );
}
