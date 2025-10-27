"use server";
import { auth } from "@/auth";
// import ClockOutContent from "@/app/(routes)/dashboard/clock-out/clockOutContent";
import { redirect } from "next/navigation";
import TempClockOutContent from "./tempClockOutContent";
import { ClockOutComment } from "@/actions/timeSheetActions";

export default async function ClockOutPage() {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }

  const user = session.user;

  // Pass user id and permission so downstream logic can determine manager/team status
  // by user id finds the timecard comment if it exists for switch jobs
  const clockOutComment = await ClockOutComment({ userId: user.id });

  return (
    <TempClockOutContent
      userId={session.user.id}
      permission={session.user.permission}
      clockOutComment={clockOutComment}
    />
  );
}
