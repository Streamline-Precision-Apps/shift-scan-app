"use client";

import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Images } from "@/components/(reusable)/images";
import { Titles } from "@/components/(reusable)/titles";
import TruckDriver from "../TruckingDriver";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import TruckDriverSkeleton from "./TruckDriverSkeleton";

export default function TruckingContexts({
  laborType,
}: {
  laborType: string | undefined;
}) {
  const t = useTranslations("Widgets");
  const router = useRouter();

  return (
    <>
      <Holds background={"white"} className="row-start-1 row-end-2 h-full ">
        <TitleBoxes onClick={() => router.push("/dashboard")}>
          <Holds
            position={"row"}
            className=" w-full justify-center items-center space-x-2"
          >
            <Titles size={"lg"} className="">
              {laborType === "truckDriver"
                ? t("TruckDriver")
                : laborType === "operator"
                  ? t("Operator")
                  : laborType === "manualLabor"
                    ? t("ManualLabor")
                    : t("TruckingAssistant")}
            </Titles>
            <Images
              className="max-w-8 h-auto object-contain"
              titleImg={"/trucking.svg"}
              titleImgAlt={"Truck"}
            />
          </Holds>
        </TitleBoxes>
      </Holds>
      <Holds className="row-start-2 row-end-8 h-full">
        <Suspense fallback={<TruckDriverSkeleton />}>
          <TruckDriver />
        </Suspense>
      </Holds>
    </>
  );
}
