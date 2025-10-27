"use client";
import "@/app/globals.css";
import { useState, ChangeEvent, Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { Titles } from "@/components/(reusable)/titles";
import { Buttons } from "@/components/(reusable)/buttons";
import { useSession } from "next-auth/react";
import { Grids } from "@/components/(reusable)/grids";
import { TextAreas } from "@/components/(reusable)/textareas";
import { CheckBox } from "@/components/(inputs)/checkBox";
import { Texts } from "@/components/(reusable)/texts";
import { Bases } from "@/components/(reusable)/bases";
import { Images } from "@/components/(reusable)/images";
import { Labels } from "@/components/(reusable)/labels";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";

type FormProps = {
  base64String: string | null;
  handleNextStep: () => void;
  setBase64String?: Dispatch<SetStateAction<string>>;
  handleComplete?: () => Promise<void>;
  handleSubmitImage?: () => Promise<void>;
  prevStep: () => void;
  setWasInjured: Dispatch<SetStateAction<boolean>>;
};

export const InjuryReportContent = ({
  base64String,
  handleNextStep,
  prevStep,
  setWasInjured,
}: FormProps) => {
  const [supervisorChecked, setSupervisorChecked] = useState<boolean>(false);
  const [completedForm, setCompletedForm] = useState<boolean>(false);
  const [signatureChecked, setSignatureChecked] = useState<boolean>(false);
  const [textarea, setTextarea] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const t = useTranslations("ClockOut");
  const { data: session } = useSession();
  if (!session) {
    return null;
  }
  const { id } = session.user;

  const handleSupervisorCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSupervisorChecked(event.currentTarget.checked);
  };

  const handleCompleteFormCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setCompletedForm(event.currentTarget.checked);
  };
  const handleSignatureCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSignatureChecked(event.currentTarget.checked);
  };

  const handleSubmit = async () => {
    if (!completedForm) {
      setError("Please complete the form.");
      return;
    }
    if (!signatureChecked) {
      setError("Please verify your signature.");
      return;
    }

    try {
      // reported someone was injured on timesheet
      setWasInjured(true);
      handleNextStep();
    } catch (error) {
      setError(t("FaildToSubmit"));
    }
  };

  return (
    <Bases>
      <Contents>
        <Holds
          background={"white"}
          className="h-full w-full flex flex-col items-center "
        >
          <TitleBoxes onClick={prevStep} className="h-24">
            <Holds className="h-full justify-end">
              <Holds position={"row"} className="w-full justify-center gap-2">
                <Titles size={"md"}>{t("InjuryVerification")}</Titles>
                <Images
                  titleImg="/injury.svg"
                  titleImgAlt="Verify"
                  size={"full"}
                  className="max-w-6 h-auto"
                />
              </Holds>
            </Holds>
          </TitleBoxes>

          {/* Describe What Happened */}

          <div className="w-[90%] flex-grow flex flex-col">
            <Holds position={"row"} className="w-full  my-5">
              <Holds className="w-fit pr-5">
                <CheckBox
                  checked={completedForm}
                  onChange={handleCompleteFormCheckboxChange}
                  id={"1"}
                  name={""}
                  size={2.25}
                />
              </Holds>
              <Holds size={"80"}>
                <Texts position={"left"} size="md">
                  {t("IFilledOutAnInjuryReport")}
                </Texts>
              </Holds>
            </Holds>
            <Holds position={"row"} className="w-full  mb-5">
              <Holds className="w-fit pr-5">
                <CheckBox
                  checked={supervisorChecked}
                  onChange={handleSupervisorCheckboxChange}
                  id={"1"}
                  name={""}
                  size={2.25}
                />
              </Holds>
              <Holds size={"80"}>
                <Texts position={"left"} size="md">
                  {t("ContactedSupervisor")}
                </Texts>
              </Holds>
            </Holds>
            <Holds className="h-32 mb-5 border-[3px] border-black rounded-[10px] ">
              {base64String ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={base64String}
                  alt="Loading signature"
                  className="w-[60%] m-auto"
                />
              ) : (
                <p>No Signature </p>
              )}
            </Holds>
            <Holds position={"row"} className="mb-4 gap-2">
              <Holds size={"20"}>
                <CheckBox
                  checked={signatureChecked}
                  onChange={handleSignatureCheckboxChange}
                  id={"2"}
                  name={""}
                  size={2.25}
                />
              </Holds>
              <Holds size={"80"}>
                <Texts position={"left"} size="md">
                  {t("SignatureVerify")}
                </Texts>
              </Holds>
            </Holds>
          </div>

          <div className="w-[90%] flex justify-end  pb-4 h-[70px] ">
            <Buttons
              background={
                completedForm && signatureChecked ? "orange" : "darkGray"
              }
              disabled={completedForm && signatureChecked ? false : true}
              onClick={handleSubmit}
              className="h-[60px] w-full"
            >
              <Titles size={"md"}>{t("Continue")}</Titles>
            </Buttons>
          </div>
        </Holds>
      </Contents>
    </Bases>
  );
};
