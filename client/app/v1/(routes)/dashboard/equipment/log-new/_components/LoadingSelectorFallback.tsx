import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import Spinner from "@/app/v1/components/(animations)/spinner";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { useTranslations } from "next-intl";

export default function LoadingSelectorFallback() {
  const t = useTranslations("Equipment");
  return (
    <Holds className="h-full pb-5 ">
      <Grids rows={"7"} gap={"5"}>
        <Holds className="row-start-1 row-end-2 h-full w-full ">
          <TitleBoxes>
            <Holds className="flex items-center justify-end w-full h-full">
              <Titles size={"h2"}>{t("SelectEquipment")}</Titles>
            </Holds>
          </TitleBoxes>
        </Holds>

        <Holds className="h-full row-start-2 row-end-8">
          <Contents width={"section"} className="h-full">
            <Grids rows={"7"} gap={"5"}>
              <Holds className="h-full w-full row-start-1 row-end-7 pt-5 ">
                <Grids rows={"8"} className={`h-full w-full `}>
                  <Holds
                    background={"white"}
                    className="row-span-1 h-full border-[3px] border-black rounded-[10px] rounded-b-none overflow-hidden"
                  ></Holds>
                  <Holds
                    background={"darkBlue"}
                    className="row-start-2 row-end-9 h-full border-[3px] border-black rounded-[10px] rounded-t-none overflow-hidden pt-5"
                  >
                    <Spinner size={20} color="white" />
                  </Holds>
                </Grids>
              </Holds>
              <Holds className="w-full row-start-7 row-end-8 ">
                <Buttons background="orange" className="py-3" type="submit">
                  <Titles size={"h4"}>{t("SubmitSelection")}</Titles>
                </Buttons>
              </Holds>
            </Grids>
          </Contents>
        </Holds>
      </Grids>
    </Holds>
  );
}
