import { Holds } from "@/components/(reusable)/holds";
import { Grids } from "@/components/(reusable)/grids";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import Spinner from "@/components/(animations)/spinner";
import { useTranslations } from "next-intl";

export default function LoadingScannerFallback() {
  const t = useTranslations("Equipment");
  return (
    <Holds className="h-full ">
      <Grids rows={"7"} gap={"5"}>
        <Holds className="h-full row-start-1 row-end-2">
          <TitleBoxes>
            <Holds className="h-full justify-end">
              <Titles size={"h2"}>{t("ScanEquipment")}</Titles>
            </Holds>
          </TitleBoxes>
        </Holds>

        <Holds className="size-full row-start-3 row-end-7 px-4">
          <Holds className="flex justify-center items-center h-full w-full">
            <Spinner size={40} />
          </Holds>
        </Holds>
      </Grids>
    </Holds>
  );
}
