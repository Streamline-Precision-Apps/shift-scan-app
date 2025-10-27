"use server";
import { getTranslations } from "next-intl/server";
import "@/app/globals.css";
import ClockOutButtons from "@/app/(routes)/dashboard/clock-out/(components)/injury-verification/clockOutButtons";
import { Bases } from "@/components/(reusable)/bases";
import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Contents } from "@/components/(reusable)/contents";
import { Texts } from "@/components/(reusable)/texts";
import { Images } from "@/components/(reusable)/images";

export default async function ClockOutDashboardContent() {
  const t = await getTranslations("Clock-out");

  return (
    <Bases>
      <Holds>
        <Contents width={"section"}>
          <TitleBoxes onClick={() => {}}>
            <Holds>
              <Texts>{t("Title")}</Texts>{" "}
              <Images
                titleImg="/profileEmpty.svg"
                titleImgAlt="Team"
                className="w-8 h-8"
              />
            </Holds>
          </TitleBoxes>
        </Contents>
      </Holds>
      <ClockOutButtons />
    </Bases>
  );
}
