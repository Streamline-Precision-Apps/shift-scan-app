"use server";
import { auth } from "@/auth";
import NewClockProcess from "@/components/(clock)/newclockProcess";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Clock() {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }
  const user = session.user;
  const lang = (await cookies()).get("locale");
  const locale = lang ? lang.value : "en"; // Default to English

  return (
    <Bases>
      <Contents>
        <NewClockProcess
          type={"jobsite"}
          scannerType={"jobsite"}
          option={"break"}
          locale={locale}
          returnpath="/"
          mechanicView={user.mechanicView}
          tascoView={user.tascoView}
          truckView={user.truckView}
          laborView={user.laborView}
        />
      </Contents>
    </Bases>
  );
}
