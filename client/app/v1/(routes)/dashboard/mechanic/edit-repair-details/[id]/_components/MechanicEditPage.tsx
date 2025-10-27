"use client";

import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Labels } from "@/components/(reusable)/labels";
import { Selects } from "@/components/(reusable)/selects";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Titles } from "@/components/(reusable)/titles";
import { useEffect, useMemo, useState } from "react";

import {
  deleteMaintenanceProject,
  RemoveDelayRepair,
  setEditForProjectInfo,
} from "@/actions/mechanicActions";
import debounce from "lodash.debounce";
import { useParams, useRouter } from "next/navigation";
import { NModals } from "@/components/(reusable)/newmodals";
import { Texts } from "@/components/(reusable)/texts";
import Spinner from "@/components/(animations)/spinner";
import { Inputs } from "@/components/(reusable)/inputs";
import { useTranslations } from "next-intl";
import { Priority } from "../../../../../../../../prisma/generated/prisma/client";

type Equipment = {
  id: string;
  name: string;
};

type RepairDetails = {
  id: string;
  equipmentId: string;
  equipmentIssue: string;
  additionalInfo: string;
  problemDiagnosis: string;
  solution: string;
  location: string;
  priority: string;
  createdBy: string;
  createdAt: Date;
  hasBeenDelayed: boolean;
  repaired: boolean;
  delay: Date | null;
  delayReasoning?: string;
  totalHoursLaboured: number;
  Equipment: Equipment;
};

type MechanicEditPageProps = {
  repairDetails: RepairDetails | undefined;
  setRepairDetails: React.Dispatch<
    React.SetStateAction<RepairDetails | undefined>
  >;
  totalLogs: number;
};

