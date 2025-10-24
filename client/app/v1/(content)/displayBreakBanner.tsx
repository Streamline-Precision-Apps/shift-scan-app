import { Banners } from "@/components/(reusable)/banners";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";

export default function DisplayBreakBanner() {
  const t = useTranslations("Home");
  return (
    <Banners>
      <Titles text={"white"} size={"h2"}>
        {t("EnjoyYourBreak")}
      </Titles>
      <Texts text={"white"} size={"p3"}>
        {t("HitReturnToClockBackIn")}
      </Texts>
    </Banners>
  );
}
