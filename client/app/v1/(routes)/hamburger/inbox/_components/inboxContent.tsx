"use client";
import React, { Suspense, useState } from "react";
import { Holds } from "@/components/(reusable)/holds";
import { Titles } from "@/components/(reusable)/titles";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { NewTab } from "@/components/(reusable)/newTabs";
import DynamicInboxContent from "./dynamicInboxContent";

export default function InboxContent({ isManager }: { isManager: boolean }) {
  const [activeTab, setActiveTab] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("returnUrl") || "/dashboard";
  const t = useTranslations("Hamburger-Inbox");

  return (
    <div className="h-full w-full rounded-lg bg-white">
      {/* Static content - header */}
      <TitleBoxes
        className="h-16 flex-shrink-0 rounded-lg sticky top-0 z-10 bg-white"
        position={"row"}
        onClick={() => router.push(url)}
      >
        <Holds
          position={"row"}
          className="w-full justify-center items-center gap-x-2 "
        >
          <Titles size={"md"}>{t("FormsDocuments")}</Titles>
        </Holds>
      </TitleBoxes>

      {/* Static content - tabs */}
      <div className="h-[50px] items-center flex flex-row gap-2 border-2 border-neutral-100 bg-neutral-100">
        <NewTab
          onClick={() => setActiveTab(1)}
          isActive={activeTab === 1}
          isComplete={true}
          titleImage={"/formInspect.svg"}
          titleImageAlt={""}
          animatePulse={false}
          className="border-gray-200 border-2"
        >
          <Titles size={"sm"}>{t("Forms")}</Titles>
        </NewTab>

        {isManager && (
          <NewTab
            onClick={() => setActiveTab(3)}
            isActive={activeTab === 3}
            isComplete={true}
            titleImage={"/formApproval.svg"}
            titleImageAlt={""}
            animatePulse={false}
          >
            <Titles size={"sm"}>{t("TeamSubmissions")}</Titles>
          </NewTab>
        )}
      </div>

      <DynamicInboxContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isManager={isManager}
      />
    </div>
  );
}
