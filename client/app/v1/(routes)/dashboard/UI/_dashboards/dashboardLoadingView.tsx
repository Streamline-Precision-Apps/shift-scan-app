"use client";
import Spinner from "@/components/(animations)/spinner";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";

export default function DashboardLoadingView() {
  return (
    <>
      <Contents width={"section"} className="py-5">
        <Grids rows={"3"} gap={"5"} className="animate-pulse">
          <Holds className=" row-start-1 row-end-4">
            <Spinner size={40} />
          </Holds>
        </Grids>
      </Contents>
    </>
  );
}
