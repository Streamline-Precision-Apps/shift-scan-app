import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import Spinner from "@/app/v1/components/(animations)/spinner";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Images } from "@/app/v1/components/(reusable)/images";
import { NewTab } from "@/app/v1/components/(reusable)/newTabs";
import { useTranslations } from "next-intl";

export default function LoadingQRGeneratorContent() {
  const t = useTranslations("Generator");
  return (
    <>
      <Holds background="white" className="row-start-1 row-end-2 h-full ">
        <TitleBoxes position="row">
          <Titles size={"xl"}>{t("QrGenerator")}</Titles>
        </TitleBoxes>
      </Holds>
      <Holds className="row-start-2 row-end-8 h-full">
        <Grids rows="10">
          <Holds position="row" className="gap-x-1 h-full">
            <Holds position={"row"} className="gap-x-1 h-full">
              <NewTab
                onClick={() => {}}
                isActive={true}
                isComplete={true}
                titleImage="/jobsite.svg "
                titleImageAlt=""
                animatePulse={false}
              >
                <Titles size={"lg"} className="w-full">
                  {t("Jobsite")}
                </Titles>
              </NewTab>
              <NewTab
                onClick={() => {}}
                isActive={false}
                isComplete={true}
                titleImage="/equipment.svg "
                titleImageAlt=""
                animatePulse={false}
              >
                <Titles size={"lg"}>{t("EquipmentTitle")}</Titles>
              </NewTab>
            </Holds>
          </Holds>
          <Holds
            background="white"
            className="rounded-t-none row-span-9 h-full "
          >
            <Contents width="section" className="py-5">
              <Grids rows="7" cols="3" gap="5">
                <Holds
                  background="darkBlue"
                  className="w-full h-full row-start-1 row-end-7 col-span-3 justify-center items-center"
                >
                  <Spinner size={50} color={"border-white"} />
                </Holds>
                <Holds className="row-start-7 row-end-8 col-start-1 col-end-2 h-full">
                  <Buttons
                    background="darkGray"
                    disabled
                    className="w-full h-full justify-center items-center"
                  >
                    <Images
                      src="/qrCode.svg"
                      alt="Team"
                      className="w-6 h-6 mx-auto"
                      titleImg=""
                      titleImgAlt=""
                    />
                  </Buttons>
                </Holds>
                <Holds
                  size="full"
                  className="row-start-7 row-end-8 col-start-2 col-end-4 h-full"
                >
                  <Buttons background="green" disabled>
                    <Titles size={"sm"}>{t("CreateNewJobsite")}</Titles>
                  </Buttons>
                </Holds>
              </Grids>
            </Contents>
          </Holds>
        </Grids>
      </Holds>
    </>
  );
}
