"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
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
          handleEvent={() => router.push("/dashboard/truckingAssistant")}
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
          handleEvent={() => router.push("/dashboard/truckingAssistant")}
        />
      )}
    </>
  );
}
