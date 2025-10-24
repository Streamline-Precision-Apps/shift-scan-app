"use client";
import { Dispatch, SetStateAction } from "react";
import { Grids } from "./grids";
import { Holds } from "./holds";
import { Titles } from "./titles";
import { Texts } from "./texts";

export default function Sliders({
  leftTitle,
  rightTitle,
  activeTab,
  setActiveTab,
}: {
  leftTitle: string;
  rightTitle: string;
  activeTab: number;
  setActiveTab: Dispatch<SetStateAction<number>>; // Changed from Number to number
}) {
  return (
    <div className="h-full w-full bg-app-gray rounded-[10px] border-[3px] border-black overflow-hidden relative">
      <Grids cols={"2"} className="h-full w-full relative">
        {/* Slide Background */}
        <div
          className={`
            absolute z-0 top-0 h-full w-1/2 transition-transform duration-300 bg-app-blue rounded-[6px]
            ${activeTab === 1 ? "translate-x-0" : "translate-x-full"}
          `}
        />

        <Holds
          className={`h-full w-full col-span-1 py-2 z-0  flex justify-center items-center cursor-pointer`}
          onClick={() => setActiveTab(1)}
        >
          <Texts size={"xs"}>{leftTitle}</Texts>
        </Holds>

        <Holds
          className={`h-full w-full col-span-1 py-2 z-0 flex justify-center items-center cursor-pointer`}
          onClick={() => setActiveTab(2)}
        >
          <Texts size={"xs"}>{rightTitle}</Texts>
        </Holds>
      </Grids>
    </div>
  );
}
