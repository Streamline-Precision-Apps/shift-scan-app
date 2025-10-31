"use client";
import { useTranslations } from "next-intl";

import { useUserStore } from "@/app/lib/store/userStore";
import { Buttons } from "../components/(reusable)/buttons";
import { Texts } from "../components/(reusable)/texts";
import { Holds } from "../components/(reusable)/holds";
import Spinner from "../components/(animations)/spinner";
import { Grids } from "../components/(reusable)/grids";
import ControlComponent from "./hoursControl";

// Assuming User has at least these fields, adjust accordingly

type HoursProps = {
  display: boolean;
  setToggle: (toggle: boolean) => void;
  loading: boolean;
};

export default function Hours({ setToggle, display, loading }: HoursProps) {
  const t = useTranslations("Home");
  const payPeriodTimeSheet = useUserStore((state) => state.payPeriodTimeSheet);
  // Calculate total hours from payPeriodTimeSheet
  const payPeriodHoursRaw = Array.isArray(payPeriodTimeSheet)
    ? payPeriodTimeSheet.reduce((total, sheet) => {
        if (sheet.startTime && sheet.endTime) {
          return (
            total +
            (new Date(sheet.endTime).getTime() -
              new Date(sheet.startTime).getTime()) /
              (1000 * 60 * 60)
          );
        }
        return total;
      }, 0)
    : 0;
  const payPeriodHours = Math.round(payPeriodHoursRaw * 10) / 10;

  const handler = () => {
    setToggle(!display);
  };
  if (loading)
    return (
      <Buttons onClick={handler} background={"darkBlue"}>
        <Grids cols={"10"} rows={"3"}>
          <Holds className="col-start-1 col-end-7 row-span-3">
            <Texts text={"white"} size={"xl"}>
              {t("PayPeriodHours")}
            </Texts>
          </Holds>
          <Holds
            background={"white"}
            className="col-start-7 col-end-10 row-start-1 row-end-4 p-3 border-[3px] border-black rounded-[10px]"
          >
            <Spinner size={20} />
          </Holds>
        </Grids>
      </Buttons>
    );

  return display ? (
    <Buttons onClick={handler} background={"darkBlue"}>
      <Grids cols={"10"} rows={"3"}>
        <Holds className="col-start-1 col-end-7 row-span-3">
          <Texts text={"white"} size={"xl"}>
            {t("PayPeriodHours")}
          </Texts>
        </Holds>
        <Holds
          background={"white"}
          className="col-start-7 col-end-10 row-start-1 row-end-4 py-3  border-[3px] border-black rounded-[10px]"
        >
          <Texts text={"black"} size={"xs"}>
            {payPeriodHours} {t("Unit")}
          </Texts>
        </Holds>
      </Grids>
    </Buttons>
  ) : (
    <ControlComponent toggle={setToggle} />
  );
}
