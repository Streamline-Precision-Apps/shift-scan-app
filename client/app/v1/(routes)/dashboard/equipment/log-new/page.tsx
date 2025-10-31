"use client";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import ScanEquipment from "./_components/scanEquipmentSteps";

export default function LogNewEquipment() {
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
