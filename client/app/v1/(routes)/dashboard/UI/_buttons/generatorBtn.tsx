"use client";

import WidgetContainer from "@/app/v1/(content)/widgetContainer";
import { useTranslations } from "next-intl";

export default function GeneratorBtn() {
  const t = useTranslations("Widgets");
  return (
    <WidgetContainer
      titleImg="/qrCode.svg"
      titleImgAlt="QR Code"
      text={"QR"}
      textSize={"h6"}
      background={"lightBlue"}
      translation={"Widgets"}
      href="/v1/dashboard/qr-generator?rPath=/v1/dashboard"
    />
  );
}
