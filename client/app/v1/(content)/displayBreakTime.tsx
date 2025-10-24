"use client";
import { useTranslations } from "next-intl";
import ViewHoursComponent from "@/app/(content)/hoursControl";
import { Buttons } from "@/components/(reusable)/buttons";
import { Texts } from "@/components/(reusable)/texts";
import { Holds } from "@/components/(reusable)/holds";
import { Grids } from "@/components/(reusable)/grids";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import Spinner from "@/components/(animations)/spinner";

type BreakTimeProps = {
  display: boolean;
  setToggle: (toggle: boolean) => void;
};

export default function DisplayBreakTime({
  setToggle,
  display,
}: BreakTimeProps) {
  const t = useTranslations("Home");
  const e = useTranslations("Err-Msg");
  const [breakTime, setBreakTime] = useState<Date>(); // Store Date object directly
  const [loading, setLoading] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Delay rendering until hydration is complete
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Calculate the initial break time in seconds
  const getBreakTime = useMemo(() => {
    if (!breakTime) {
      return 0;
    }

    // Current time
    const now = new Date();

    // Calculate the duration in milliseconds
    const breakDuration = now.getTime() - breakTime.getTime();

    // Convert duration to seconds
    return Math.floor(breakDuration / 1000); // Convert to seconds
  }, [breakTime]);

  const [elapsedTime, setElapsedTime] = useState<number>(getBreakTime);

  useEffect(() => {
    const fetchBreakTime = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/getRecentTimecardReturn");
        const data = await response.json();
        const breakTime = new Date(data.endTime); // This will parse in local time
        setBreakTime(breakTime); // Store the Date object directly
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error(
            "Validation error in fetched pay period sheets:",
            error
          );
        } else {
          console.error(e("PayPeriod-Fetch"), error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBreakTime();
  }, [e]);

  const handler = () => {
    setToggle(!display);
  };

  // Function to format time in hh:mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const hours = seconds / 3600;
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0) return `${mins} mins`;
    else if (hours === 1) return `${hours.toFixed(1)} hr`;
    else {
      return `${hours.toFixed(1)} hrs`;
    }
  };

  // Update elapsed time when breakTime changes
  useEffect(() => {
    setElapsedTime(getBreakTime);
  }, [getBreakTime]);

  // Real-time counter to update elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1); // Increment elapsed time by 1 second
    }, 1000);

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, [setBreakTime]);

  if (!hydrated) {
    return null; // Render nothing until the client has hydrated
  }

  return display ? (
    <>
      <Buttons onClick={handler} background={"darkBlue"}>
        <Grids cols={"10"} rows={"3"}>
          <Holds className="col-start-1 col-end-6 row-span-3">
            <Texts text={"white"} size={"p2"}>
              {t("Break")}
            </Texts>
          </Holds>
          <Holds
            background={"white"}
            className="col-start-7 col-end-10 row-start-1 row-end-4 py-4 md:py-6 lg:py-8 border-[3px] border-black rounded-[10px] "
          >
            <Holds className="h-full flex items-center justify-center">
              {loading ? (
                <Spinner size={20} />
              ) : (
                <Texts text={"black"} size={"p6"}>
                  {formatTime(elapsedTime)}
                </Texts>
              )}
            </Holds>
          </Holds>
        </Grids>
      </Buttons>
    </>
  ) : (
    <div>
      <ViewHoursComponent toggle={setToggle} />
    </div>
  );
}
