import { Buttons } from "@/components/(reusable)/buttons";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";

type Props = {
  returnToMain: () => void;
};
/**
 * Displays a Controller panel to close the time tracking visualization and redirect to the timesheets page.
 */
export default function TopControlPanel({ returnToMain }: Props) {
  const t = useTranslations("Home");
  return (
    <>
      <Buttons
        background={"red"}
        onClick={returnToMain}
        shadow={"none"}
        className="w-[50px] h-[40px] justify-center items-center"
      >
        <Images
          titleImg={"/arrowLeftSymbol.svg"}
          titleImgAlt="return"
          className="mx-auto w-5 h-auto object-contain"
        />
      </Buttons>

      <Buttons
        shadow={"none"}
        href={"/timesheets"}
        background={"green"}
        className="w-full h-[40px] py-2"
      >
        <Titles size={"sm"}>{t("TimeSheet-Label")}</Titles>
      </Buttons>
    </>
  );
}
