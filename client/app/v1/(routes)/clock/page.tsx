"use server";
import { auth } from "@/auth";
// import ClockProcessor from "@/components/(clock)/clockProcess";
import NewClockProcess from "@/components/(clock)/newclockProcess";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Clock() {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }

  const user = session.user;
  // Get the current language from cookies
  const lang = (await cookies()).get("locale");
  const locale = lang?.value || "en";
  return (
    <Bases>
      <Contents>
        <Holds className="h-full">
          <NewClockProcess
            mechanicView={user.mechanicView ?? false}
            tascoView={user.tascoView ?? false}
            truckView={user.truckView ?? false}
            laborView={user.laborView ?? false}
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
