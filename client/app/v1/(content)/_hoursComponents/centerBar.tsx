"use client";
import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import { useTranslations } from "next-intl";
import { useCalculateBarHeight } from "./useCalculateBarHeight";

type Props = {
  currentData: {
    hours: number;
    date: string;
  };
};

/**
 * Displays the center bar in a time tracking visualization with hours worked.
 */
export default function CenterBar({ currentData }: Props) {
  const t = useTranslations("Home");
  const barHeight = useCalculateBarHeight(currentData.hours);
  return (
    <Holds className="mx-auto h-full w-full pt-4">
      <Holds
        className={`h-full rounded-[10px] bg-app-dark-green p-2 flex justify-end ${
          currentData.hours === 0 &&
          currentData.date <= new Date().toISOString().split("T")[0]
            ? " "
            : ""
        }`}
      >
        <Holds
          className={`rounded-[10px] justify-end ${
            currentData.hours !== 0 ? "bg-app-green" : ""
          }`}
          style={{
            height: `${barHeight}%`,
            border: currentData.hours ? "3px solid black" : "none",
          }}
        ></Holds>
      </Holds>
      <Texts size="p6" text={"white"}>
        {currentData.hours !== 0
          ? `${currentData.hours.toFixed(1)} ${t("DA-Time-Label")}`
          : `0.0 ${t("DA-Time-Label")}`}
      </Texts>
    </Holds>
  );
}
