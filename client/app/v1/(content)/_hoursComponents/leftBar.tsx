import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import { useTranslations } from "next-intl";
import { useCalculateBarHeight } from "./useCalculateBarHeight";

type Props = {
  prevData: {
    date: string;
    hours: number;
  };
};

/**
 * Displays the Left bar in a time tracking visualization with hours worked.
 */
export default function LeftBar({ prevData }: Props) {
  const t = useTranslations("Home");
  const barHeight = useCalculateBarHeight(prevData.hours); // Moved hook call to top level

  return (
    <>
      {/* Render prevData only if it exists */}
      {prevData.date !== "" ? (
        <Holds className="mx-auto pt-10 h-full w-full">
          <Holds
            className={`h-full rounded-[10px] bg-white p-2 justify-end ${
              prevData.hours === 0 &&
              prevData.date <= new Date().toISOString().split("T")[0]
                ? ""
                : ""
            }`}
          >
            <Holds
              className={`rounded-[10px] ${
                prevData.hours !== 0 ? "bg-app-blue" : ""
              }`}
              style={{
                height: `${barHeight}%`,
                border: prevData.hours ? "3px solid black" : "",
              }}
            ></Holds>
          </Holds>
          <Texts size="p6" text={"white"}>
            {prevData.hours !== 0
              ? `${prevData.hours.toFixed(1)} ${t("DA-Time-Label")}`
              : `0.0 ${t("DA-Time-Label")}`}
          </Texts>
        </Holds>
      ) : (
        <Holds className="mx-auto pt-4 h-full w-[25%]" />
      )}
    </>
  );
}
