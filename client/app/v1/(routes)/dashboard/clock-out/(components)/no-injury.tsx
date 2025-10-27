import Spinner from "@/components/(animations)/spinner";
import { CheckBox } from "@/components/(inputs)/checkBox";
import { Bases } from "@/components/(reusable)/bases";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";

export const PreInjuryReport = ({
  handleCheckboxChange,
  checked,
  loading,
  base64String,
  handleNextStepAndSubmit,
  prevStep,
}: {
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
  loading: boolean;
  base64String: string;
  prevStep: () => void;
  handleNextStepAndSubmit: () => void;
}) => {
  const t = useTranslations("ClockOut");
  return (
    <Bases>
      <Contents>
        <Holds
          background={"white"}
          className="h-full flex flex-col items-center "
        >
          <TitleBoxes onClick={prevStep} className="h-24">
            <Holds className="h-full justify-end items-end">
              <Holds position={"row"} className="justify-center gap-2">
                <Titles size={"md"}>{t("EndWorkDay")}</Titles>
                <Images
                  titleImg="/endDay.svg"
                  titleImgAlt="end work day"
                  className="max-w-6 h-auto"
                />
              </Holds>
            </Holds>
          </TitleBoxes>

          <div className="w-[90%] flex-grow flex flex-col py-5">
            <Texts size={"p5"}>{t("SignatureAcknowledgement")}</Texts>
            <Holds className="border-[3px] border-black rounded-[10px] h-32 my-5">
              {loading ? (
                <Holds className="my-auto">
                  <Spinner />
                </Holds>
              ) : (
                <Holds className="my-auto">
                  {base64String ? (
                    <Images
                      titleImg={base64String}
                      titleImgAlt={"Loading signature"}
                      className="w-[60%] mx-auto"
                    />
                  ) : (
                    <Holds className="my-auto">
                      <Texts size={"md"}>{t("NoSignature")}</Texts>
                    </Holds>
                  )}
                </Holds>
              )}
            </Holds>
            <Holds position={"row"}>
              <Holds className="w-fit pr-6">
                <CheckBox
                  id="injury-checkbox"
                  name="injury-verify"
                  onChange={handleCheckboxChange}
                  checked={checked}
                  size={2.5}
                />
              </Holds>
              <Holds className="w-full">
                <Texts size={"md"} position={"left"}>
                  {t("ThisIsMySignature")}
                </Texts>
              </Holds>
            </Holds>
          </div>

          <div className="w-[90%] flex justify-end  pb-4 h-[70px] ">
            <Buttons
              background={checked ? "orange" : "red"}
              onClick={handleNextStepAndSubmit}
              disabled={loading}
              className="h-[60px] w-full "
            >
              <Titles size={"md"}>
                {checked ? t("Continue") : t("ReportInjury")}
              </Titles>
            </Buttons>
          </div>
        </Holds>
      </Contents>
    </Bases>
  );
};
