"use client";

type TimeSheet = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  jobsiteId: string;
  workType: string;
  status: string;

  CostCode: {
    name: string;
  };
  Jobsite: {
    name: string;
  };
  TascoLogs: {
    id: string;
    shiftType: string;
    laborType: string;
    materialType: string | null;
    LoadQuantity: number;
    Equipment: {
      id: string;
      name: string;
    };
    RefuelLogs: {
      id: string;
      gallonsRefueled: number;
    }[];
  }[];
  TruckingLogs: {
    id: string;
    laborType: string;
    startingMileage: number;
    endingMileage: number | null;
    Truck: {
      id: string;
      name: string;
    };
    Trailer: {
      id: string;
      name: string;
    };
    Equipment: {
      id: string;
      name: string;
    };
    Materials: {
      id: string;
      name: string;
      quantity: number;
      loadType: string;
      unit: string;
      locationOfMaterial: string | null;
      materialWeight: number;
    }[];
    EquipmentHauled: {
      id: string;
      source: string;
      destination: string;
      Equipment: {
        name: string;
      };
    }[];
    RefuelLogs: {
      id: string;
      gallonsRefueled: number;
      milesAtFueling?: number;
    }[];
    StateMileages: {
      id: string;
      state: string;
      stateLineMileage: number;
    }[];
  }[];
  EmployeeEquipmentLogs: {
    id: string;
    startTime: string;
    endTime: string;
    Equipment: {
      id: string;
      name: string;
    };
    RefuelLogs: {
      id: string;
      gallonsRefueled: number;
    }[];
  }[];
};
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import React, { useState } from "react";

export default function GeneralReviewSection({
  currentTimeSheets,
  isScrolling, // Default to 'verticle' if not provided
  scrollSwipeHandlers,
}: {
  currentTimeSheets: TimeSheet[];
  isScrolling: boolean;
  scrollSwipeHandlers?: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}) {
  const t = useTranslations("TimeCardSwiper");

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "-";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      {currentTimeSheets.map((timesheet) => (
        <Accordion type="single" collapsible key={timesheet.id}>
          {currentTimeSheets
            .slice()
            .sort((a, b) => {
              const startTimeA = new Date(a.startTime).getTime();
              const startTimeB = new Date(b.startTime).getTime();
              return startTimeA - startTimeB;
            })
            .map((timesheet, index) => (
              <AccordionItem
                value={timesheet.id}
                key={timesheet.id}
                className="bg-white rounded-lg mb-2"
              >
                <AccordionTrigger className="p-2 focus:outline-none hover:no-underline focus:underline-none focus:border-none ">
                  <p className="text-xs ">{`Id: #${timesheet.id}`}</p>
                  <p className="text-xs">
                    {`${t("Duration")}: ${getDuration(timesheet.startTime, timesheet.endTime)}`}
                  </p>
                </AccordionTrigger>

                <AccordionContent>
                  <Holds className="p-2  bg-white flex flex-col items-start relative border-t border-gray-200">
                    <Images
                      titleImg={
                        timesheet.workType === "TRUCK_DRIVER"
                          ? "/trucking.svg"
                          : timesheet.workType === "MECHANIC"
                            ? "/mechanic.svg"
                            : timesheet.workType === "TASCO"
                              ? "/tasco.svg"
                              : "/equipment.svg"
                      }
                      titleImgAlt="WorkType Icon"
                      className="w-7 h-7 mb-1 absolute top-1 right-1"
                    />
                    <Texts size="sm" className="text-xs">
                      <strong>{t("Start")}:</strong>{" "}
                      {timesheet.startTime
                        ? new Date(timesheet.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "-"}
                    </Texts>
                    <Texts size="sm" className="text-xs">
                      <strong>{t("End")}:</strong>{" "}
                      {timesheet.endTime
                        ? new Date(timesheet.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "-"}
                    </Texts>
                    <Texts
                      size="sm"
                      className="text-xs text-left truncate max-w-[200px] "
                    >
                      <strong>{t("Jobsite")}:</strong> {timesheet.Jobsite.name}
                    </Texts>
                    <Texts size="sm" className="text-xs truncate max-w-[200px]">
                      <strong>{t("Costcode")}:</strong>{" "}
                      {timesheet.CostCode.name.split(" ")[0]}
                    </Texts>
                  </Holds>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      ))}
    </>
  );
}
