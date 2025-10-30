"use client";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { NewTab } from "@/app/v1/components/(reusable)/newTabs";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { useEmployeeData } from "./_components/_hooks/useEmployeeData";

import { useTranslations } from "next-intl";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import EmployeeInfo from "./_components/employeeInfo";
import EmployeeTimeCards from "./_components/EmployeeTimeCards";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";

export default function TeamMemberLayout() {
  const t = useTranslations("MyTeam");
  const router = useRouter();
  const { employeeId } = useParams();
  const { id } = useParams();
  const urls = useSearchParams();
  const rPath = urls.get("rPath");
  const timeCard = urls.get("timeCard");

  const [activeTab, setActiveTab] = useState(1);

  const {
    employee,
    contacts,
    loading: loadingEmployee,
  } = useEmployeeData(employeeId as string | undefined);

  const loading = loadingEmployee;

  return (
    <Bases>
      <Contents>
        <Holds className="h-full w-full">
          <Grids rows={"7"} gap={"5"} className="h-full w-full">
            <Holds
              background={"white"}
              className="row-start-1 row-end-2 h-full w-full"
            >
              <TitleBoxes
                onClick={() =>
                  router.push(
                    timeCard
                      ? timeCard
                      : `/v1/dashboard/myTeam/${id}?rPath=${rPath}`
                  )
                }
              >
                <Titles size={"lg"}>
                  {loading
                    ? t("Loading")
                    : `${employee?.firstName} ${employee?.lastName}`}
                </Titles>
              </TitleBoxes>
            </Holds>

            <Holds
              className={`w-full h-full row-start-2 row-end-8 ${
                loading ? "animate-pulse" : ""
              }`}
            >
              <Grids rows={"12"} className="h-full w-full">
                <Holds
                  position={"row"}
                  className={"row-start-1 row-end-2 h-full gap-1"}
                >
                  <NewTab
                    onClick={() => setActiveTab(1)}
                    isActive={activeTab === 1}
                    isComplete={true}
                    titleImage="/information.svg"
                    titleImageAlt={""}
                    titleImageSize={"6"}
                  >
                    <Titles size={"lg"}>{t("ContactInfo")}</Titles>
                  </NewTab>
                  <NewTab
                    onClick={() => setActiveTab(2)}
                    isActive={activeTab === 2}
                    isComplete={true}
                    titleImage="/form.svg"
                    titleImageAlt={""}
                    titleImageSize={"8"}
                  >
                    <Titles size={"lg"}> {t("TimeCards")}</Titles>
                  </NewTab>
                </Holds>
                <Holds className="h-full w-full row-start-2 row-end-13 overflow-y-auto no-scrollbar bg-white rounded-b-xl">
                  {activeTab === 1 && (
                    <EmployeeInfo
                      employee={employee}
                      contacts={contacts}
                      loading={loading}
                    />
                  )}
                  {activeTab === 2 && <EmployeeTimeCards />}
                </Holds>
              </Grids>
            </Holds>
          </Grids>
        </Holds>
      </Contents>
    </Bases>
  );
}
