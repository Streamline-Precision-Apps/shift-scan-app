import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import { useTranslations } from "next-intl";
import { useCalculateBarHeight } from "./useCalculateBarHeight";
type Props = {
  nextData: {
    date: string;
    hours: number;
  };
};
/**
 * Displays the Right bar in a time tracking visualization with hours worked.
 */

export default function RightBar({ nextData }: Props) {
  const t = useTranslations("Home");
  const barHeight = useCalculateBarHeight(nextData.hours);
  return (
    <>
      {nextData.date !== "" ? (
        <Holds className="mx-auto pt-10 rounded-[10px] h-full w-full">
          <Holds
            background="white"
            className={`h-full rounded-[10px] p-2 flex justify-end ${
              nextData.hours === 0 &&
              nextData.date <= new Date().toISOString().split("T")[0]
                ? " "
                : ""
            }`}
          >
            <Holds
              className={`rounded-[10px] ${
                nextData.hours !== 0 ? "bg-app-blue" : ""
              }`}
              style={{
                height: `${barHeight}%`,
                border: nextData.hours ? "3px solid black" : "none",
              }}
            ></Holds>
          </Holds>
          <Texts size="p6" text={"white"}>
            {nextData.hours !== 0
              ? ` ${nextData.hours.toFixed(1)} ${t("DA-Time-Label")}`
              : `0.0 ${t("DA-Time-Label")}`}
          </Texts>
        </Holds>
      ) : (
        <Holds className="mx-auto pt-6 h-full w-[25%]" />
      )}
    </>
  );
}
