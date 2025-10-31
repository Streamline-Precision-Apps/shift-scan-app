"use client";

import Slider from "react-slick";
import { useEffect, useState } from "react";
import { Holds } from "./holds";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/app/globals.css";
import Spinner from "../(animations)/spinner";
import { useTranslations } from "next-intl";
import { formatDuration } from "@/app/lib/utils/formatDuration";
import { useTimeSheetData } from "@/app/lib/context/TimeSheetIdContext";
import { apiRequest } from "@/app/lib/utils/api-Utils";
import { useUserStore } from "@/app/lib/store/userStore";
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
  laborType: string | null;
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
}

// Type for API Response
interface BannerData {
  id: string;
  startTime: string;
  jobsite: Jobsite | null;
  costCode: CostCode | null;
  tascoLogs: TascoLog[];
  truckingLogs: TruckingLog[];
  employeeEquipmentLogs: EmployeeEquipmentLog[];
}

export default function BannerRotating() {
  const t = useTranslations("BannerRotating");
  const { user } = useUserStore();

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

  // Build slides array to control order and filtering
  const buildSlides = () => {
    if (!bannerData) return [];

    const slides: React.ReactNode[] = [];
    let slideKey = 0;

    // 1. Jobsite
    if (bannerData.jobsite) {
      slides.push(
        <div
          key={`jobsite-${slideKey++}`}
          className=" text-white flex flex-col"
        >
          <h3>{t("CurrentSite")}</h3>
          <p>{bannerData.jobsite.name}</p>
        </div>
      );
    }

    // 2. Cost Code
    if (bannerData.costCode && bannerData.costCode.name) {
      slides.push(
        <div
          key={`costcode-${slideKey++}`}
          className="text-white flex flex-col justify-center items-center space-y-1"
        >
          <h3>{t("CurrentCostCode")}</h3>
          <p className="text-white ">{bannerData.costCode.name}</p>
        </div>
      );
    }

    // 3. Tasco Logs - Labor Type Slides
    bannerData.tascoLogs.forEach((equipment, index) => {
      if (
        equipment.shiftType === "ABCD Shift" &&
        equipment.laborType === "Operator"
      ) {
        slides.push(
          <div
            key={`tasco-labor-${slideKey++}`}
            className="text-white flex flex-col justify-center items-center space-y-1"
          >
            <h3>{t("AbcdShift")}</h3>
            <p>{t("EquipmentOperator")}</p>
          </div>
        );
      } else if (equipment.shiftType === "E shift") {
        slides.push(
          <div
            key={`tasco-labor-${slideKey++}`}
            className="text-white flex flex-col justify-center items-center space-y-1"
          >
            <h3>{t("EShift")}</h3>
            <p>{t("MudConditioning")}</p>
          </div>
        );
      } else if (
        equipment.shiftType === "ABCD Shift" &&
        equipment.laborType === "Manual Labor"
      ) {
        slides.push(
          <div
            key={`tasco-labor-${slideKey++}`}
            className="text-white flex flex-col justify-center items-center space-y-1"
          >
            <h3>{t("AbcdShift")}</h3>
            <p>{t("ManualLabor")}</p>
          </div>
        );
      }
    });

    // 4. Tasco Equipment (non-manual labor)
    bannerData.tascoLogs
      .filter((log) => log.laborType !== "Manual Labor" && log.equipment)
      .forEach((log, index) => {
        slides.push(
          <div
            key={`tasco-equipment-${slideKey++}`}
            className="text-white flex flex-col justify-center items-center space-y-1"
          >
            <h3>{t("CurrentlyOperating")}</h3>
            <p>{log.equipment?.name}</p>
          </div>
        );
      });

    // 5. Trucking Logs
    bannerData.truckingLogs.forEach((log, index) => {
      slides.push(
        <div
          key={`trucking-${slideKey++}`}
          className="text-white flex flex-col justify-center items-center space-y-1"
        >
          <h3>{t("CurrentlyOperating")}</h3>
          <p>{log.equipment?.name}</p>
        </div>
      );
    });

    // 6. Employee Equipment Logs
    bannerData.employeeEquipmentLogs.forEach((equipment, index) => {
      slides.push(
        <div
          key={`employee-equipment-${slideKey++}`}
          className="text-white flex flex-col justify-center items-center space-y-1"
        >
          <h3>{equipment.equipment?.name || t("UnknownEquipment")}</h3>
          <p>
            {equipment.startTime
              ? `${t("StartTime")} ${equipment.startTime}`
              : t("NoStartTime")}
          </p>
        </div>
      );
    });

    // 7. Active Time
    slides.push(
      <div
        key={`active-time-${slideKey++}`}
        className="text-white flex flex-col justify-center items-center space-y-1"
      >
        <div className="w-full flex flex-row justify-center gap-x-2">
          <div className="max-w-8 h-8 rounded-full bg-white">
            <img
              src="/clock.svg"
              alt="Clock Icon"
              className="w-8 h-8 object-contain mx-auto"
            />
          </div>
          <h3>{t("ActiveTime")}</h3>
        </div>
        <p>{calculateDuration()}</p>
      </div>
    );

    return slides;
  };

  // Fetch timeSheetId and banner data together with retry logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        let timeSheetId = savedTimeSheetData?.id;
        if (!timeSheetId) {
          await refetchTimesheet();
          timeSheetId = savedTimeSheetData?.id;
          if (!timeSheetId) {
            console.warn("No active timesheet found for banner.");
            return;
          }
        }

        // Fetch banner data using the backend API
        const userId = user?.id;
        if (!userId) {
          return;
        }
        const response = await apiRequest(
          `/api/v1/timesheet/${timeSheetId}/user/${userId}`,
          "GET"
        );

        if (response && response.success && response.data) {
          setBannerData(response.data);
        }
      } catch (error) {
        console.error("Error fetching banner data:", error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedTimeSheetData]);

  return (
    <div className="w-[80%] h-full mx-auto">
      {bannerData ? (
        <Slider {...settings}>{buildSlides()}</Slider>
      ) : (
        <Holds className="w-[80%] h-full mx-auto justify-center items-center">
          <Spinner size={40} color="white" />
        </Holds>
      )}
    </div>
  );
}
