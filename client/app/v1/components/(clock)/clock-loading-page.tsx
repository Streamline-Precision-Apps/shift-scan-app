"use client";

import { useTranslations } from "next-intl";
import { Contents } from "../(reusable)/contents";
import { Grids } from "../(reusable)/grids";
import { Holds } from "../(reusable)/holds";
import { Images } from "../(reusable)/images";
import Spinner from "../(animations)/spinner";
import { Buttons } from "../(reusable)/buttons";
import { TitleBoxes } from "../(reusable)/titleBoxes";

export default function ClockLoadingPage({
  handleReturnPath,
}: {
  handleReturnPath?: () => void;
}) {
  return (
    <Holds background={"white"} className="h-full w-full animate-pulse">
      <Grids rows={"7"} gap={"5"}>
        <Holds className="row-start-1 row-end-2 h-full w-full">
          <TitleBoxes
            onClick={handleReturnPath ? handleReturnPath : undefined}
          />
        </Holds>
        <Holds className="row-start-2 row-end-8 h-full w-full">
          <Contents width={"section"}>
            <Grids rows={"7"} gap={"5"} className="h-full w-full ">
              <Holds className="flex justify-center items-center h-full w-full row-start-1 row-end-7 ">
                <Spinner size={70} />
              </Holds>
            </Grids>
          </Contents>
        </Holds>
      </Grids>
    </Holds>
  );
}
