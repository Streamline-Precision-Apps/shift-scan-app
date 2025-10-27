"use server";
import { ClockOutComment } from "@/actions/timeSheetActions";
import { auth } from "@/auth";
import Spinner from "@/components/(animations)/spinner";
import NewClockProcess from "@/components/(clock)/newclockProcess";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Helper function to fetch cookie data
const getCookieData = async () => {
  const cookieStore = cookies();
  const timeSheetId = (await cookieStore).get("timeSheetId")?.value;
  const jobSiteId = (await cookieStore).get("jobSiteId")?.value;
  const costCode = (await cookieStore).get("costCode")?.value;
  const workRole = (await cookieStore).get("workRole")?.value;
  const switchLaborType = (await cookieStore).get("laborType")?.value;

  return { timeSheetId, jobSiteId, costCode, workRole, switchLaborType };
};

export default async function SwitchJobs() {
  const session = await auth();

  if (!session) {
    // Redirect or return an error if the user is not authenticated
    redirect("/signin");
  }

  // Fetch all records
  const user = session.user;

  // Get the current language from cookies```
  const lang = (await cookies()).get("locale");
  const locale = lang?.value || "en";
  // Fetch cookie data
  const { timeSheetId, jobSiteId, costCode, workRole, switchLaborType } =
    await getCookieData();

  // by user id finds the timecard comment if it exists for switch jobs
  const clockOutComment = await ClockOutComment({ userId: user.id });

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
              returnpath="/dashboard"
              type={"switchJobs"}
              scannerType={"jobsite"}
              locale={locale}
              timeSheetId={timeSheetId}
              jobSiteId={jobSiteId}
              costCode={costCode}
              workRole={workRole}
              switchLaborType={switchLaborType}
              clockOutComment={clockOutComment}
            />
          </Suspense>
        </Holds>
      </Contents>
    </Bases>
  );
}
