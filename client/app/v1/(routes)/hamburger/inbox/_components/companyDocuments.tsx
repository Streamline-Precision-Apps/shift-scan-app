"use client";
import Spinner from "@/components/(animations)/spinner";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { NModals } from "@/components/(reusable)/newmodals";
import { Selects } from "@/components/(reusable)/selects";
import { Titles } from "@/components/(reusable)/titles";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Images } from "@/components/(reusable)/images";
import EqScannerModal from "./eqScannerModal";
import { Texts } from "@/components/(reusable)/texts";
import { useTranslations } from "next-intl";

type documentType = {
  id: string;
  qrId: string;
  fileName: string;
  description?: string;
  isActive: boolean;
  DocumentTags: {
    tagName: string;
  }[];
};

type tagType = {
  id: string;
  tagName: string;
};

export type equipmentType = {
  id: string;
  qrId: string;
  name: string;
  DocumentTags?: {
    tagName: string;
  }[];
};

export default function CompanyDocuments() {
  const t = useTranslations("Hamburger-Inbox");
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [documents, setDocuments] = useState<documentType[]>([]);
  const [tags, setTags] = useState<tagType[]>([]);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [scanned, setScanned] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<equipmentType[]>([]);
  const [equipmentTags, setEquipmentTags] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<documentType | null>(
    null
  );

  const handleDownload = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(
        `/api/getDocumentById/${selectedDocument.id}`,
        {
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Received empty PDF file");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedDocument.fileName || "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to download document"
      );
    }
  };

  const handleDocumentClick = (document: documentType) => {
    if (selectedDocument?.id === document.id) {
      setSelectedDocument(null);
    } else {
      setSelectedDocument(document);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docsResponse, tagsResponse, equipmentResponse] =
          await Promise.all([
            fetch("/api/getDocuments"),
            fetch("/api/getDocumentTags"),
            fetch("/api/getEqForDocs"),
          ]);

        const docsData = await docsResponse.json();
        const tagsData = await tagsResponse.json();
        const equipmentData = await equipmentResponse.json();

        setDocuments(docsData);
        setTags(tagsData);
        setEquipment(equipmentData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (scanned && equipment.length > 0) {
      const matchedEquipment = equipment.find((eq) => eq.qrId === scanned);
      if (matchedEquipment) {
        const tags =
          matchedEquipment.DocumentTags?.map((tag) =>
            tag.tagName.toLowerCase()
          ) || [];
        setEquipmentTags(tags);
        setSelectedFilter(matchedEquipment.name);
      }
    } else {
      setEquipmentTags([]);
    }
  }, [scanned, equipment]);

  const filteredDocuments =
    selectedFilter === "all"
      ? documents
      : equipmentTags.length > 0
      ? documents.filter((doc) =>
          doc.DocumentTags.some((docTag) =>
            equipmentTags.includes(docTag.tagName.toLowerCase())
          )
        )
      : documents.filter((doc) =>
          doc.DocumentTags.some(
            (tag) => tag.tagName.toLowerCase() === selectedFilter.toLowerCase()
          )
        );

  return (
    <Contents width={"section"}>
      <Grids rows={"9"} gap={"5"} className="h-full w-full pt-3 pb-5">
        <Holds
          position={"row"}
          className="row-start-1 row-end-2 h-full gap-x-3"
        >
          <Holds className="w-12 h-full">
            <Buttons
              shadow={"none"}
              background={"green"}
              onClick={() => setModalOpen(true)}
              className="w-12 h-full"
            >
              <Holds className="p-2">
                <Images
                  titleImg={"/qrCode.svg"}
                  titleImgAlt={"QR"}
                  className="w-6 h-6 items-center"
                />
              </Holds>
            </Buttons>
          </Holds>
          {loading ? (
            <Selects
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-center justify-center h-full"
              disabled
            >
              <option value="all">{t("LoadingTags")}</option>
            </Selects>
          ) : (
            <Selects
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setScanned(null);
              }}
              className="text-center h-full w-full "
            >
              <option value="all">{t("AllDocuments")}</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.tagName.toLowerCase()}>
                  {tag.tagName}
                </option>
              ))}
              {scanned && equipment.find((eq) => eq.qrId === scanned) && (
                <option
                  value={equipment.find((eq) => eq.qrId === scanned)!.name}
                  selected
                >
                  {equipment.find((eq) => eq.qrId === scanned)!.name}
                </option>
              )}
            </Selects>
          )}
        </Holds>
        {loading ? (
          <Holds className="row-start-2 row-end-10 h-full w-full flex justify-center items-center">
            <Spinner size={50} />
          </Holds>
        ) : (
          <Holds className="row-start-2 row-end-10 h-full w-full flex justify-center items-center">
            {filteredDocuments.length === 0 ? (
              <Holds className="row-start-2 row-end-10 h-full w-full ">
                <Holds className="w-full h-full flex ">
                  <Texts size={"p5"} className="italic text-gray-500">
                    {selectedFilter === "all"
                      ? t("NoDocumentsFound")
                      : equipmentTags.length > 0
                      ? `${t("NoDocumentsFoundForEquipment")} ${selectedFilter}`
                      : `${t("NoDocumentsFoundFor")} ${selectedFilter}`}
                  </Texts>
                  <Holds className="w-3/4 flex justify-center items-center ">
                    <Texts size={"p7"} text={"gray"}>
                      {t("TryScanningAnotherEquipmentOrChangingTheFilter")}
                    </Texts>
                  </Holds>
                </Holds>
              </Holds>
            ) : (
              <Holds className="row-start-2 row-end-10 h-full w-full flex justify-center items-center">
                <Grids rows={"8"} gap={"5"} className="h-full w-full">
                  <Holds className="row-start-1 row-end-8 h-full w-full overflow-y-scroll no-scrollbar">
                    <Holds background={"darkBlue"} className="w-full h-full">
                      <Contents>
                        <Holds className="w-full space-y-3 overflow-y-auto no-scrollbar">
                          {filteredDocuments.map((document) => (
                            <Buttons
                              key={document.id}
                              shadow={"none"}
                              className={`py-3 relative w-full`}
                              background={
                                selectedDocument?.id === document.id
                                  ? "green"
                                  : "white"
                              }
                              onClick={() => handleDocumentClick(document)}
                            >
                              <Holds className="flex flex-col w-full px-2 py-">
                                <Holds
                                  position={"row"}
                                  className="flex justify-between items-center w-full"
                                >
                                  <Titles size={"h5"} text={"black"}>
                                    {document.fileName}
                                  </Titles>
                                  {document.DocumentTags.length > 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-sm">
                                      {document.DocumentTags[0].tagName}
                                    </span>
                                  )}
                                </Holds>
                                {selectedDocument?.id === document.id &&
                                  document.description && (
                                    <Holds className="text-left text-sm mt-2 text-black">
                                      {document.description}
                                    </Holds>
                                  )}
                              </Holds>
                            </Buttons>
                          ))}
                        </Holds>
                      </Contents>
                    </Holds>
                  </Holds>
                  <Holds className="row-start-8 row-end-9 h-full w-full  ">
                    <Grids cols={"2"} gap={"4"} className="w-full h-full">
                      <Holds className="col-start-1 col-end-2  ">
                        <Buttons
                          background={selectedDocument ? "orange" : "darkGray"}
                          onClick={handleDownload}
                          className="w-full py-3 "
                          disabled={!selectedDocument}
                        >
                          <Titles size={"h5"}>{t("Download")}</Titles>
                        </Buttons>
                      </Holds>
                      <Holds className="col-start-2 col-end-3  ">
                        <Buttons
                          background={selectedDocument ? "orange" : "darkGray"}
                          onClick={() => {}}
                          className="w-full py-3"
                          disabled={!selectedDocument}
                        >
                          <Titles size={"h5"}>{t("View")}</Titles>
                        </Buttons>
                      </Holds>
                    </Grids>
                  </Holds>
                </Grids>
              </Holds>
            )}
          </Holds>
        )}

        <NModals
          size="screen"
          background="takeABreak"
          isOpen={modalOpen}
          handleClose={() => {
            setModalOpen(false);
          }}
        >
          <EqScannerModal
            setModalOpen={setModalOpen}
            scanned={scanned}
            setScanned={setScanned}
            equipment={equipment}
          />
        </NModals>
      </Grids>
    </Contents>
  );
}
