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

type QrEquipmentContentProps = {
  generatedList: Option[];
  refresh: () => Promise<void>;
  loading: boolean;
};

export default function QrEquipmentContent({
  generatedList,
  refresh,
  loading,
}: QrEquipmentContentProps) {
  const router = useRouter();
  const [selectedEquipment, setSelectedEquipment] = useState<Option | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const t = useTranslations("Generator");

  const handleGenerate = async () => {
    if (selectedEquipment) {
      try {
        const url = await QRCode.toDataURL(selectedEquipment.code);
        setQrCodeUrl(url);
        setIsModalOpen(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("No equipment selected");
    }
  };

  const handleNew = () => {
    router.push("/dashboard/qr-generator/add-equipment");
  };

  const handleSearchSelectChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      setSelectedEquipment({
        id: selectedOption.id,
        label: selectedOption.label,
        code: selectedOption.code,
        status: selectedOption.status,
      });
    } else {
      setSelectedEquipment(null);
      return;
    }
  };

  return (
    <Grids rows={"7"} cols={"3"} gap={"5"} className="h-full w-full">
      <Holds className="row-start-1 row-end-7 col-span-3 h-full">
        <NewCodeFinder
          isLoading={loading}
          onRefresh={refresh}
          options={generatedList}
          selectedOption={selectedEquipment}
          onSelect={handleSearchSelectChange}
          placeholder={t("TypeHere")}
          label="Select Equipment"
          showStatusTags={true}
        />
      </Holds>

      <Holds className="row-start-7 row-end-8 col-start-1 col-end-2 h-full">
        <Buttons
          background={selectedEquipment ? "lightBlue" : "darkGray"}
          disabled={!selectedEquipment}
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
          <Titles size={"sm"}>{t("CreateNewEquipment")}</Titles>
        </Buttons>
      </Holds>

      <NModals
        isOpen={isModalOpen}
        background={"white"}
        handleClose={() => setIsModalOpen(false)}
        size={"xlWS"}
      >
        {selectedEquipment && (
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
