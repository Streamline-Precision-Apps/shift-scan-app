"use client";

import { Buttons } from "../components/(reusable)/buttons";
import { Images } from "../components/(reusable)/images";
import { Texts } from "../components/(reusable)/texts";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useUserStore } from "@/app/lib/store/userStore";
import { Holds } from "../components/(reusable)/holds";

import { Titles } from "../components/(reusable)/titles";
import { motion, AnimatePresence } from "framer-motion";
import Capitalize from "@/app/lib/utils/capitalizeFirst";
import CapitalizeAll from "@/app/lib/utils/capitalizeAll";

export type ViewComponentProps = {
  scrollLeft: () => void;
  scrollRight: () => void;
  currentDate: string;
  /**
   * If true, disables animation on initial render (for instant load on current date)
   */
  disableInitialAnimation?: boolean;
};

/**
 * A control component for displaying the date and navigating time tracking data in a time tracking visualization.
 */
export default function ViewComponent({
  scrollLeft,
  scrollRight,
  currentDate,
  disableInitialAnimation = false,
}: ViewComponentProps) {
  // Get language from user store, fallback to 'en-US'
  const userLanguage =
    useUserStore((state) => state.user?.UserSettings?.language) || "en-US";
  const [locale, setLocale] = useState(userLanguage);

  // If user language changes, update locale
  useEffect(() => {
    setLocale(userLanguage);
  }, [userLanguage]);

  const t = useTranslations("Home");

  // Convert currentDate to MST
  const zonedCurrentDate = new Date(currentDate); //new Date(currentDate);

  const todayZoned = new Date();

  // Get the weekday name in MST
  const Weekday = zonedCurrentDate.toLocaleDateString(locale, {
    weekday: "long",
  });

  // Format the date as "Mon, Aug 5, 2024"
  const dateToday = zonedCurrentDate.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Holds
      background={"white"}
      position={"row"}
      className="border-[3px] border-black h-full w-full p-2 shadow-[8px_8px_0px_rgba(0,0,0,0.45)] rounded-[10px]"
    >
      <Buttons onClick={scrollLeft} className="shadow-none w-[60px]">
        <Images
          titleImg={"/arrowLeftSymbol.svg"}
          titleImgAlt="left"
          className="mx-auto h-5 w-5"
        />
      </Buttons>
      <Holds
        background={"white"}
        size={"80"}
        className="h-full mx-2 justify-center rounded-[10px]"
      >
        <AnimatePresence mode="wait" initial={!disableInitialAnimation}>
          <motion.div
            key={currentDate}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <Titles size={"h3"} className="">
              {zonedCurrentDate.toDateString() === todayZoned.toDateString()
                ? `${t("DA-Today")}, ${Capitalize(Weekday)}`
                : Capitalize(Weekday)}
            </Titles>
            <Texts size={"p5"}>{CapitalizeAll(dateToday)}</Texts>
          </motion.div>
        </AnimatePresence>
      </Holds>
      <Buttons onClick={scrollRight} className="shadow-none w-[60px]">
        <Images
          titleImg={"/arrowRightSymbol.svg"}
          titleImgAlt="right"
          className="mx-auto h-5 w-5"
        />
      </Buttons>
    </Holds>
  );
}
