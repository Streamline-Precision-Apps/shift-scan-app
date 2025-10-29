"use client";
import { v4 as uuidv4 } from "uuid";
import React, { useState, useEffect } from "react";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import {
  createJobsite,
  jobExists,
  sendJobsiteNotification,
} from "@/app/lib/actions/jobsiteActions";
import { useTranslations } from "next-intl";
import { Inputs } from "@/app/v1/components/(reusable)/inputs";
import { TextAreas } from "@/app/v1/components/(reusable)/textareas";
import { useRouter } from "next/navigation";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Selects } from "@/app/v1/components/(reusable)/selects";
import { StateOptions } from "@/app/lib/data/stateValues";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { useUserStore } from "@/app/lib/store/userStore";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Bases } from "@/app/v1/components/(reusable)/bases";

export default function AddJobsiteForm() {
  const t = useTranslations("Generator");
  const { user } = useUserStore();
  const router = useRouter();
  const userId = user?.id;
  const submitterName = user?.firstName + " " + user?.lastName;
  const [qrCode, setQrCode] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    temporaryJobsiteName: "",
    creationComment: "",
    creationReasoning: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const isFormValid =
    formData.temporaryJobsiteName.trim() !== "" &&
    formData.creationComment.trim() !== "" &&
    formData.creationReasoning.trim() !== "" &&
    qrCode.trim() !== "" &&
    userId &&
    formData.address.trim() !== "" &&
    formData.code.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.state.trim() !== "" &&
    formData.zipCode.trim().length >= 5 &&
    formData.zipCode.trim().length <= 9;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate QR code on mount
  useEffect(() => {
    async function generateQrCode() {
      try {
        const result = uuidv4();
        const response = await jobExists(result);
        if (response.available === false) {
          // QR code is already in use, try again
          return generateQrCode();
        }
        // QR code is available, set it
        setQrCode(result);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    }
    generateQrCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !userId) return;
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append("qrCode", qrCode);
      formDataToSend.append("createdById", userId);
      formDataToSend.append("submitterName", submitterName);
      const response = await createJobsite(formDataToSend);
      if (response) {
        await sendJobsiteNotification({
          topic: "items",
          title: "Jobsite Created",
          message: `${
            response.data?.name || "A jobsite"
          } has been submitted by ${
            response.data?.createdBy?.firstName || ""
          } ${
            response.data?.createdBy?.lastName || "a user"
          } and is pending approval.`,
          link: `/admins/jobsites?isPendingApproval=true`,
          referenceId: response.data?.id,
        });
      }
      router.push("/v1/dashboard/qr-generator");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"}>
          <Holds background={"white"} className="row-start-1 row-end-2 h-full">
            <TitleBoxes position={"row"} onClick={() => router.back()}>
              <Titles size={"lg"} className="">
                {t("NewJobsiteForm")}
              </Titles>
            </TitleBoxes>
          </Holds>
          <Holds
            background={"white"}
            className="row-start-2 row-end-8 overflow-auto no-scrollbar h-full"
          >
            <form onSubmit={handleSubmit} className="h-full w-full">
              <Contents width={"section"}>
                {/* Address Section */}
                <Holds className="h-full my-4">
                  <Titles
                    position={"left"}
                    size={"md"}
                    className=" mb-2 border-b pb-2 text-gray-800"
                  >
                    {t("JobsiteDetails")}
                  </Titles>
                  <Holds className="pb-3">
                    <label
                      htmlFor="code"
                      className="block text-xs font-medium mb-1 text-gray-700"
                    >
                      {t("TemporaryJobsiteCodeLabel")}
                    </label>
                    <Inputs
                      id="code"
                      type="text"
                      name="code"
                      value={formData.code}
                      placeholder={t("TemporaryJobsiteCode")}
                      className="text-sm p-2"
                      onChange={handleInputChange}
                      required
                    />
                  </Holds>
                  <Holds className="pb-3">
                    <label
                      htmlFor="temporaryJobsiteName"
                      className="block text-xs font-medium mb-1 text-gray-700"
                    >
                      {t("TemporaryJobsiteNameLabel")}
                    </label>
                    <Inputs
                      id="temporaryJobsiteName"
                      type="text"
                      name="temporaryJobsiteName"
                      value={formData.temporaryJobsiteName}
                      placeholder={t("TemporaryJobsiteName")}
                      className="text-sm p-2"
                      onChange={handleInputChange}
                      required
                    />
                  </Holds>
                  <Holds className="pb-3">
                    <label
                      htmlFor="creationComment"
                      className="block text-xs font-medium mb-1 text-gray-700"
                    >
                      {t("JobsiteDescription")}
                    </label>
                    <TextAreas
                      id="creationComment"
                      name="creationComment"
                      value={formData.creationComment}
                      placeholder={t("TemporaryJobsiteDescription")}
                      className="text-sm p-2"
                      rows={5}
                      onChange={handleInputChange}
                      required
                    />
                  </Holds>
                </Holds>
                <div className="border-t mb-2" />
                {/* Address info */}
                <Holds className="h-full mb-2">
                  <Titles
                    position={"left"}
                    size={"md"}
                    className=" mb-2 border-b pb-2 text-gray-800"
                  >
                    {t("Address")}
                  </Titles>
                  <Holds className="pb-3">
                    <label
                      htmlFor="address"
                      className="block text-xs font-medium mb-1 text-gray-700"
                    >
                      {t("Street")}
                    </label>
                    <Inputs
                      id="address"
                      type="text"
                      name="address"
                      value={formData.address}
                      placeholder={t("AddressInformation")}
                      className="text-sm p-2"
                      onChange={handleInputChange}
                      required
                    />
                  </Holds>
                  <Holds className="pb-3">
                    <label
                      htmlFor="city"
                      className="block text-xs font-medium mb-1 text-gray-700"
                    >
                      {t("CityLabel")}
                    </label>
                    <Inputs
                      id="city"
                      type="text"
                      name="city"
                      value={formData.city}
                      placeholder={t("City")}
                      className="text-sm p-2"
                      onChange={handleInputChange}
                      required
                    />
                  </Holds>
                  <Holds className="pb-3">
                    <label
                      htmlFor="state"
                      className="block text-xs font-medium mb-1 text-gray-700"
                    >
                      {t("State")}
                    </label>
                    <Selects
                      id="state"
                      name="state"
                      value={formData.state}
                      className="text-sm p-2"
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">{t("SelectState")}</option>
                      {StateOptions.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </Selects>
                  </Holds>

                  <Holds className="w-full pb-3">
                    <label
                      htmlFor="zipCode"
                      className="block text-xs font-medium mb-1 text-gray-700"
                    >
                      {t("ZipCodeLabel")}
                    </label>
                    <Inputs
                      id="zipCode"
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      placeholder={t("ZipCode")}
                      className="text-sm p-2"
                      onChange={handleInputChange}
                      required
                      minLength={5}
                      maxLength={9}
                    />
                  </Holds>
                </Holds>
                <div className="border-t mb-2" />
                {/* Creation Details Section */}
                <Holds
                  background={"white"}
                  className="row-start-4 row-end-6 h-full"
                >
                  <Titles
                    position={"left"}
                    size={"md"}
                    className="mb-2 border-b pb-2 text-gray-800"
                  >
                    {t("CreationDetails")}
                  </Titles>

                  <Holds className="h-full pb-3">
                    <label
                      htmlFor="creationReasoning"
                      className="block text-xs font-medium mb-1 text-gray-700"
                    >
                      {t("ReasonForCreatingLabel")}
                    </label>
                    <TextAreas
                      id="creationReasoning"
                      name="creationReasoning"
                      value={formData.creationReasoning}
                      placeholder={t("CreationReasoning")}
                      rows={5}
                      className="text-sm"
                      onChange={handleInputChange}
                      required
                    />
                  </Holds>
                </Holds>
                <div className="border-t my-3" />
                {/* Submit Button */}
                <Holds className="flex items-center justify-center pb-3">
                  <Buttons
                    background={isFormValid ? "green" : "darkGray"}
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="w-full py-2 transition-colors duration-200"
                  >
                    <Titles size={"lg"}>
                      {isSubmitting ? t("Submitting") : t("SubmitJobsite")}
                    </Titles>
                  </Buttons>
                </Holds>
              </Contents>
            </form>
          </Holds>
        </Grids>
      </Contents>
    </Bases>
  );
}