export default function MechanicEditPage({
  repairDetails,
  setRepairDetails,
  totalLogs,
}: MechanicEditPageProps) {
  // Use local state if needed for additional UI aspects (e.g. image selection)
  const router = useRouter();
  const t = useTranslations("MechanicWidget");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { id } = useParams();

  const PriorityOptions = [
    { label: t("SelectPriority"), value: "" },
    { label: t("HighPriority"), value: "HIGH" },
    { label: t("MediumPriority"), value: "MEDIUM" },
    { label: t("LowPriority"), value: "LOW" },
    { label: t("Today"), value: "TODAY" },
  ];

  // Helper function to update a field in repairDetails
  // Helper function to update a field in repairDetails.
  const updateField = (field: keyof RepairDetails, value: string) => {
    if (!repairDetails) return;
    const updatedDetails = { ...repairDetails, [field]: value };
    setRepairDetails(updatedDetails);
    debouncedUpdate(updatedDetails);
  };

  const deleteProject = async () => {
    if (!repairDetails) return;
    const response = await deleteMaintenanceProject(
      repairDetails.id.toString(),
    );
    if (response) {
      router.push("/dashboard/mechanic");
    }
  };

  const debouncedUpdate = useMemo(() => {
    return debounce(async (updatedDetails: RepairDetails) => {
      const formData = new FormData();
      Object.keys(updatedDetails).forEach((key) => {
        const value = updatedDetails[key as keyof RepairDetails] ?? "";
        formData.append(key, value as string);
      });
      await setEditForProjectInfo(formData);
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  // Ensure repairDetails is loaded before rendering the form
  if (!repairDetails) {
    return (
      <Grids rows={"8"} gap={"5"} className="pb-4">
        <Holds className="row-span-8 h-full justify-center items-center">
          <Spinner />
        </Holds>
      </Grids>
    );
  }

  const RemoveDelay = async () => {
    try {
      const formData = new FormData();
      if (id) {
        formData.append("id", id.toString());
      }

      // Optimistically update local state first
      if (repairDetails) {
        setRepairDetails({
          ...repairDetails,
          delay: null,
          delayReasoning: undefined,
          hasBeenDelayed: true,
        });
      }

      // Then make the server request
      const updatedRepair = await RemoveDelayRepair(formData);

      // If server update fails, revert local state
      if (!updatedRepair) {
        if (repairDetails) {
          setRepairDetails(repairDetails); // Revert to original
        }
        return;
      }

      // Optionally show success message
      // alert("Delay removed successfully");
    } catch (error) {
      console.error("Failed to remove delay:", error);
      // Revert local state on error
      if (repairDetails) {
        setRepairDetails(repairDetails);
      }
    }
  };

  return (
    <Grids rows={"7"} gap={"5"} className="h-full w-full ">
      <Holds
        className={` h-full w-full overflow-y-auto no-scrollbar ${
          totalLogs > 0 ? "row-start-1 row-end-8" : "row-start-1 row-end-7"
        } `}
      >
        <Contents width={"section"} className="">
          <Holds>
            <Labels size="p6" htmlFor="equipmentIssue">
              {t("EquipmentIssue")} <span className="text-red-500">*</span>
            </Labels>
            <TextAreas
              name="equipmentIssue"
              value={repairDetails?.equipmentIssue || ""}
              onChange={(e) => updateField("equipmentIssue", e.target.value)}
              placeholder={t("EnterAProblemDescription")}
              rows={3}
              className="text-xs"
              style={{ resize: "none" }}
              disabled={repairDetails?.repaired}
            />
          </Holds>
          <Holds>
            <Labels size="p6" htmlFor="additionalInfo">
              {t("AdditionalInfo")}
            </Labels>
            <TextAreas
              name="additionalInfo"
              value={repairDetails.additionalInfo}
              onChange={(e) => updateField("additionalInfo", e.target.value)}
              placeholder={t("AdditionalInfoPlaceholder")}
              rows={3}
              style={{ resize: "none" }}
              className="text-xs"
              disabled={repairDetails?.repaired}
            />
          </Holds>
          {/* Only show these fields if the repair has been completed */}
          {repairDetails?.repaired && (
            <>
              {/* Problem Diagnosis */}
              <Holds>
                <Labels size="p6" htmlFor="problemDiagnosis">
                  {t("ProblemDiagnosis")}
                </Labels>
                <TextAreas
                  name="problemDiagnosis"
                  value={repairDetails.problemDiagnosis || ""}
                  onChange={(e) =>
                    updateField("problemDiagnosis", e.target.value)
                  }
                  placeholder={t("ProblemDiagnosisPlaceholder")}
                  rows={2}
                  style={{ resize: "none" }}
                  className="text-sm"
                  disabled={repairDetails?.repaired}
                />
              </Holds>

              {/* solution */}
              <Holds>
                <Labels size="p6" htmlFor="solution">
                  {t("Solution")}
                </Labels>
                <TextAreas
                  name="solution"
                  value={repairDetails.solution || ""}
                  onChange={(e) => updateField("solution", e.target.value)}
                  placeholder={t("SolutionPlaceholder")}
                  rows={2}
                  style={{ resize: "none" }}
                  className="text-sm"
                  disabled={repairDetails?.repaired}
                />
              </Holds>
            </>
          )}
          {/* Location */}
          <Holds>
            <Labels size="p6" htmlFor="location">
              {t("Location")}
            </Labels>
            <Inputs
              name="location"
              value={repairDetails.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder={t("LocationPlaceholder")}
              className="text-xs text-center"
              disabled={repairDetails?.repaired}
            />
          </Holds>
          {/* Priority Status */}
          <Holds className="relative h-full ">
            <Labels size="p6" htmlFor="priority">
              {t("Status")} <span className="text-red-500">*</span>
            </Labels>

            <Holds className="relative w-full">
              {repairDetails?.repaired ? (
                <Inputs
                  name="priority"
                  value={repairDetails.priority}
                  className="w-full text-center"
                  disabled
                />
              ) : (
                <Selects
                  name="priority"
                  value={repairDetails.priority}
                  onChange={(e) => {
                    const newPriority = e.target.value as Priority;
                    updateField("priority", newPriority);
                  }}
                  className={`text-center ${
                    repairDetails.priority === "" ? "text-app-gray" : ""
                  }`}
                  disabled={repairDetails?.repaired}
                >
                  {PriorityOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className={`text-center `}
                    >
                      {option.label}
                    </option>
                  ))}
                </Selects>
              )}

              {/* Adjust Image to Overlay Select Box */}
              {repairDetails?.priority !== "" && (
                <Images
                  titleImg={
                    repairDetails.delay
                      ? "/priorityDelay.svg"
                      : repairDetails.priority === "TODAY"
                        ? "/todayPriority.svg"
                        : repairDetails.priority === "HIGH"
                          ? "/priorityHigh.svg"
                          : repairDetails.priority === "MEDIUM"
                            ? "/priorityMedium.svg"
                            : repairDetails.priority === "LOW"
                              ? "/priorityLow.svg"
                              : repairDetails.priority === "PENDING"
                                ? "/priorityPending.svg"
                                : ""
                  }
                  className="absolute left-2 top-1/4 transform -translate-y-1/4 w-6 h-6"
                  titleImgAlt={t("Status")}
                />
              )}
            </Holds>

            {repairDetails?.delay ? (
              <>
                <Holds>
                  <Texts position={"right"} size={"p6"}>
                    {t("RemoveDelay")}
                  </Texts>
                  <Buttons
                    background={"red"}
                    className="w-[15%]"
                    position={"right"}
                    shadow={"none"}
                    onClick={RemoveDelay}
                  >
                    <Images
                      titleImg={"/trash.svg"}
                      titleImgAlt={"trash"}
                      className="mx-auto w-9 h-9 p-1"
                    />
                  </Buttons>
                </Holds>
                <Holds>
                  <Labels size="p6" htmlFor="delayReasoning">
                    {t("DelayReasoning")}
                  </Labels>
                  <Selects
                    name="delayReasoning"
                    value={repairDetails.delayReasoning}
                    onChange={(e) => {
                      updateField("delayReasoning", e.target.value);
                    }}
                    className="text-center"
                  >
                    <option value="">{t("NoDelay")}</option>
                    <option value="Delay">{t("Delay")}</option>
                  </Selects>
                </Holds>
                <Holds className="pb-5">
                  <Labels size="p6" htmlFor="delay">
                    {t("ExpectedArrival")}
                  </Labels>
                  <Inputs
                    type="date"
                    name="delay"
                    value={repairDetails.delay?.toString().split("T")[0]}
                    onChange={(e) => {
                      const newDelay = new Date(e.target.value).toISOString();
                      updateField("delay", newDelay);
                    }}
                    className="text-center text-sm"
                  />
                </Holds>
              </>
            ) : (
              <Holds>
                <Texts position={"right"} size={"p6"}>
                  {t("AddDelay")}
                </Texts>
                <Buttons
                  background={"lightBlue"}
                  className="w-[15%]"
                  position={"right"}
                  shadow={"none"}
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    updateField("delay", tomorrow.toISOString());
                  }}
                >
                  <Images
                    titleImg={"/plus.svg"}
                    titleImgAlt={"add"}
                    className="mx-auto w-9 h-9 p-1"
                  />
                </Buttons>
              </Holds>
            )}
          </Holds>
        </Contents>
      </Holds>

      {totalLogs === 0 && (
        <Holds className="row-start-7 row-end-8 h-full ">
          <Contents width={"section"}>
            <Buttons
              background={"red"}
              onClick={() => setOpenDeleteModal(true)}
              className=""
            >
              <Titles size={"h4"}>{t("Delete")}</Titles>
            </Buttons>
          </Contents>
        </Holds>
      )}
      <NModals
        size={"medWW"}
        isOpen={openDeleteModal}
        handleClose={() => setOpenDeleteModal(false)}
      >
        <Holds className="h-full w-full">
          <Grids rows={"3"} cols={"2"} gap={"5"}>
            <Holds className="row-span-2 col-span-2">
              <Texts size={"p2"}>{t("AreYouSureYouWantToDelete")}</Texts>
            </Holds>
            <Holds className="row-span-1 col-span-1 ">
              <Buttons background={"green"} onClick={deleteProject}>
                <Titles size={"h4"}>{t("Yes")}</Titles>
              </Buttons>
            </Holds>
            <Holds className="row-span-1 col-span-1  ">
              <Buttons
                background={"red"}
                onClick={() => setOpenDeleteModal(false)}
              >
                <Titles size={"h4"}>{t("Cancel")}</Titles>
              </Buttons>
            </Holds>
          </Grids>
        </Holds>
      </NModals>
    </Grids>
  );
}
