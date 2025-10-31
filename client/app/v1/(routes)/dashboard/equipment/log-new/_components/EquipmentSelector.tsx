"use client";
import { useUserStore } from "@/app/lib/store/userStore";
import { apiRequest } from "@/app/lib/utils/api-Utils";
import { EquipmentSelector } from "@/app/v1/components/(clock)/(General)/equipmentSelector";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { Titles } from "@/app/v1/components/(reusable)/titles";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, RefObject } from "react";

type Option = {
  id: string;
  label: string;
  code: string;
};
export default function EquipmentSelectorView({
  setStep,
  setMethod,
  setEquipment,
  equipment,
  jobSite,
  submitRef,
}: {
  setStep: Dispatch<SetStateAction<number>>;
  setMethod: Dispatch<SetStateAction<"" | "Scan" | "Select">>;
  setEquipment: Dispatch<SetStateAction<Option>>;
  equipment: Option;
  jobSite: Option;
  submitRef: RefObject<boolean>;
}) {
  const { user } = useUserStore();
  const router = useRouter();
  const t = useTranslations("Equipment");

  const id = user?.id || ""; // Get the user ID from the session

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current) return;
    submitRef.current = true;

    try {
      // Get timesheet ID from local storage (same logic as EquipmentScanner)
      const timeSheetData = localStorage.getItem("timesheetId");
      let timeSheetId: string | null = null;

      if (timeSheetData) {
        try {
          const parsedData = JSON.parse(timeSheetData);
          timeSheetId = parsedData.id.toString();
        } catch (e) {
          console.error("Error parsing timesheet data from localStorage:", e);
        }
      }

      if (!timeSheetId) {
        throw new Error("No active timesheet found. Please clock in first.");
      }

      const response = await apiRequest(
        "/api/v1/timesheet/equipment-log",
        "POST",
        {
          equipmentId: equipment?.id || "",
          timeSheetId: timeSheetId,
          jobsiteId: jobSite?.id || "",
          userId: id,
        }
      );

      if (response.success) {
        router.push("/v1/dashboard/equipment");
      }
    } catch (error) {
      console.error("Error creating equipment log:", error);
      // You might want to show an error message to the user here
    } finally {
      submitRef.current = false;
    }
  };

  return (
    <Holds className="h-full pb-5">
      <Grids rows={"7"} gap={"5"}>
        <Holds className="row-start-1 row-end-2 h-full w-full">
          <TitleBoxes
            onClick={() => {
              setStep(1);
              setMethod("");
            }}
          >
            <Holds className="flex items-center justify-end w-full h-full">
              <Titles size={"h2"}>{t("SelectEquipment")}</Titles>
            </Holds>
          </TitleBoxes>
        </Holds>

        <Holds className="h-full row-start-2 row-end-8">
          <Contents width={"section"} className="h-full">
            <Grids rows={"7"} gap={"5"}>
              <Holds className="h-full w-full row-start-1 row-end-7 pt-5 ">
                <EquipmentSelector
                  onEquipmentSelect={(equipment) => {
                    if (equipment) {
                      setEquipment(equipment); // Update the equipment state with the full Option object
                    } else {
                      setEquipment({ id: "", code: "", label: "" }); // Reset if null
                    }
                  }}
                  initialValue={equipment}
                />
              </Holds>
              <Holds className="w-full row-start-7 row-end-8">
                <Buttons
                  onClick={(e) => onSubmit(e)}
                  background="orange"
                  className="py-3"
                  type="submit"
                  disabled={submitRef.current}
                >
                  <Titles size={"h4"}>{t("SubmitSelection")}</Titles>
                </Buttons>
              </Holds>
            </Grids>
          </Contents>
        </Holds>
      </Grids>
    </Holds>
  );
}
