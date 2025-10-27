"use client";
import { useTranslations } from "next-intl";
import { breakOutTimeSheet } from "@/actions/timeSheetActions";
import { setCurrentPageView } from "@/actions/cookieActions";
import { useRouter } from "next/navigation";
import { Holds } from "@/components/(reusable)/holds";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Texts } from "@/components/(reusable)/texts";
import { CheckBox } from "@/components/(inputs)/checkBox";
import { Buttons } from "@/components/(reusable)/buttons";
import { Titles } from "@/components/(reusable)/titles";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Contents } from "@/components/(reusable)/contents";
import { Images } from "@/components/(reusable)/images";
import { useTimeSheetData } from "@/app/context/TimeSheetIdContext";
import { Bases } from "@/components/(reusable)/bases";
import { usePermissions } from "@/app/context/PermissionsContext";

export default function Comment({
  handleClick,
  setCommentsValue,
  commentsValue,
  checked,
  handleCheckboxChange,
  setLoading,
  loading = false,
  currentTimesheetId,
}: {
  commentsValue: string;
  handleClick: () => void;
  clockInRole: string | undefined;
  setCommentsValue: React.Dispatch<React.SetStateAction<string>>;
  checked: boolean;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  currentTimesheetId: number | undefined;
}) {
  const c = useTranslations("Clock");
  const { permissions, getStoredCoordinates } = usePermissions();
  const { refetchTimesheet, savedTimeSheetData, setTimeSheetData } =
    useTimeSheetData();
  const router = useRouter();
  const returnRoute = () => {
    window.history.back();
  };

  const processOne = async () => {
    try {
      let timeSheetId = currentTimesheetId;

      if (!timeSheetId) {
        await refetchTimesheet();
        const ts = savedTimeSheetData?.id;
        if (!ts) {
          console.error("No active timesheet found for job switch.");
        }
        return (timeSheetId = ts);
      }
      if (!permissions.location) {
        console.error("Location permissions are required to clock in.");
        return;
      }
      const coordinates = getStoredCoordinates();
      const formData2 = new FormData();
      formData2.append("id", timeSheetId.toString());
      formData2.append("endTime", new Date().toISOString());
      formData2.append("timesheetComments", commentsValue);
      formData2.append("clockOutLat", coordinates?.latitude.toString() || "");
      formData2.append("clockOutLng", coordinates?.longitude.toString() || "");

      const isUpdated = await breakOutTimeSheet(formData2);
      if (isUpdated) {
        await setCurrentPageView("break");
        setTimeSheetData(null);
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Bases>
      <Contents>
        <Holds background={"white"} className="h-full">
          <Holds className="h-full w-full flex flex-col items-center">
            <TitleBoxes onClick={returnRoute} className="h-24">
              <Holds className="h-full justify-end">
                <Titles size={"md"}>{c("PreviousJobComments")}</Titles>
              </Holds>
            </TitleBoxes>
            <div className="w-[90%] flex-grow flex flex-col">
              <Holds className="h-fit w-full relative mt-5">
                <TextAreas
                  value={commentsValue}
                  onChange={(e) => {
                    setCommentsValue(e.target.value);
                  }}
                  placeholder={c("TodayIDidTheFollowing")}
                  className="w-full h-full text-sm"
                  maxLength={40}
                  rows={6}
                  style={{ resize: "none" }}
                  disabled={loading}
                />

                <Texts
                  size={"p5"}
                  className={`${
                    commentsValue.length >= 40
                      ? "text-red-500 absolute bottom-5 right-2"
                      : "absolute bottom-5 right-2"
                  }`}
                >
                  {commentsValue.length}/40
                </Texts>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                    <span className="text-gray-500 text-lg">Loading...</span>
                  </div>
                )}
              </Holds>

              <Holds position={"row"} className="pt-5">
                <Holds className="w-fit pr-5">
                  <CheckBox
                    checked={checked}
                    id="end-day"
                    name="end-day"
                    size={2.5}
                    onChange={handleCheckboxChange}
                    disabled={loading}
                  />
                </Holds>
                <Texts size={"md"}>{c("EndWorkForTheDay")}</Texts>
              </Holds>
            </div>

            <div className="w-[90%] flex justify-end h-[70px] pb-4 ">
              <Buttons
                background={commentsValue.length < 3 ? "darkGray" : "orange"}
                onClick={checked ? handleClick : processOne}
                disabled={commentsValue.length < 3 || loading}
                className="h-[60px] w-full"
              >
                <Holds
                  position={"row"}
                  className="w-full h-full justify-center gap-x-2"
                >
                  <Titles size={"md"}>
                    {checked ? c("Continue") : c("StartBreak")}
                  </Titles>
                  {!checked && (
                    <Images
                      titleImg="/clockBreak.svg"
                      titleImgAlt="clock Break"
                      className="max-w-8 h-auto"
                    />
                  )}
                </Holds>
              </Buttons>
            </div>
          </Holds>
        </Holds>
      </Contents>
    </Bases>
  );
}
