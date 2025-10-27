// app/components/MaintenanceLogEquipment.tsx
"use client";

import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { Labels } from "@/components/(reusable)/labels";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Texts } from "@/components/(reusable)/texts";
import { Grids } from "@/components/(reusable)/grids";
import { Selects } from "@/components/(reusable)/selects";
import { Buttons } from "@/components/(reusable)/buttons";
import { deleteMaintenanceInEquipment } from "@/actions/equipmentActions";
import { Titles } from "@/components/(reusable)/titles";
import { useState } from "react";
import { NModals } from "@/components/(reusable)/newmodals";
import { useNotification } from "@/app/context/NotificationContext";
import { EquipmentLog } from "../types";
import { EquipmentState } from "../../../../../../../prisma/generated/prisma/client";

interface MaintenanceLogEquipmentProps {
  formState: EquipmentLog;
  handleFieldChange: (
    field: string,
    value: string | number | boolean | EquipmentState | null,
  ) => void;
  t: (key: string) => string;
  hasChanged: boolean | undefined;
}

export default function MaintenanceLogEquipment({
  t,
  handleFieldChange,
  formState,
  hasChanged,
}: MaintenanceLogEquipmentProps) {
  const { setNotification } = useNotification();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      if (formState.maintenanceId?.id) {
        await deleteMaintenanceInEquipment(formState.maintenanceId.id);
        handleFieldChange("maintenanceId", null);
        handleFieldChange("equipment.status", "AVAILABLE");
        setNotification(t("MaintenanceRequestWithdrawn"), "success");
      }
    } catch (error) {
      console.error("Error deleting maintenance request:", error);
      setNotification(t("ErrorDeletingMaintenanceRequest"), "error");
    }
    setShowConfirmDialog(false);
  };

  const handleDeleteRequest = () => {
    setShowConfirmDialog(true);
  };

  return (
    <>
      {formState.equipment.status === "AVAILABLE" &&
      formState.fullyOperational ? (
        <Holds className="row-start-1 row-end-8 h-full">
          <Holds className="flex justify-center items-center h-full w-full">
            <Titles size="h3">{t("EquipmentOperational")}</Titles>
          </Holds>
        </Holds>
      ) : (
        <Holds className="row-start-1 row-end-8 h-full py-3 flex-1 overflow-y-auto no-scrollbar">
          <Holds>
            <Texts size="xs" text={"italic"} className="mb-2">
              {t("UpdateFields")}
            </Texts>
          </Holds>
          <Holds className="relative">
            <Labels size="p6">
              {t("EquipmentStatus")} <span className="text-red-500">*</span>
            </Labels>
            <Selects
              value={formState.equipment.status}
              onChange={(e) =>
                handleFieldChange(
                  "equipment.status",
                  e.target.value as EquipmentState,
                )
              }
              className="w-full text-base text-center"
            >
              <option value="AVAILABLE">{t("SelectAStatus")}</option>

              <option value="NEEDS_REPAIR">{t("NeedsRepair")}</option>
            </Selects>
          </Holds>

          <Holds className="relative">
            <Labels size="p6">
              {t("EquipmentIssue")} <span className="text-red-500">*</span>
            </Labels>
            <TextAreas
              maxLength={40}
              placeholder={t("DescribeTheEquipmentIssue")}
              value={formState.maintenanceId?.equipmentIssue || ""}
              onChange={(e) =>
                handleFieldChange(
                  "maintenanceId.equipmentIssue",
                  e.target.value,
                )
              }
              rows={4}
              required
              className="w-full text-sm"
              style={{ resize: "none" }}
            />
            <Texts
              size="p3"
              className="text-gray-500 absolute bottom-4 right-2"
            >
              {formState.maintenanceId?.equipmentIssue?.length || 0}/40
            </Texts>
          </Holds>

          <Holds className="relative">
            <Labels size="p6">{t("AdditionalInformation")}</Labels>
            <TextAreas
              maxLength={40}
              placeholder={t("ProvideAnyAdditionalInformation")}
              value={formState.maintenanceId?.additionalInfo || ""}
              onChange={(e) =>
                handleFieldChange(
                  "maintenanceId.additionalInfo",
                  e.target.value,
                )
              }
              rows={4}
              required
              className="w-full text-sm"
              style={{ resize: "none" }}
            />
            <Texts
              size="p3"
              className="text-gray-500 absolute bottom-4 right-2"
            >
              {formState.maintenanceId?.additionalInfo?.length || 0}/40
            </Texts>
          </Holds>

          <Holds className="relative">
            {formState.maintenanceId?.id && (
              <Buttons
                background="red"
                onClick={handleDeleteRequest}
                className="mt-4 py-2"
              >
                <Holds className="flex  items-center justify-center">
                  <Titles size="h6">{t("WithdrawRequest")}</Titles>
                </Holds>
              </Buttons>
            )}
          </Holds>
        </Holds>
      )}

      <NModals
        isOpen={showConfirmDialog}
        handleClose={() => setShowConfirmDialog(false)}
        size={"xlWS"}
        background="noOpacity"
      >
        <Holds className="w-full h-full items-center justify-center text-center px-4">
          <Titles size="h3" className="mb-4">
            {"Are you sure you want to withdraw this maintenance request?"}
          </Titles>
          <Holds className="flex flex-col gap-4 p-4">
            <Holds className="flex gap-4 justify-center">
              <Buttons
                shadow="none"
                className="py-2"
                background="red"
                onClick={handleConfirmDelete}
              >
                <Holds>
                  <Titles size="h5">{t("YesWithdraw")}</Titles>
                </Holds>
              </Buttons>
              <Buttons
                shadow="none"
                className="py-2"
                background="lightBlue"
                onClick={() => setShowConfirmDialog(false)}
              >
                <Holds>
                  <Titles size="h5">{t("NoCancel")}</Titles>
                </Holds>
              </Buttons>
            </Holds>
          </Holds>
        </Holds>
      </NModals>
    </>
  );
}
