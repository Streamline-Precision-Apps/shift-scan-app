"use client";
import { useTranslations } from "next-intl";
import "@/app/globals.css";
import { useState } from "react";
import { Holds } from "@/components/(reusable)/holds";
import { Grids } from "@/components/(reusable)/grids";
import { Contents } from "@/components/(reusable)/contents";
import QrJobsiteContent from "./qrJobsiteContent";
import QrEquipmentContent from "./qrEquipmentContent";
import { NewTab } from "@/components/(reusable)/newTabs";
import { Titles } from "@/components/(reusable)/titles";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Images } from "@/components/(reusable)/images";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { z } from "zod";
import Spinner from "@/components/(animations)/spinner";
import { Buttons } from "@/components/(reusable)/buttons";

const JobCodesSchema = z.object({
  id: z.string(),
  qrId: z.string(),
  name: z.string(),
  status: z.string(),
});

type Option = {
  id: string;
  label: string;
  code: string;
  status?: string;
};

// Zod schema for EquipmentCodes
const EquipmentCodesSchema = z.object({
  id: z.string(),
  qrId: z.string(),
  name: z.string(),
  code: z.string().nullable().optional(),
  status: z.string(),
});

// Zod schema for equipment list response
const EquipmentListSchema = z.array(EquipmentCodesSchema);

// Zod schema for the jobsite list response
const JobsiteListSchema = z.array(JobCodesSchema);

type JobCodes = z.infer<typeof JobCodesSchema>;

type EquipmentCodes = z.infer<typeof EquipmentCodesSchema>;

