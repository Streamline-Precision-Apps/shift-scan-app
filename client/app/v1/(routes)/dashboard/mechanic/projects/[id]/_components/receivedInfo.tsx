import Spinner from "@/components/(animations)/spinner";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Labels } from "@/components/(reusable)/labels";
import { Selects } from "@/components/(reusable)/selects";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function ReceivedInfoTab({
  loading,
  problemReceived,
  additionalNotes,
  myComment,
  hasBeenDelayed,
  onLeaveProject,
}: {
  loading: boolean;
  problemReceived: string;
  additionalNotes: string;
  myComment: string;
  hasBeenDelayed: boolean;
  onLeaveProject: () => void;
}) {
  const t = useTranslations("MechanicWidget");
  const [delayReasoning, setDelayReasoning] = useState<string>("");
  const [expectedArrival, setExpectedArrival] = useState("");

  const validateLeaveRequirements = () => {
    const hasValidComment = myComment.length > 3;
    const hasNoDelay = delayReasoning === "";
    const hasValidDelayInfo =
      delayReasoning === "Delay" &&
      expectedArrival &&
      expectedArrival.length > 0;

    return hasValidComment && (hasNoDelay || hasValidDelayInfo);
  };

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const isValid = validateLeaveRequirements();
    setIsButtonDisabled(!isValid);
  }, [myComment, delayReasoning, expectedArrival]);

  const renderValidationMessages = () => {
    const messages = [];

    if (myComment.length < 3) {
      messages.push(t("RecordToLeaveProject"));
    }

    if (delayReasoning === "Delay" && !expectedArrival) {
      messages.push(t("ExpectedArrivalRequired"));
    }

    return messages.length > 0 ? (
      <Holds className="space-y-1 pt-2">
        {messages.map((message, index) => (
          <Texts key={index} position="left" size="p7" className="text-red-500">
            * {message} *
          </Texts>
        ))}
      </Holds>
    ) : null;
  };

  if (loading)
    return (
      <Holds
        background={"white"}
        className="h-full py-2 justify-center items-center rounded-t-none"
      >
        <Spinner />
      </Holds>
    );

  return (
    <Holds
      background="white"
      className="h-full rounded-t-none pt-3 pb-5 overflow-y-auto"
    >
      <Contents width="section">
        <Grids rows="7" gap="5" className="h-full">
          <Holds className="row-start-1 row-end-7 h-full flex flex-col space-y-4 pb-3 overflow-y-auto no-scrollbar">
            {/* Problem Received */}
            <Holds>
              <Labels size="p5" htmlFor="problemReceived">
                {t("ProblemReceived")}
              </Labels>
              <TextAreas
                disabled
                name="problemReceived"
                value={problemReceived}
                rows={2}
                className="text-sm"
              />
            </Holds>

            {/* Additional Notes */}
            <Holds>
              <Labels size="p5" htmlFor="additionalNotes">
                {t("AdditionalNotes")}
              </Labels>
              <TextAreas
                disabled
                name="additionalNotes"
                value={additionalNotes}
                rows={2}
                className="text-sm"
              />
            </Holds>

            {/* Delay Warning */}
            {hasBeenDelayed && (
              <Texts position="left" size="p7" className="text-red-500">
                * {t("ProjectHasAlreadyBeenDelayed")} *
              </Texts>
            )}

            {/* Delay Selection */}
            <Holds>
              <Labels size="p4" htmlFor="delayReasoning">
                {t("DelayStatus")}
              </Labels>
              <Selects
                name="delayReasoning"
                value={delayReasoning}
                onChange={(e) => setDelayReasoning(e.target.value)}
              >
                <option value="">{t("NoDelay")}</option>
                <option value="Delay">{t("Delay")}</option>
              </Selects>
            </Holds>

            {/* Expected Arrival (if delayed) */}
            {delayReasoning === "Delay" && (
              <Holds>
                <Labels size="p4" htmlFor="delayDate">
                  {t("ExpectArrival")}
                </Labels>
                <Inputs
                  type="date"
                  name="delayDate"
                  value={expectedArrival}
                  onChange={(e) => setExpectedArrival(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
                />
              </Holds>
            )}

            {/* Validation Messages */}
            {renderValidationMessages()}
          </Holds>

          {/* Leave Project Button */}
          <Holds className="row-start-7 row-end-8">
            <Buttons
              disabled={isButtonDisabled}
              background={isButtonDisabled ? "darkGray" : "red"}
              className="py-2 w-full"
              onClick={onLeaveProject}
            >
              <Titles size="h2">{t("LeaveProject")}</Titles>
            </Buttons>
          </Holds>
        </Grids>
      </Contents>
    </Holds>
  );
}
