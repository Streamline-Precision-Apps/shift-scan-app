"use server";
import { auth } from "@/auth";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { cookies } from "next/headers";
import TruckingContexts from "./components/contents";

export default async function Inbox() {
  const session = await auth();
  if (!session) return null;
  const laborType = (await cookies()).get("laborType")?.value;

  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"} className="h-full">
          <TruckingContexts laborType={laborType} />
        </Grids>
      </Contents>
    </Bases>
  );
}
