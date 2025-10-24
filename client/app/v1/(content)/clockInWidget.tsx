"use client";
import "@/app/globals.css";
import { useTranslations } from "next-intl";
import { Buttons } from "@/components/(reusable)/buttons";
import { Texts } from "@/components/(reusable)/texts";
import { Images } from "@/components/(reusable)/images";
import { Holds } from "@/components/(reusable)/holds";

export default function ClockInWidget() {
  const t = useTranslations("Home");
  return (
    <>
      <Buttons background={"green"} href="/clock" className="col-span-2">
        <Holds position={"row"}>
          <Holds>
            <Texts size={"p1"}>{t("Clock-btn")}</Texts>
          </Holds>
          <Holds>
            <Images
              titleImg="/clockIn.svg"
              titleImgAlt="QR Code"
              size={"30"}
            />
          </Holds>
        </Holds>
      </Buttons>
    </>
  );
}
