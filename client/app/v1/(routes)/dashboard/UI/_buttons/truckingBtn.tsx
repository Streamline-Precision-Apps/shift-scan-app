"use client";

import { useTranslations } from "next-intl";
import HorizontalLayout from "./horizontalLayout";
import VerticalLayout from "./verticalLayout";
import { useRouter } from "next/navigation";

export default function TruckingBtn({
  view,
  permission,
  laborType,
}: {
  view: string;
  permission: string;
  laborType: string;
}) {
  const t = useTranslations("Widgets");
  const router = useRouter();
  return (
    <>
      {permission === "USER" && (
        <HorizontalLayout
          text={
            laborType === "truckDriver"
              ? "TruckDriver"
              : laborType === "manualLabor"
              ? "ManualLabor"
              : laborType === "operator"
              ? "Operator"
              : "TruckingAssistant"
          }
          textSize={"h6"}
          titleImg={"/trucking.svg"}
          titleImgAlt={"Trucking Icon"}
          color={"green"}
          handleEvent={() => router.push("/v1/dashboard/truckingAssistant")}
        />
      )}
      {permission !== "USER" && (
        <VerticalLayout
          text={
            laborType === "truckDriver"
              ? "TruckDriver"
              : laborType === "manualLabor"
              ? "ManualLabor"
              : laborType === "operator"
              ? "Operator"
              : "TruckingAssistant"
          }
          textSize={"h6"}
          titleImg={"/trucking.svg"}
          titleImgAlt={"Trucking Icon"}
          color={"green"}
          handleEvent={() => router.push("/v1/dashboard/truckingAssistant")}
        />
      )}
    </>
  );
}
