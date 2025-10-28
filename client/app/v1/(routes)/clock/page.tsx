"use Client";
import { useUserStore } from "@/app/lib/store/userStore";
// import ClockProcessor from "@/app/v1/components/(clock)/clockProcess";
import NewClockProcess from "@/app/v1/components/(clock)/newclockProcess";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Clock() {
  const { user } = useUserStore();

  // Get the current language from cookies
  const lang = user?.UserSettings?.language as string;

  const locale = lang || "en";
  return (
    <Bases>
      <Contents>
        <Holds className="h-full">
          <NewClockProcess
            mechanicView={user?.mechanicView ?? false}
            tascoView={user?.tascoView ?? false}
            truckView={user?.truckView ?? false}
            laborView={user?.laborView ?? false}
            option="clockin"
            returnpath="/"
            type={"jobsite"}
            scannerType={"jobsite"}
            locale={locale}
          />
        </Holds>
      </Contents>
    </Bases>
  );
}
