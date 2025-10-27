import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateOptions } from "@/data/stateValues";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SingleCombobox } from "@/components/ui/single-combobox";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

export type TruckingMaterialDraft = {
  location: string;
  name: string;
  quantity: string;
  unit: "TONS" | "YARDS" | "";
  // materialWeight: string;
  loadType: "SCREENED" | "UNSCREENED" | "";
};
export type TruckingLogDraft = {
  equipmentId: string;
  truckNumber: string; // This stores the truck equipment ID (not the name)
  startingMileage: string;
  endingMileage: string;
  equipmentHauled: {
    equipment: { id: string; name: string };
    source: string | null;
    destination: string | null;
    startMileage: string;
    endMileage: string;
  }[];
  materials: TruckingMaterialDraft[];
  refuelLogs: { gallonsRefueled: string; milesAtFueling: string }[];
  stateMileages: { state: string; stateLineMileage: string }[];
};

type Props = {
  truckingLogs: TruckingLogDraft[];
  setTruckingLogs: React.Dispatch<React.SetStateAction<TruckingLogDraft[]>>;
  equipmentOptions: { value: string; label: string }[];
  truckOptions: { value: string; label: string }[];
  jobsiteOptions: { value: string; label: string }[];
};

export function TruckingSection({
  truckOptions,
  truckingLogs,
  setTruckingLogs,
  equipmentOptions,
  jobsiteOptions,
}: Props) {
  // Helper functions to check completeness of each nested log type
  const isEquipmentHauledComplete = (
    eq: TruckingLogDraft["equipmentHauled"][0],
  ) => !!eq.equipment.id;

  const isMaterialComplete = (mat: TruckingMaterialDraft) =>
    !!(mat.location && mat.name && mat.quantity && mat.unit && mat.loadType);

  const isRefuelLogComplete = (ref: TruckingLogDraft["refuelLogs"][0]) =>
    !!(ref.gallonsRefueled && ref.milesAtFueling);

  const isStateMileageComplete = (sm: TruckingLogDraft["stateMileages"][0]) =>
    !!(sm.state && sm.stateLineMileage);

  return (
    <>
      <div className="col-span-2 ">
        {truckingLogs.map((log, idx) => (
          <div key={idx} className="rounded px-2 ">
            {/* General Information */}
            <div className="flex flex-col w-full py-4">
              <h3 className="block font-semibold text-sm pb-1">
                General Information
              </h3>
              <div className="bg-slate-50 flex flex-col gap-3  border rounded-sm p-2 ">
                <div className="flex flex-row items-end gap-x-2">
                  <div className="min-w-[350px]">
                    <label className="block text-xs">Truck</label>
                    <SingleCombobox
                      font={"font-normal"}
                      options={truckOptions}
                      value={log.truckNumber} // truckNumber now stores the equipment ID
                      onChange={(val) => {
                        const updated = [...truckingLogs];
                        updated[idx].truckNumber = val; // Store the equipment ID in truckNumber
                        updated[idx].equipmentId = val; // Also store it in equipmentId for consistency
                        setTruckingLogs(updated);
                      }}
                      placeholder="Select Truck*"
                      filterKeys={["label", "value"]}
                    />
                  </div>
                </div>
                <div className="flex flex-row items-end gap-x-2">
                  <div className="flex flex-row items-end gap-x-2">
                    <div className="flex-1">
                      <label className="block text-xs">Starting Mileage</label>
                      <Input
                        type="number"
                        value={log.startingMileage || ""}
                        onChange={(e) => {
                          const updated = [...truckingLogs];
                          updated[idx].startingMileage = e.target.value;
                          setTruckingLogs(updated);
                        }}
                        className="bg-white w-[160px] text-xs"
                        onBlur={(e) => {
                          let value = e.target.value;
                          if (/^0+\d+/.test(value)) {
                            value = String(Number(value));
                            const updated = [...truckingLogs];
                            updated[idx].startingMileage = value;
                            setTruckingLogs(updated);
                            e.target.value = value;
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row items-end gap-x-2">
                    <div className="flex-1">
                      <label className="block text-xs">Ending Mileage</label>
                      <Input
                        type="number"
                        value={log.endingMileage || ""}
                        onChange={(e) => {
                          const updated = [...truckingLogs];
                          updated[idx].endingMileage = e.target.value;
                          setTruckingLogs(updated);
                        }}
                        className="bg-white text-xs w-[160px]"
                        onBlur={(e) => {
                          let value = e.target.value;
                          if (/^0+\d+/.test(value)) {
                            value = String(Number(value));
                            const updated = [...truckingLogs];
                            updated[idx].endingMileage = value;
                            setTruckingLogs(updated);
                            e.target.value = value;
                          }
                          if (Number(value) < Number(log.startingMileage)) {
                            e.target.setCustomValidity(
                              "Ending mileage cannot be less than starting mileage",
                            );
                          } else {
                            e.target.setCustomValidity("");
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {Number(log.startingMileage) > Number(log.endingMileage) && (
                <p className="text-xs text-red-500 mt-1">
                  Starting Mileage cannot be greater than Ending Mileage.
                </p>
              )}
            </div>
            {/* Equipment Hauled */}
            <div className="flex flex-row justify-between items-center py-4 border-t border-gray-200">
              <div className="flex-col flex ">
                <p className="block text-sm font-semibold pb-1">
                  Equipment Hauled
                </p>
                <p className="text-xs text-gray-500">
                  This section logs the equipment hauled and the destination it
                  was delivered to.
                </p>
              </div>
              <div className="flex justify-end">
                {log.equipmentHauled.length === 0 && (
                  <Button
                    size="icon"
                    type="button"
                    onClick={() => {
                      const updated = [...truckingLogs];
                      updated[idx].equipmentHauled.push({
                        equipment: { id: "", name: "" },
                        source: "",
                        destination: "",
                        startMileage: "",
                        endMileage: "",
                      });
                      setTruckingLogs(updated);
                    }}
                    disabled={
                      log.equipmentHauled.length > 0 &&
                      !isEquipmentHauledComplete(
                        log.equipmentHauled[log.equipmentHauled.length - 1],
                      )
                    }
                    className={
                      log.equipmentHauled.length > 0 &&
                      !isEquipmentHauledComplete(
                        log.equipmentHauled[log.equipmentHauled.length - 1],
                      )
                        ? "opacity-50"
                        : ""
                    }
                    title={
                      log.equipmentHauled.length > 0 &&
                      !isEquipmentHauledComplete(
                        log.equipmentHauled[log.equipmentHauled.length - 1],
                      )
                        ? "Please complete the previous Equipment Hauled entry before adding another."
                        : ""
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {/* Equipment Hauled Entries */}
            <div className="border-b py-2">
              {log.equipmentHauled.map((eq, eqIdx) => (
                <div
                  key={eqIdx}
                  className="bg-slate-50 flex flex-col gap-4 mb-3 border p-2 rounded relative"
                >
                  <div className="flex flex-row items-end gap-x-2">
                    <div className="min-w-[350px] w-fit items-end">
                      <Label className="block text-xs">Equipment ID</Label>
                      <SingleCombobox
                        font={"font-normal"}
                        options={equipmentOptions}
                        value={eq.equipment.id}
                        onChange={(val, option) => {
                          const updated = [...truckingLogs];
                          updated[idx].equipmentHauled[eqIdx].equipment = option
                            ? { id: option.value, name: option.label }
                            : { id: "", name: "" };
                          setTruckingLogs(updated);
                        }}
                        placeholder="Select equipment"
                        filterKeys={["label", "value"]}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row items-end gap-x-2">
                    <div className="flex flex-col">
                      <Label className="block text-xs">Origin</Label>
                      <Input
                        type="text"
                        value={eq.source || ""}
                        onChange={(e) => {
                          const updated = [...truckingLogs];
                          updated[idx].equipmentHauled[eqIdx].source =
                            e.target.value;
                          setTruckingLogs(updated);
                        }}
                        className="bg-white w-[350px] text-xs"
                        onBlur={(e) => {
                          let value = e.target.value;
                          if (/^0+\d+/.test(value)) {
                            value = String(Number(value));
                            const updated = [...truckingLogs];
                            updated[idx].equipmentHauled[eqIdx].source = value;
                            setTruckingLogs(updated);
                            e.target.value = value;
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row items-end gap-x-2">
                    <div className="flex flex-col">
                      <Label className="block text-xs">Destination</Label>
                      <Input
                        type="text"
                        value={eq.destination || ""}
                        onChange={(e) => {
                          const updated = [...truckingLogs];
                          updated[idx].equipmentHauled[eqIdx].destination =
                            e.target.value;
                          setTruckingLogs(updated);
                        }}
                        className="bg-white w-[350px] text-xs"
                        onBlur={(e) => {
                          let value = e.target.value;
                          if (/^0+\d+/.test(value)) {
                            value = String(Number(value));
                            const updated = [...truckingLogs];
                            updated[idx].equipmentHauled[eqIdx].destination =
                              value;
                            setTruckingLogs(updated);
                            e.target.value = value;
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row items-end gap-x-2">
                    <div className="flex flex-col">
                      <Label className="block text-xs">
                        OW Starting Mileage
                      </Label>
                      <Input
                        type="number"
                        value={eq.startMileage || ""}
                        onChange={(e) => {
                          const updated = [...truckingLogs];
                          updated[idx].equipmentHauled[eqIdx].startMileage =
                            e.target.value;
                          setTruckingLogs(updated);
                        }}
                        className="bg-white w-[200px] text-xs"
                        onBlur={(e) => {
                          let value = e.target.value;
                          if (/^0+\d+/.test(value)) {
                            value = String(Number(value));
                            const updated = [...truckingLogs];
                            updated[idx].equipmentHauled[eqIdx].startMileage =
                              value;
                            setTruckingLogs(updated);
                            e.target.value = value;
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row items-end gap-x-2">
                    <div className="flex flex-col">
                      <Label className="block text-xs">OW Ending Mileage</Label>
                      <Input
                        type="number"
                        value={eq.endMileage || ""}
                        onChange={(e) => {
                          const updated = [...truckingLogs];
                          updated[idx].equipmentHauled[eqIdx].endMileage =
                            e.target.value;
                          setTruckingLogs(updated);
                        }}
                        className="bg-white text-xs w-[200px]"
                        onBlur={(e) => {
                          let value = e.target.value;
                          if (/^0+\d+/.test(value)) {
                            value = String(Number(value));
                            const updated = [...truckingLogs];
                            updated[idx].equipmentHauled[eqIdx].endMileage =
                              value;
                            setTruckingLogs(updated);
                            e.target.value = value;
                          }
                          if (Number(value) < Number(eq.startMileage)) {
                            e.target.setCustomValidity(
                              "Ending mileage cannot be less than starting mileage",
                            );
                          } else {
                            e.target.setCustomValidity("");
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-end absolute right-0 top-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = [...truckingLogs];
                        updated[idx].equipmentHauled = updated[
                          idx
                        ].equipmentHauled.filter((_, i) => i !== eqIdx);
                        setTruckingLogs(updated);
                      }}
                    >
                      <X className="h-4 w-4" color="red" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Materials */}
            <div className="flex flex-row justify-between items-center my-2">
              <div className="flex-1">
                <p className="block font-semibold text-sm">Materials Hauled</p>
                <p className="text-xs text-gray-500 pt-1">
                  This section logs the materials hauled and where they were
                  taken from.
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  size="icon"
                  type="button"
                  onClick={() => {
                    const updated = [...truckingLogs];
                    updated[idx].materials.push({
                      location: "",
                      name: "",
                      quantity: "",
                      unit: "",
                      loadType: "",
                    });
                    setTruckingLogs(updated);
                  }}
                  disabled={
                    log.materials.length > 0 &&
                    !isMaterialComplete(log.materials[log.materials.length - 1])
                  }
                  className={
                    log.materials.length > 0 &&
                    !isMaterialComplete(log.materials[log.materials.length - 1])
                      ? "opacity-50 "
                      : ""
                  }
                  title={
                    log.materials.length > 0 &&
                    !isMaterialComplete(log.materials[log.materials.length - 1])
                      ? "Please complete the previous Material entry before adding another."
                      : ""
                  }
                >
                  <Plus className="h-4 w-4" color="white" />
                </Button>
              </div>
            </div>

            {/* Materials Hauled Entries */}
            <div className="border-b py-2">
              {log.materials.map((mat, matIdx) => (
                <div
                  key={matIdx}
                  className="bg-slate-50 mt-2 border p-2 rounded relative"
                >
                  <div className="flex flex-col gap-4 mb-2">
                    <div className="flex flex-row gap-1 items-end">
                      <div className="flex flex-col">
                        <Label className="text-xs">Material Name</Label>
                        <Input
                          type="text"
                          placeholder="Enter Name"
                          value={mat.name}
                          onChange={(e) => {
                            const updated = [...truckingLogs];
                            updated[idx].materials[matIdx].name =
                              e.target.value;
                            setTruckingLogs(updated);
                          }}
                          className="bg-white w-[350px] text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-row gap-1 items-end">
                      <div className="flex flex-col">
                        <Label className="text-xs">Source of Material</Label>
                        <Input
                          type="text"
                          placeholder="Enter name of location"
                          value={mat.location}
                          onChange={(e) => {
                            const updated = [...truckingLogs];
                            updated[idx].materials[matIdx].location =
                              e.target.value;
                            setTruckingLogs(updated);
                          }}
                          className="bg-white w-[350px] text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-end right-2 top-2 absolute">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const updated = [...truckingLogs];
                          updated[idx].materials = updated[
                            idx
                          ].materials.filter((_, i) => i !== matIdx);
                          setTruckingLogs(updated);
                        }}
                      >
                        <X className="w-4 h-4" color="red" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mb-2">
                    <div className="flex flex-row max-w-[600px] gap-2 items-end">
                      <div className="flex flex-row gap-1 items-end">
                        <div className="flex flex-col">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            placeholder="Enter Quantity"
                            value={mat.quantity || ""}
                            onChange={(e) => {
                              const updated = [...truckingLogs];
                              updated[idx].materials[matIdx].quantity =
                                e.target.value;
                              setTruckingLogs(updated);
                            }}
                            className="bg-white w-[150px] text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-row gap-1 items-end">
                        <div>
                          <Label className="text-xs">Unit</Label>
                          <Select
                            value={mat.unit}
                            onValueChange={(val) => {
                              const updated = [...truckingLogs];
                              updated[idx].materials[matIdx].unit = val as
                                | "TONS"
                                | "YARDS"
                                | "";
                              setTruckingLogs(updated);
                            }}
                          >
                            <SelectTrigger className="bg-white w-[150px] text-xs">
                              <SelectValue placeholder="Enter Unit Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TONS">TONS</SelectItem>
                              <SelectItem value="YARDS">YARDS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row gap-1 items-end">
                      <div>
                        <Label className="text-xs">Load Type</Label>
                        <Select
                          value={mat.loadType}
                          onValueChange={(val) => {
                            const updated = [...truckingLogs];
                            updated[idx].materials[matIdx].loadType = val as
                              | "SCREENED"
                              | "UNSCREENED"
                              | "";
                            setTruckingLogs(updated);
                          }}
                        >
                          <SelectTrigger className="bg-white w-[350px] text-xs">
                            <SelectValue placeholder="Load Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SCREENED">Screened</SelectItem>
                            <SelectItem value="UNSCREENED">
                              Unscreened
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Refuel Logs */}
            <div className="flex flex-row justify-between items-center my-2">
              <div className="flex-1">
                <p className="block font-semibold text-sm">Refuel Logs</p>
                <p className="text-xs text-gray-500 pt-1">
                  This section logs the refueling events and the associated
                  mileage.
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  size="icon"
                  type="button"
                  onClick={() => {
                    const updated = [...truckingLogs];
                    updated[idx].refuelLogs.push({
                      gallonsRefueled: "",
                      milesAtFueling: "",
                    });
                    setTruckingLogs(updated);
                  }}
                  disabled={
                    log.refuelLogs.length > 0 &&
                    !isRefuelLogComplete(
                      log.refuelLogs[log.refuelLogs.length - 1],
                    )
                  }
                  className={
                    log.refuelLogs.length > 0 &&
                    !isRefuelLogComplete(
                      log.refuelLogs[log.refuelLogs.length - 1],
                    )
                      ? "opacity-50"
                      : ""
                  }
                  title={
                    log.refuelLogs.length > 0 &&
                    !isRefuelLogComplete(
                      log.refuelLogs[log.refuelLogs.length - 1],
                    )
                      ? "Please complete the previous Refuel Log entry before adding another."
                      : ""
                  }
                >
                  <Plus className="h-4 w-4" color="white" />
                </Button>
              </div>
            </div>

            {/* Refuel Log Entries */}
            <div className="border-b py-2">
              {log.refuelLogs.map((ref, refIdx) => (
                <div
                  key={refIdx}
                  className="bg-slate-50 flex flex-col gap-4 mb-2 border p-2 rounded relative"
                >
                  <div className="flex flex-row gap-1 items-end">
                    <div className="flex flex-col">
                      <Label className="text-xs">Total Gallons Refueled</Label>
                      <Input
                        type="number"
                        placeholder="Total Gallons"
                        value={ref.gallonsRefueled || ""}
                        onChange={(e) => {
                          const updated = [...truckingLogs];
                          updated[idx].refuelLogs[refIdx].gallonsRefueled =
                            e.target.value;
                          setTruckingLogs(updated);
                        }}
                        className="bg-white w-[350px] text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-row gap-1 items-end">
                    <div className="flex flex-col">
                      <Label className="text-xs">Mileage at Refueling</Label>
                      <Input
                        type="number"
                        placeholder="Current Mileage"
                        value={ref.milesAtFueling || ""}
                        onChange={(e) => {
                          const updated = [...truckingLogs];
                          updated[idx].refuelLogs[refIdx].milesAtFueling =
                            e.target.value;
                          setTruckingLogs(updated);
                        }}
                        className="bg-white w-[350px] text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-end absolute right-0 top-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = [...truckingLogs];
                        updated[idx].refuelLogs = updated[
                          idx
                        ].refuelLogs.filter((_, i) => i !== refIdx);
                        setTruckingLogs(updated);
                      }}
                    >
                      <X className="h-4 w-4" color="red" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* State Line Mileage */}
            <div className="flex flex-row justify-between items-center my-2">
              <div className="flex-1">
                <p className="block font-semibold text-sm">
                  State Line Mileage
                </p>
                <p className="text-xs text-gray-500 pt-1">
                  This section logs the mileage at state borders for IFTA
                  reporting.
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  size="icon"
                  type="button"
                  onClick={() => {
                    const updated = [...truckingLogs];
                    updated[idx].stateMileages.push({
                      state: "",
                      stateLineMileage: "",
                    });
                    setTruckingLogs(updated);
                  }}
                  disabled={
                    log.stateMileages.length > 0 &&
                    !isStateMileageComplete(
                      log.stateMileages[log.stateMileages.length - 1],
                    )
                  }
                  className={
                    log.stateMileages.length > 0 &&
                    !isStateMileageComplete(
                      log.stateMileages[log.stateMileages.length - 1],
                    )
                      ? "opacity-50"
                      : ""
                  }
                  title={
                    log.stateMileages.length > 0 &&
                    !isStateMileageComplete(
                      log.stateMileages[log.stateMileages.length - 1],
                    )
                      ? "Please complete the previous State Mileage entry before adding another."
                      : ""
                  }
                >
                  <Plus className="h-8 w-8" color="white" />
                </Button>
              </div>
            </div>

            {/* State Line Mileage Entries */}
            <div className="pt-2">
              {log.stateMileages.map((sm, smIdx) => (
                <div
                  key={smIdx}
                  className="bg-slate-50 flex flex-col gap-4 mb-2 border p-2 rounded relative"
                >
                  <div className="flex flex-row gap-1 items-end">
                    <div className="flex flex-col">
                      <Label htmlFor="state" className="text-xs">
                        State
                      </Label>
                      <Select
                        name="state"
                        value={sm.state}
                        onValueChange={(val) => {
                          const updated = [...truckingLogs];
                          updated[idx].stateMileages[smIdx].state = val;
                          setTruckingLogs(updated);
                        }}
                      >
                        <SelectTrigger className="bg-white w-[350px] text-xs">
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {StateOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-row gap-1 items-end">
                    <div className="flex flex-col">
                      <Label htmlFor="stateLineMileage" className="text-xs">
                        State Line Mileage
                      </Label>
                      <Input
                        name="stateLineMileage"
                        type="number"
                        placeholder="State Line Mileage"
                        value={sm.stateLineMileage || ""}
                        onChange={(e) => {
                          const updated = [...truckingLogs];
                          updated[idx].stateMileages[smIdx].stateLineMileage =
                            e.target.value;
                          setTruckingLogs(updated);
                        }}
                        className="bg-white w-[350px] text-xs"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updated = [...truckingLogs];
                      updated[idx].stateMileages = updated[
                        idx
                      ].stateMileages.filter((_, i) => i !== smIdx);
                      setTruckingLogs(updated);
                    }}
                    className="absolute top-0 right-0"
                  >
                    <X className="w-4 h-4" color="red" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