export default function QRGeneratorContent() {
  const [activeTab, setActiveTab] = useState(1);
  const t = useTranslations("Generator");
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("returnUrl") || "/dashboard";
  const [loading, setLoading] = useState(true);
  const [loadingJobsite, setLoadingJobsite] = useState<boolean>(false);
  const [loadingEquipment, setLoadingEquipment] = useState<boolean>(false);
  const [generatedJobsiteList, setGeneratedJobsiteList] = useState<Option[]>(
    [],
  );
  const [generatedEquipmentList, setGeneratedEquipmentList] = useState<
    Option[]
  >([]);
  const [jobsiteRefreshKey, setJobsiteRefreshKey] = useState<number>(0);
  const [equipmentRefreshKey, setEquipmentRefreshKey] = useState<number>(0);

  const refreshEquipment = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEquipmentRefreshKey((k) => k + 1);
  };
  const refreshJobsites = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setJobsiteRefreshKey((k) => k + 1);
  };

  const fetchEquipment = async () => {
    try {
      const equipmentRes = await fetch("/api/getEquipment");
      if (equipmentRes.ok) {
        const equipmentData = await equipmentRes.json();
        try {
          EquipmentListSchema.parse(equipmentData);
          const sortedEquipment = [...equipmentData].sort((a, b) => {
            const aIsPending = !a.code;
            const bIsPending = !b.code;
            if (aIsPending && !bIsPending) return -1;
            if (!aIsPending && bIsPending) return 1;
            return 0;
          });
          setGeneratedEquipmentList(
            sortedEquipment.map((item: EquipmentCodes) => ({
              id: item.id,
              label: `${item.code ? item.code.toUpperCase() : "Pending"} - ${item.name.toUpperCase()}`,
              code: item.qrId.toUpperCase(),
              status: item.status,
            })),
          );
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error("Validation error in equipment data:", error);
            setGeneratedEquipmentList([]);
          }
        }
      } else {
        console.error("Failed to fetch equipment data");
        setGeneratedEquipmentList([]);
      }
    } catch (equipError) {
      console.error("Error fetching equipment data:", equipError);
      setGeneratedEquipmentList([]);
    } finally {
      setLoadingEquipment(false);
    }
  };
  const fetchJobsites = async () => {
    try {
      const jobsiteRes = await fetch("/api/getJobsites");
      if (jobsiteRes.ok) {
        const jobsiteData = await jobsiteRes.json();
        try {
          JobsiteListSchema.parse(jobsiteData);
          setGeneratedJobsiteList(
            jobsiteData.map((item: JobCodes) => ({
              id: item.id,
              label: item.name.toUpperCase(),
              code: item.qrId.toUpperCase(),
              status: item.status,
            })),
          );
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error("Validation error in jobsite data:", error);
            setGeneratedJobsiteList([]);
          }
        }
      } else {
        console.error("Failed to fetch jobsite data");
        setGeneratedJobsiteList([]);
      }
    } catch (jobError) {
      console.error("Error fetching jobsite data:", jobError);
      setGeneratedJobsiteList([]);
    } finally {
      setLoadingJobsite(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setLoadingEquipment(true);
    setLoadingJobsite(true);

    Promise.all([fetchEquipment(), fetchJobsites()]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (equipmentRefreshKey === 0) return;
    setLoadingEquipment(true);
    fetchEquipment();
  }, [equipmentRefreshKey]);

  useEffect(() => {
    if (jobsiteRefreshKey === 0) return;
    setLoadingJobsite(true);
    fetchJobsites();
  }, [jobsiteRefreshKey]);

  return (
    <>
      <Holds
        background={"white"}
        className={`row-start-1 row-end-2 h-full ${
          loading ? "animate-pulse" : ""
        }`}
      >
        <TitleBoxes position={"row"} onClick={() => router.push(url)}>
          <Titles size={"xl"}>{t("QrGenerator")}</Titles>
        </TitleBoxes>
      </Holds>
      <Holds className="row-start-2 row-end-8 h-full">
        <Grids rows={"10"}>
          <Holds position={"row"} className="gap-x-1 h-fu">
            <NewTab
              onClick={() => setActiveTab(1)}
              isActive={activeTab === 1}
              isComplete={true}
              titleImage="/jobsite.svg "
              titleImageAlt=""
              animatePulse={loading}
            >
              <Titles size={"lg"} className="w-full">
                {t("Jobsite")}
              </Titles>
            </NewTab>
            <NewTab
              onClick={() => setActiveTab(2)}
              isActive={activeTab === 2}
              isComplete={true}
              titleImage="/equipment.svg "
              titleImageAlt=""
              animatePulse={loading}
            >
              <Titles size={"lg"}>{t("EquipmentTitle")}</Titles>
            </NewTab>
          </Holds>
          <Holds
            background={"white"}
            className={`rounded-t-none row-span-9 h-full ${
              loading ? "animate-pulse" : ""
            }`}
          >
            {loading ? (
              <Contents width={"section"} className="py-5">
                <Grids rows={"7"} cols={"3"} gap={"5"}>
                  <Holds
                    background={"darkBlue"}
                    className="w-full h-full row-start-1 row-end-7 col-span-3 justify-center items-center "
                  >
                    <Spinner color={"border-app-white"} />
                  </Holds>
                  <Holds className="row-start-7 row-end-8 col-start-1 col-end-2 h-full">
                    <Buttons
                      background={"darkGray"}
                      disabled={true}
                      className="w-full h-full justify-center items-center"
                    >
                      <Images
                        src="/qrCode.svg"
                        alt="Team"
                        className="w-8 h-8 mx-auto"
                        titleImg={""}
                        titleImgAlt={""}
                      />
                    </Buttons>
                  </Holds>
                  <Holds
                    size={"full"}
                    className="row-start-7 row-end-8 col-start-2 col-end-4 h-full"
                  >
                    <Buttons background={"green"} disabled={true} />
                  </Holds>
                </Grids>
              </Contents>
            ) : (
              <Contents width={"section"} className="py-5">
                {activeTab === 1 && (
                  <QrJobsiteContent
                    generatedList={generatedJobsiteList}
                    refresh={refreshJobsites}
                    loading={loadingJobsite}
                  />
                )}
                {activeTab === 2 && (
                  <QrEquipmentContent
                    generatedList={generatedEquipmentList}
                    refresh={refreshEquipment}
                    loading={loadingEquipment}
                  />
                )}
              </Contents>
            )}
          </Holds>
        </Grids>
      </Holds>
    </>
  );
}
