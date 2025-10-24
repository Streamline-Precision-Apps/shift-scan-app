"use client";

import Slider from "react-slick";
import React, { useEffect, useState } from "react";
import { Titles } from "./titles";
import { Holds } from "./holds";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Texts } from "./texts";
import Spinner from "../(animations)/spinner";
import { useTranslations } from "next-intl";
import { formatDuration } from "@/utils/formatDuration";
import { Images } from "./images";
import { useTimeSheetData } from "@/app/context/TimeSheetIdContext";
// Type for Equipment
interface Equipment {
  id: string;
  name: string;
  qrId?: string;
}

// Type for Employee Equipment Log
interface EmployeeEquipmentLog {
  id: string;
  startTime: string;
  endTime?: string | null;
  equipment: Equipment;
}

// Type for Tasco Logs
interface TascoLog {
  shiftType: string;
  laborType: string;
  equipment?: Equipment;
}

// Type for Trucking Logs
interface TruckingLog {
  laborType: string;
  equipment: Equipment;
}

// Type for Job Site
interface Jobsite {
  id: string;
  qrId: string;
  name: string;
}

// Type for Cost Code
interface CostCode {
  id: string;
  name: string;
  description: string;
}

// Type for API Response
interface BannerData {
  id: string;
  startTime: string;
  jobsite: Jobsite;
  costCode: CostCode;
  employeeEquipmentLog: EmployeeEquipmentLog[];
  tascoLogs: TascoLog[];
  truckingLogs: TruckingLog[];
}

export default function BannerRotating() {
  const t = useTranslations("BannerRotating");
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [newDate, setNewDate] = useState(new Date());
  const { savedTimeSheetData, refetchTimesheet } = useTimeSheetData();

  const settings = {
    className: "slick-track",
    dots: true,
    draggable: true,
    speed: 500,
    arrows: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    pauseOnFocus: true,
    swipeToSlide: true,
    swipe: true,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNewDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateDuration = () => {
    if (!bannerData?.startTime) return "";
    return formatDuration(bannerData?.startTime, newDate);
  };

  // Fetch timeSheetId and banner data together with retry logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        let timeSheetId = savedTimeSheetData?.id;
        if (!timeSheetId) {
          console.log("No active timesheet in context, refetching...");
          await refetchTimesheet();
          const ts = savedTimeSheetData?.id;
          if (!ts) {
            console.warn("No active timesheet found for banner.");
          }
          return (timeSheetId = ts);
        }

        // Fetch banner data using the obtained timeSheetId
        const bannerResponse = await fetch(
          `/api/getBannerData?id=${timeSheetId}`,
        );

        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json();
          setBannerData(bannerData);
        } else {
          console.error("Banner API error:", bannerResponse.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [savedTimeSheetData]);

  return (
    <div className="w-[80%] h-full mx-auto">
      {bannerData ? (
        <Slider {...settings}>
          {/* Jobsite Information */}
          {bannerData.jobsite && (
            <Holds className="">
              <h3>{t("CurrentSite")}</h3>
              <p>{bannerData.jobsite.name}</p>
            </Holds>
          )}

          {/* Cost Code Information */}
          {bannerData.costCode && (
            <Holds className="h-full justify-center items-center space-y-1">
              <h3>{t("CurrentCostCode")} </h3>
              <p className="truncate-slick ">
                {bannerData.costCode.name || ""}
              </p>
            </Holds>
          )}

          {/* Tasco Logs */}
          {bannerData.tascoLogs &&
            bannerData.tascoLogs.map((equipment, index) => (
              <Holds key={index} className="h-full justify-center items-center">
                {equipment.shiftType === "ABCD Shift" &&
                equipment.laborType === "Operator" ? (
                  <Holds className="h-full justify-center items-center space-y-1">
                    <h3>{t("AbcdShift")} </h3>
                    <p>{t("EquipmentOperator")}</p>
                  </Holds>
                ) : equipment.shiftType === "E shift" ? (
                  <Holds className="h-full justify-center items-center space-y-1">
                    <h3>{t("EShift")} </h3>

                    <p>{t("MudConditioning")}</p>
                  </Holds>
                ) : equipment.shiftType === "ABCD Shift" &&
                  equipment.laborType === "Manual Labor" ? (
                  <Holds className="h-full justify-center items-center space-y-1">
                    <h3>{t("AbcdShift")} </h3>
                    <p>{t("ManualLabor")}</p>
                  </Holds>
                ) : null}
              </Holds>
            ))}

          {bannerData.tascoLogs &&
            bannerData.tascoLogs
              .filter((log) => log.laborType !== "Manual Labor")
              .map((log, index) => {
                if (!log.equipment) return null;
                return (
                  <Holds
                    key={index}
                    className="h-full justify-center items-center"
                  >
                    <Holds className="h-full justify-center items-center space-y-1">
                      <h3>{t("CurrentlyOperating")} </h3>
                      <p>{log.equipment?.name}</p>
                    </Holds>
                  </Holds>
                );
              })}

          {/* Trucking Logs */}
          {bannerData.truckingLogs &&
            bannerData.truckingLogs.map((equipment, index) => (
              <Holds
                key={index}
                className="h-full justify-center items-center space-y-1"
              >
                <h3>{t("CurrentlyOperating")} </h3>
                <p>{equipment.equipment?.name}</p>
              </Holds>
            ))}

          {/* Employee Equipment Logs */}
          {bannerData.employeeEquipmentLog &&
            bannerData.employeeEquipmentLog.map((equipment, index) => (
              <Holds key={index}>
                <h3>{equipment.equipment?.name || t("UnknownEquipment")}</h3>
                <p>
                  {equipment.startTime
                    ? `${t("StartTime")} ${equipment.startTime}`
                    : t("NoStartTime")}
                </p>
              </Holds>
            ))}

          <Holds className="w-full flex items-center space-y-1">
            <Holds position={"row"} className="w-full justify-center gap-x-2 ">
              <div className="max-w-8 h-auto rounded-full bg-white ">
                <img
                  src="/clock.svg"
                  alt="Clock Icon"
                  className="w-8 h-8 object-contain mx-auto "
                />
              </div>
              <h3>{t("ActiveTime")} </h3>
            </Holds>
            <p>{calculateDuration()}</p>
          </Holds>
        </Slider>
      ) : (
        <Holds className="w-[80%] h-full mx-auto justify-center items-center">
          <Spinner size={40} color="white" />
        </Holds>
      )}
    </div>
  );
}
