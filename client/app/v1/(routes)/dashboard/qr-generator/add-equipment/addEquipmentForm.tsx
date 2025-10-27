"use client";
import React, { useState, useEffect, useRef } from "react";
import { Buttons } from "@/components/(reusable)/buttons";
import {
  createEquipment,
  equipmentTagExists,
} from "@/actions/equipmentActions";
import { useTranslations } from "next-intl";
import { Inputs } from "@/components/(reusable)/inputs";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Selects } from "@/components/(reusable)/selects";
import { Titles } from "@/components/(reusable)/titles";
import { Holds } from "@/components/(reusable)/holds";
import { Contents } from "@/components/(reusable)/contents";
import { v4 as uuidv4 } from "uuid";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDashboardData } from "@/app/(routes)/admins/_pages/sidebar/DashboardDataContext";

export type JobCode = {
  id: string;
  qrId: string;
  name: string;
};

export default function AddEquipmentForm({}) {
  const t = useTranslations("Generator");
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user.id;
  const submitterName = session?.user.firstName + " " + session?.user.lastName;
  const [eqCode, setEQCode] = useState("");
  const { refresh } = useDashboardData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValidation, setFormValidation] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    equipmentTag: "",
    temporaryEquipmentName: "",
    destination: "",
    creationReasoning: "",
    ownershipType: "",
  });

  // Replace your current validation constants with this function
  const validateForm = () => {
    return (
      formData.equipmentTag.trim() !== "" &&
      formData.temporaryEquipmentName.trim() !== "" &&
      formData.creationReasoning.trim() !== "" &&
      formData.destination.trim() !== "" &&
      formData.ownershipType.trim() !== "" &&
      eqCode.trim() !== "" &&
      userId
    );
  };

  // Update validation whenever form data changes
  useEffect(() => {
    setFormValidation(Boolean(validateForm()));
  }, [formData, eqCode, userId]);

  useEffect(() => {
    async function generateQrCode() {
      try {
        const result = uuidv4();
        setEQCode(`EQ-${result}`);
        const response = await equipmentTagExists(result);
        if (response) {
          setEQCode("");
          return generateQrCode();
        }
      } catch (error) {
        console.error(`${t("GenerateError")}`, error);
      }
    }
    generateQrCode();
  }, [t]);

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "overWeight"
          ? value === "true"
            ? true
            : value === "false"
              ? false
              : null
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValidation || !userId) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append("eqCode", eqCode);
      formDataToSend.append("createdById", userId || "");
      formDataToSend.append("submitterName", submitterName || "");

      const response = await createEquipment(formDataToSend);
      if (response.success) {
        // send notification to subscribers
        const notificationResponse = await fetch(
          "/api/notifications/send-multicast",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              topic: "items",
              title: "Equipment Created",
              message: `${response.data?.name || "An equipment"} has been submitted by ${response.data?.createdBy?.firstName || ""} ${response.data?.createdBy?.lastName || "a user"} and is pending approval.`,
              link: "/admins/equipment?isPendingApproval=true",
              referenceId: response.data?.id,
            }),
          },
        );
        await notificationResponse.json();
        if (notificationResponse.ok) {
          refresh();
        }

        router.push("/dashboard/qr-generator");
      }

      return;
    } catch (error) {
      console.error(`${t("CreateError")}`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Holds background={"white"} className="row-start-1 row-end-2 h-full">
        <TitleBoxes position={"row"} onClick={() => router.back()}>
          <Titles size={"lg"}>{t("NewEquipmentForm")}</Titles>
        </TitleBoxes>
      </Holds>
      <Holds
        background={"white"}
        className="row-start-2 row-end-8 overflow-auto no-scrollbar h-full"
      >
        <form onSubmit={handleSubmit} className="h-full w-full">
          <Contents width={"section"}>
            {/* Equipment Details Section */}
            <Holds className="h-full mt-4">
              <Titles
                position={"left"}
                size={"md"}
                className="mb-2 border-b pb-2 text-gray-800"
              >
                {t("EquipmentDetails") || "Equipment Details"}
              </Titles>
              <Holds className="pb-3">
                <label
                  htmlFor="equipmentTag"
                  className="block text-xs font-medium mb-1 text-gray-700"
                >
                  {t("EquipmentTypeLabel") || "Equipment Type"}
                </label>
                <Selects
                  id="equipmentTag"
                  value={formData.equipmentTag}
                  onChange={handleInputChange}
                  name="equipmentTag"
                  className={`text-xs text-center h-full py-2 ${formData.equipmentTag === "" && "text-app-dark-gray"}`}
                  required
                >
                  <option value="" disabled>
                    {t("SelectEquipmentType")}
                  </option>
                  <option value="VEHICLE">{t("Vehicle")}</option>
                  <option value="TRUCK">{t("Truck")}</option>
                  <option value="EQUIPMENT">{t("Equipment")}</option>
                  {/* <option value="TRAILER">{t("Trailer")}</option> */}
                </Selects>
              </Holds>
              <Holds className="pb-3">
                <label
                  htmlFor="ownershipType"
                  className="block text-xs font-medium mb-1 text-gray-700"
                >
                  {t("OwnershipTypeLabel") || "Ownership Type"}
                </label>
                <Selects
                  id="ownershipType"
                  value={formData.ownershipType}
                  onChange={handleInputChange}
                  name="ownershipType"
                  className={`text-xs text-center h-full py-2 ${formData.ownershipType === "" && "text-app-dark-gray"}`}
                  required
                >
                  <option value="" disabled>
                    {t("SelectOwnershipType") || "Select Ownership Type"}
                  </option>
                  <option value="OWNED">{t("OWNED")}</option>
                  <option value="LEASED">{t("LEASED")}</option>
                  <option value="RENTAL">{t("RENTAL")}</option>
                </Selects>
              </Holds>
              <Holds className="pb-3">
                <label
                  htmlFor="temporaryEquipmentName"
                  className="block text-xs font-medium mb-1 text-gray-700"
                >
                  {t("TemporaryEquipmentNameLabel") ||
                    "Temporary Equipment Name"}
                </label>
                <Inputs
                  id="temporaryEquipmentName"
                  type="text"
                  name="temporaryEquipmentName"
                  value={formData.temporaryEquipmentName}
                  placeholder={t("TemporaryEquipmentName")}
                  className="text-xs pl-3 py-2"
                  onChange={handleInputChange}
                  required
                />
              </Holds>
              <Holds className="pb-3">
                <label
                  htmlFor="destination"
                  className="block text-xs font-medium mb-1 text-gray-700"
                >
                  {t("CurrentLocationLabel") || "Current Location"}
                </label>
                <Inputs
                  id="destination"
                  type="text"
                  name="destination"
                  value={formData.destination}
                  placeholder={t("SelectDestination")}
                  className="text-xs pl-3 py-2"
                  onChange={handleInputChange}
                  required
                />
              </Holds>
            </Holds>
            <div className="border-t my-3" />
            {/* Creation Details Section */}
            <Holds background={"white"} className="h-full">
              <Titles
                position={"left"}
                size={"md"}
                className="mb-2 border-b pb-2 text-gray-800"
              >
                {t("CreationDetails") || "Creation Details"}
              </Titles>
              <Holds className="h-full pb-3">
                <label
                  htmlFor="creationReasoning"
                  className="block text-xs font-medium mb-1 text-gray-700"
                >
                  {t("ReasonForCreatingLabel") || "Reason for Creating"}
                </label>
                <TextAreas
                  id="creationReasoning"
                  name="creationReasoning"
                  value={formData.creationReasoning}
                  placeholder={t("EQCreationReasoning")}
                  className="text-xs pl-3 h-full"
                  rows={5}
                  onChange={handleInputChange}
                  required
                />
              </Holds>
            </Holds>
            <div className="border-t my-3" />
            {/* Submit Button */}
            <Holds className=" flex items-center justify-center pb-3">
              <Buttons
                background={formValidation ? "green" : "darkGray"}
                type="submit"
                disabled={!formValidation || isSubmitting}
                className="w-full py-2 transition-colors duration-200"
              >
                <Titles size={"lg"}>
                  {isSubmitting ? t("Submitting") : t("CreateEquipment")}
                </Titles>
              </Buttons>
            </Holds>
          </Contents>
        </form>
      </Holds>
    </>
  );
}
