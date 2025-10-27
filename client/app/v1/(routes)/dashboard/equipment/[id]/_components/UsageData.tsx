import { CheckBox } from "@/components/(inputs)/checkBox";
import { Buttons } from "@/components/(reusable)/buttons";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Labels } from "@/components/(reusable)/labels";
import { Texts } from "@/components/(reusable)/texts";
import { format, parseISO } from "date-fns";
import { TextAreas } from "@/components/(reusable)/textareas";
import { useNotification } from "@/app/context/NotificationContext";
import { Dispatch, SetStateAction, useState } from "react";
import { EquipmentLog, RefuelLogData } from "../types";
import { Images } from "@/components/(reusable)/images";
import { EquipmentState } from "../../../../../../../prisma/generated/prisma/client";

interface UsageDataProps {
  formState: EquipmentLog;
  handleFieldChange: (
    field: string,
    value: string | number | boolean | EquipmentState | RefuelLogData | null,
  ) => void;
  formattedTime: string;
  handleChangeRefueled: () => void;
  handleFullOperational: () => void;
  AddRefuelLog: (gallons: number, existingLogId?: string) => void;
  refuelLog: RefuelLogData | null;
  setRefuelLog: Dispatch<SetStateAction<RefuelLogData | null>>;
  t: (key: string) => string;
  isRefueled: boolean;
  deleteLog: () => Promise<void>;
  saveEdits: () => Promise<void>;
  isFormValid: () => boolean | "" | null | undefined;
}

export default function UsageData({
  formState,
  handleFieldChange,
  formattedTime,
  handleChangeRefueled,
  handleFullOperational,
  AddRefuelLog,
  refuelLog,
  setRefuelLog,
  t,
  isRefueled,
  deleteLog,
  saveEdits,
  isFormValid,
}: UsageDataProps) {
  const { setNotification } = useNotification();

  return (
    <Holds className="row-start-1 row-end-8 w-full h-full overflow-y-auto no-scrollbar">
      <Holds className="w-full h-fit">
        <Holds className="w-full">
          <Holds className="w-full mb-2">
            <Labels size="p5">{t("StartTime")}</Labels>
            <Inputs
              type="time"
              value={
                formState.startTime
                  ? format(new Date(formState.startTime), "HH:mm")
                  : ""
              }
              className="w-full border-[3px] border-black p-1 rounded-[10px] flex-col items-center"
              onChange={(e) => {
                const newTime = e.target.value;
                const currentDate = new Date(formState.startTime || new Date());
                const [newHours, newMinutes] = newTime.split(":").map(Number);

                // Create a new date preserving the original date but with new time in local timezone
                const updatedDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                  newHours,
                  newMinutes,
                  0,
                  0,
                );
                handleFieldChange("startTime", updatedDate.toISOString());
              }}
            />
          </Holds>
          <Holds className="w-full">
            <Labels size="p5">{t("EndTime")}</Labels>
            <Inputs
              type="time"
              value={
                formState.endTime
                  ? format(new Date(formState.endTime), "HH:mm")
                  : ""
              }
              className="w-full border-[3px] border-black p-1 rounded-[10px]"
              onChange={(e) => {
                const newTime = e.target.value;
                const currentDate = new Date(formState.endTime || new Date());
                const [newHours, newMinutes] = newTime.split(":").map(Number);

                // Create a new date preserving the original date but with new time in local timezone
                const updatedDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                  newHours,
                  newMinutes,
                  0,
                  0,
                );
                handleFieldChange("endTime", updatedDate.toISOString());
              }}
            />
          </Holds>
        </Holds>
        <Texts position={"right"} size="p6">
          <span className="italic mr-1">{t("Duration:")}</span> {formattedTime}
        </Texts>
      </Holds>

      <Holds background="white" className="w-full relative h-fit mb-4">
        <Labels size="p5">{t("Comment")}</Labels>
        <TextAreas
          maxLength={40}
          rows={4}
          placeholder={t("EnterCommentsHere")}
          value={formState.comment || ""}
          onChange={(e) => handleFieldChange("comment", e.target.value)}
          className="text-sm"
        />
        <Texts
          size="p3"
          className={`${
            typeof formState.comment === "string" &&
            formState.comment.length >= 40
              ? "text-red-500 absolute bottom-4 right-4"
              : "absolute bottom-4 right-4"
          }`}
        >
          {`${
            typeof formState.comment === "string" ? formState.comment.length : 0
          }/40`}
        </Texts>
      </Holds>

      {/* Gallons Refueled - Always visible */}
      <Holds background="white" className="w-full relative h-fit mb-4">
        <Labels size="p5">{t("GallonsRefueled")}</Labels>
        <Holds className="relative">
          <Inputs
            type="number"
            step="0.1"
            min="0"
            placeholder={t("EnterGallonsRefueled")}
            value={refuelLog?.gallonsRefueled?.toString() || ""}
            onChange={(e) => {
              const gallons = parseFloat(e.target.value) || 0;
              if (e.target.value === "") {
                // If input is empty, set refuelLog to null
                setRefuelLog(null);
              } else {
                // Update or create refuel log
                const updatedRefuelLog = refuelLog
                  ? { ...refuelLog, gallonsRefueled: gallons }
                  : { id: "temp-" + Date.now(), gallonsRefueled: gallons };
                setRefuelLog(updatedRefuelLog);
              }
            }}
            className="border-[3px] border-black p-2 pr-10 rounded-[10px] text-sm w-full mb-0"
          />
          {/* Clear/Delete X button */}
          {(refuelLog?.gallonsRefueled || 0) > 0 && (
            <Buttons
              shadow="none"
              background="none"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-4 p-0 flex items-center justify-center rounded-full"
              onClick={() => {
                // Clear the input and delete refuel log
                setRefuelLog(null);
                setNotification(
                  t("RefuelLogRemoved") || t("RefuelLogCleared"),
                  "success",
                );
              }}
            >
              <span className="text-lg leading-none">X</span>
            </Buttons>
          )}
        </Holds>
      </Holds>
    </Holds>
  );
}
