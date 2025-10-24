import { Banners } from "@/components/(reusable)/banners";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import capitalizeAll from "@/utils/capitalizeAll";
import Capitalize from "@/utils/captitalize";
import { useTranslations } from "next-intl";

export default function DisplayBanner({
  firstName,
  date,
}: {
  firstName: string;
  date: string;
}) {
  const t = useTranslations("Home");
  return (
    <Banners>
      <Titles text={"white"} size={"h2"}>
        {t("Banner")}
        {t("Name", {
          firstName: Capitalize(firstName),
        })}
        !
      </Titles>
      <Texts text={"white"} size={"p5"}>
        {t("Date", { date: capitalizeAll(date) })}
      </Texts>
    </Banners>
  );
}
