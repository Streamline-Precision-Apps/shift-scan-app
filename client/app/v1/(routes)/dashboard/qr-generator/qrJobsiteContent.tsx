"use client";

import { Buttons } from "@/components/(reusable)/buttons";
import React, { useState } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Images } from "@/components/(reusable)/images";
import { Holds } from "@/components/(reusable)/holds";
import { Grids } from "@/components/(reusable)/grids";
import { NModals } from "@/components/(reusable)/newmodals";
import { Titles } from "@/components/(reusable)/titles";
import NewCodeFinder from "@/components/(search)/newCodeFinder";

type Option = {
  id: string;
  label: string;
  code: string;
  status?: string;
};

type QrJobsiteProps = {
  generatedList: Option[];
  refresh: () => Promise<void>;
  loading: boolean;
};

export default function QrJobsiteContent({
  generatedList,
  refresh,
  loading,
}: QrJobsiteProps) {
  const [selectedJobSite, setSelectedJobSite] = useState<Option | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const router = useRouter();
  const t = useTranslations("Generator");

  const handleGenerate = async () => {
    if (selectedJobSite) {
      try {
        const url = await QRCode.toDataURL(selectedJobSite.code);
        setQrCodeUrl(url);
        setIsModalOpen(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("No job site selected");
    }
  };

  const handleNew = () => {
    router.push("/dashboard/qr-generator/add-jobsite");
  };

  const handleSearchSelectChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      setSelectedJobSite({
        id: selectedOption.id,
        label: selectedOption.label,
        code: selectedOption.code,
        status: selectedOption.status,
      });
    } else {
      setSelectedJobSite(null);
      return;
    }
  };

  return (
    <Grids rows={"7"} gap={"5"} cols={"3"}>
      <Holds className="row-start-1 row-end-7 col-span-3 h-full">
        <NewCodeFinder
          isLoading={loading}
          onRefresh={refresh}
          options={generatedList}
          selectedOption={selectedJobSite}
          onSelect={handleSearchSelectChange}
          placeholder={t("TypeHere")}
          label="Select Job Site"
          showStatusTags={true}
        />
      </Holds>
      <Holds className="row-start-7 row-end-8 col-start-1 col-end-2 h-full">
        <Buttons
          background={!selectedJobSite ? "darkGray" : "lightBlue"}
          disabled={!selectedJobSite}
          onClick={handleGenerate}
          className="w-full h-full justify-center items-center"
        >
          <Images
            src="/qrCode.svg"
            alt="Team"
            className="w-6 h-6 mx-auto"
            titleImg={""}
            titleImgAlt={""}
          />
        </Buttons>
      </Holds>
      <Holds
        size={"full"}
        className="row-start-7 row-end-8 col-start-2 col-end-4 h-full"
      >
        <Buttons background={"green"} onClick={handleNew}>
          <Titles size={"sm"}>{t("CreateNewJobsite")}</Titles>
        </Buttons>
      </Holds>

      <NModals
        background={"white"}
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        size={"xlWS"}
      >
        {selectedJobSite && (
          <>
            <Holds className="fixed rounded-[10px] p-2 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col max-w-[75%] max-h-[75%] w-full h-auto">
              <Images
                titleImg={qrCodeUrl}
                titleImgAlt="QR Code"
                className="h-full w-full object-contain"
              />
            </Holds>
          </>
        )}
      </NModals>
    </Grids>
  );
}
