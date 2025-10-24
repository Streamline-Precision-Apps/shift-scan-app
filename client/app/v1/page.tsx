"use client";
import { Bases } from "./components/(reusable)/bases";
import { Contents } from "./components/(reusable)/contents";
import { Grids } from "./components/(reusable)/grids";
import HamburgerMenuNew from "./components/(animations)/hamburgerMenuNew";
import WidgetSection from "./(content)/widgetSection";
import { Suspense } from "react";
// import { cookies } from "next/headers";
import { Holds } from "./components/(reusable)/holds";
import Spinner from "./components/(animations)/spinner";
import { useSession } from "../lib/context/sessionContext";

// import ContinueTimesheetCheck from "./(content)/ContinueTimesheetCheck";

export default function Home() {
  //------------------------------------------------------------------------
  // Variables needed at all times:
  // Session checker
  const { locale } = useSession();

  return (
    <Bases>
      <Contents>
        <Grids rows={"8"} gap={"5"}>
          <Suspense
            fallback={
              <Holds
                position={"row"}
                background={"white"}
                className="row-start-1 row-end-2 h-full p-2 py-3"
              />
            }
          >
            <HamburgerMenuNew isHome={true} />
          </Suspense>
          <Suspense
            fallback={
              <>
                <Holds className="row-span-2 bg-app-blue bg-opacity-20 w-full p-10 h-[80%] rounded-[10px] animate-pulse"></Holds>
                <Holds
                  background={"white"}
                  className="row-span-5 h-full justify-center items-center animate-pulse"
                >
                  <Spinner />
                </Holds>
              </>
            }
          >
            <WidgetSection
              locale={locale}
              session={session}
              isTerminate={isTerminate}
            />
          </Suspense>
        </Grids>
      </Contents>
    </Bases>
  );
}
