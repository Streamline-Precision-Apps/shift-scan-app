"use client";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { ChangeEvent, use, useEffect, useState } from "react";
import { InjuryReportContent } from "./(components)/injury-report/injuryReportContent";
import { useCurrentView } from "@/app/context/CurrentViewContext";
import ReviewYourDay from "./(components)/reviewYourDay/reviewYourDay";
import { Bases } from "@/components/(reusable)/bases";
import { LaborClockOut } from "./(components)/clock-out-Verification/laborClockOut";
import { PreInjuryReport } from "./(components)/no-injury";
import Comment from "./(components)/comment";
import { useTimeSheetData } from "@/app/context/TimeSheetIdContext";
import { usePermissions } from "@/app/context/PermissionsContext";
import { get } from "lodash";

type crewUsers = {
  id: string;
  firstName: string;
  lastName: string;
  clockedIn: boolean;
};

type TimesheetFilter =
  | "timesheetHighlights"
  | "truckingMileage"
  | "truckingEquipmentHaulLogs"
  | "truckingMaterialHaulLogs"
  | "truckingRefuelLogs"
  | "truckingStateLogs"
  | "tascoHaulLogs"
  | "tascoRefuelLogs"
  | "equipmentLogs"
  | "equipmentRefuelLogs"
  | "mechanicLogs";

export type TimeSheet = {
  submitDate: string;
  date: Date | string;
  id: string;
  userId: string;
  jobsiteId: string;
  costcode: string;
  startTime: string;
  endTime: string | null;
  workType: string;
  status: string; // Added status for filtering
  Jobsite: {
    name: string;
  };
  TascoLogs: {
    laborType: string;
    shiftType: string;
  }[];
};

interface ClockOutContentProps {
  userId: string;
  permission: string;
  clockOutComment: string;
}

export default function TempClockOutContent({
  userId,
  permission,
  clockOutComment,
}: ClockOutContentProps) {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // Using setStep instead of incrementStep
  const [path, setPath] = useState("clockOut");
  const [checked, setChecked] = useState(false);
  const [base64String, setBase64String] = useState<string>("");
  const { currentView } = useCurrentView();
  const [commentsValue, setCommentsValue] = useState(clockOutComment || "");
  const [timesheets, setTimesheets] = useState<TimeSheet[]>([]);
  // Removed reviewYourTeam state, not needed for manager flow
  const [pendingTimeSheets, setPendingTimeSheets] = useState<TimeSheet>();
  const [editFilter, setEditFilter] = useState<TimesheetFilter | null>(null);
  const [editDate, setEditDate] = useState<string>("");
  const [focusIds, setFocusIds] = useState<string[]>([]);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [teamUsers, setTeamUsers] = useState<crewUsers[]>([]);
  const [wasInjured, setWasInjured] = useState<boolean>(false);
  // const [currentTimesheetId, setCurrentTimesheetId] = useState<number>();
  const { savedTimeSheetData, refetchTimesheet } = useTimeSheetData();
  const { requestLocationPermission } = usePermissions();

  const incrementStep = () => {
    setStep((prevStep) => prevStep + 1); // Increment function
  };

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1); // Increment function
  };

  useEffect(() => {
    setCommentsValue(clockOutComment || "");
  }, [clockOutComment]);

  // on mount, request location permission and get stored coordinates
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Batch fetch all clock-out details (timesheets, comment, signature)
  useEffect(() => {
    const fetchClockoutDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/clockoutDetails");
        const data = await response.json();
        setTimesheets(data.timesheets || []);
        setBase64String(data.signature || "");
        // Set the most recent active timesheet (endTime === null)
        const activeTimeSheet = (data.timesheets || [])
          .filter((timesheet: TimeSheet) => timesheet.endTime === null)
          .sort(
            (a: TimeSheet, b: TimeSheet) =>
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
          )[0];
        setPendingTimeSheets(activeTimeSheet || null);
      } catch (error) {
        console.error("Error fetching clock-out details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClockoutDetails();
  }, [currentView]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/getMyTeamsUsers");
        const data = await response.json();
        setTeamUsers(data);
        // No need to set reviewYourTeam, managers always see ReviewYourTeam
      } catch (error) {
        console.error("Error fetching timesheets:", error);
      }
    };
    fetchTeamMembers();
  }, []);

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.currentTarget.checked);
  };

  const handleNextStepAndSubmit = async () => {
    if (!checked) {
      setPath("Injury");
      incrementStep();
    } else if (checked && currentView === "truck") {
      setPath("truck");
      incrementStep();
    } else {
      setPath("clockOut");
      incrementStep();
    }
  };

  const handleNextStep = async () => {
    if (currentView === "truck") {
      setPath("truck");
    }
    incrementStep();
  };

  const handleSubmitInjury = async () => {
    setPath("clockOut");
  };

  // step 0  is the comment step for clocking out
  if (step === 0) {
    return (
      <Comment
        handleClick={() => setStep(1)}
        clockInRole={""}
        setCommentsValue={setCommentsValue}
        commentsValue={commentsValue}
        checked={checked}
        handleCheckboxChange={handleCheckboxChange}
        loading={loading}
        setLoading={setLoading}
        currentTimesheetId={savedTimeSheetData?.id}
      />
    );
  }

  if (step === 1) {
    return (
      <ReviewYourDay
        handleClick={handleNextStep}
        prevStep={prevStep}
        loading={loading}
        timesheets={timesheets}
        setReviewYourTeam={() => {}}
        currentTimesheetId={savedTimeSheetData?.id}
      />
    );
  }

  if (step === 2) {
    // PreInjuryReport for both managers and non-managers after review step
    return (
      <PreInjuryReport
        handleCheckboxChange={handleCheckboxChange}
        checked={checked}
        loading={loading}
        base64String={base64String}
        handleNextStepAndSubmit={handleNextStepAndSubmit}
        prevStep={prevStep}
      />
    );
  } else if (step === 3 && path === "Injury") {
    // Injury Report step
    return (
      <InjuryReportContent
        base64String={base64String}
        handleNextStep={handleSubmitInjury}
        prevStep={prevStep}
        setWasInjured={setWasInjured}
      />
    );
  } else if (step === 3 && path !== "Injury") {
    // Final Clock-Out step
    return (
      <LaborClockOut
        prevStep={prevStep}
        commentsValue={commentsValue}
        pendingTimeSheets={pendingTimeSheets}
        wasInjured={wasInjured}
        timeSheetId={savedTimeSheetData?.id}
        refetchTimesheet={refetchTimesheet}
      />
    );
  } else {
    return null;
  }
}
