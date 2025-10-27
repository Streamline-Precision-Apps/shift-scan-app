"use server";
import { auth } from "@/auth";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { Grids } from "@/components/(reusable)/grids";
import { redirect } from "next/navigation";
import ScanEquipment from "./_components/scanEquipmentSteps";

export default async function LogNewEquipment() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  return (
    <Bases>
      <Contents>
        <Grids rows={"1"}>
          <Holds background={"white"} className="h-full row-span-1">
            <ScanEquipment />
          </Holds>
        </Grids>
      </Contents>
    </Bases>
  );
}
