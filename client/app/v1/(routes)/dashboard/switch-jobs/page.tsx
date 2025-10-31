"use client";
import { ClockOutComment } from "@/app/lib/actions/timeSheetActions";
import { useUserStore } from "@/app/lib/store/userStore";
import Spinner from "@/app/v1/components/(animations)/spinner";
import NewClockProcess from "@/app/v1/components/(clock)/newclockProcess";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { getCookieList } from "@/app/lib/actions/cookieActions";
import { Suspense, useState, useEffect } from "react";

export default function SwitchJobs() {
  const { user } = useUserStore();
  const [cookieValues, setCookieValues] = useState<Record<string, any>>({});
  const [clockOutComment, setClockOutComment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cookie data
        const cookieResponse = await getCookieList({
          cookieNames: [
            "timeSheetId",
            "jobSiteId",
            "costCode",
            "workRole",
            "switchLaborType",
          ],
        });

        const values = cookieResponse?.value || {};
        setCookieValues(values);

        // Fetch clock out comment
        if (user?.id) {
          const comment = await ClockOutComment({ userId: user.id });
          setClockOutComment(comment);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  if (!user || isLoading)
    return (
      <Bases>
        <Contents>
          <Holds background={"white"} className="h-full">
            <div className="flex rounded-[10px]  justify-center items-center h-full w-full bg-neutral-50 animate-pulse">
              <Spinner color="border-app-dark-blue" />
            </div>
          </Holds>
        </Contents>
      </Bases>
    );

  // Get the current language from user settings
  const lang = user.UserSettings?.language;
  const locale = lang || "en";

  // Extract cookie values
  const timeSheetId = cookieValues.timeSheetId;
  const jobSiteId = cookieValues.jobSiteId;
  const costCode = cookieValues.costCode;
  const workRole = cookieValues.workRole;
  const switchLaborType = cookieValues.switchLaborType;

  return (
    <Bases>
      <Contents>
        <Holds background={"white"} className="h-full">
          <Suspense
            fallback={
              <div className="flex rounded-[10px]  justify-center items-center h-full w-full bg-neutral-50 animate-pulse">
                <Spinner color="border-app-dark-blue" />
              </div>
            }
          >
            <NewClockProcess
              mechanicView={user.mechanicView}
              tascoView={user.tascoView}
              truckView={user.truckView}
              laborView={user.laborView}
              option="clockin"
              returnpath="/v1/dashboard"
              type={"switchJobs"}
              scannerType={"jobsite"}
              locale={locale}
              timeSheetId={timeSheetId}
              jobSiteId={jobSiteId}
              costCode={costCode}
              workRole={workRole}
              switchLaborType={switchLaborType}
              clockOutComment={clockOutComment || undefined}
            />
          </Suspense>
        </Holds>
      </Contents>
    </Bases>
  );
}
