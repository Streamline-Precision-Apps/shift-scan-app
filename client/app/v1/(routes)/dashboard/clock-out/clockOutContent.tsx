// "use client";
// import { Contents } from "@/components/(reusable)/contents";
// import { Holds } from "@/components/(reusable)/holds";
// import { ChangeEvent, useEffect, useState } from "react";
// import { InjuryReportContent } from "./(components)/injury-report/injuryReportContent";
// import { useCurrentView } from "@/app/context/CurrentViewContext";
// import ReviewYourDay from "./(components)/reviewYourDay/reviewYourDay";
// import { Bases } from "@/components/(reusable)/bases";
// import { LaborClockOut } from "./(components)/clock-out-Verification/laborClockOut";
// import { PreInjuryReport } from "./(components)/no-injury";
// import Comment from "./(components)/comment";
// import ReviewYourTeam from "./(components)/reviewYourTeam";
// import EditTeamTimeSheet from "./(components)/editTeamTimeSheet";

// type TimesheetFilter =
//   | "timesheetHighlights"
//   | "truckingMileage"
//   | "truckingEquipmentHaulLogs"
//   | "truckingMaterialHaulLogs"
//   | "truckingRefuelLogs"
//   | "truckingStateLogs"
//   | "tascoHaulLogs"
//   | "tascoRefuelLogs"
//   | "equipmentLogs"
//   | "equipmentRefuelLogs"
//   | "mechanicLogs";

// type crewUsers = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   clockedIn: boolean;
// };

// export type TimeSheet = {
//   submitDate: string;
//   date: Date | string;
//   id: string;
//   userId: string;
//   jobsiteId: string;
//   costcode: string;
//   startTime: string;
//   endTime: string | null;
//   workType: string;
//   status: string; // Added status for filtering
//   Jobsite: {
//     name: string;
//   };
//   TascoLogs: {
//     laborType: string;
//     shiftType: string;
//   }[];
// };

// interface ClockOutContentProps {
//   userId: string;
//   permission: string;
// }

// export default function ClockOutContent({
//   userId,
//   permission,
// }: ClockOutContentProps) {
//   const [loading, setLoading] = useState(true);
//   const [step, setStep] = useState(0); // Using setStep instead of incrementStep
//   const [path, setPath] = useState("ClockOut");
//   const [checked, setChecked] = useState(false);
//   const [base64String, setBase64String] = useState<string>("");
//   const { currentView } = useCurrentView();
//   const [commentsValue, setCommentsValue] = useState("");
//   const [timesheets, setTimesheets] = useState<TimeSheet[]>([]);
//   // Removed reviewYourTeam state, not needed for manager flow
//   const [pendingTimeSheets, setPendingTimeSheets] = useState<TimeSheet>();
//   const [editFilter, setEditFilter] = useState<TimesheetFilter | null>(null);
//   const [editDate, setEditDate] = useState<string>("");
//   const [focusIds, setFocusIds] = useState<string[]>([]);
//   const [employeeId, setEmployeeId] = useState<string>("");
//   const [teamUsers, setTeamUsers] = useState<crewUsers[]>([]);
//   const [wasInjured, setWasInjured] = useState<boolean>(false);
//   const [currentTimesheetId, setCurrentTimesheetId] = useState<number>();

//   const incrementStep = () => {
//     setStep((prevStep) => prevStep + 1); // Increment function
//   };

//   const prevStep = () => {
//     setStep((prevStep) => prevStep - 1); // Increment function
//   };

//   useEffect(() => {
//     const getRecentTimeCard = async () => {
//       try {
//         const response = await fetch("/api/getRecentTimecard");
//         const data = await response.json();
//         setCurrentTimesheetId(data.id);
//       } catch (error) {
//         console.error("Error fetching recent time card:", error);
//       }
//     };
//     getRecentTimeCard();
//   }, []);

//   // Batch fetch all clock-out details (timesheets, comment, signature)
//   useEffect(() => {
//     const fetchClockoutDetails = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch("/api/clockoutDetails");
//         const data = await response.json();
//         setTimesheets(data.timesheets || []);
//         setCommentsValue(data.comment || "");
//         setBase64String(data.signature || "");
//         // Set the most recent active timesheet (endTime === null)
//         const activeTimeSheet = (data.timesheets || [])
//           .filter((timesheet: TimeSheet) => timesheet.endTime === null)
//           .sort(
//             (a: TimeSheet, b: TimeSheet) =>
//               new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
//           )[0];
//         setPendingTimeSheets(activeTimeSheet || null);
//       } catch (error) {
//         console.error("Error fetching clock-out details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchClockoutDetails();
//   }, [currentView]);

//   useEffect(() => {
//     const fetchTeamMembers = async () => {
//       try {
//         const response = await fetch("/api/getMyTeamsUsers");
//         const data = await response.json();
//         setTeamUsers(data);
//         // No need to set reviewYourTeam, managers always see ReviewYourTeam
//       } catch (error) {
//         console.error("Error fetching timesheets:", error);
//       }
//     };
//     fetchTeamMembers();
//   }, []);

//   const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
//     setChecked(event.currentTarget.checked);
//   };

//   const handleNextStepAndSubmit = async () => {
//     if (!checked) {
//       setPath("Injury");
//       incrementStep();
//     } else if (checked && currentView === "truck") {
//       setPath("truck");
//       incrementStep();
//     } else {
//       setPath("clockOut");
//       incrementStep();
//     }
//   };

//   const handleNextStep = async () => {
//     if (currentView === "truck") {
//       setPath("truck");
//     }
//     incrementStep();
//   };

//   const handleSubmitInjury = async () => {
//     setPath("clockOut");
//   };

//   // step 0  is the comment step for clocking out
//   if (step === 0) {
//     return (
//       <Bases>
//         <Contents>
//           <Holds
//             background={"white"}
//             className="h-full border-[3px] border-red-500"
//           >
//             <Comment
//               handleClick={() => setStep(1)}
//               clockInRole={""}
//               setCommentsValue={setCommentsValue}
//               commentsValue={commentsValue}
//               checked={checked}
//               handleCheckboxChange={handleCheckboxChange}
//               setLoading={setLoading}
//               loading={loading}
//             />
//           </Holds>
//         </Contents>
//       </Bases>
//     );
//   }
//   // Step 1: Review Step - Show ReviewYourTeam if manager, else ReviewYourDay
//   if (step === 1) {
//     // Show ReviewYourTeam if user has team members, else ReviewYourDay
//     if (teamUsers && teamUsers.length > 0) {
//       // Filter timesheets for DRAFT or PENDING with no endTime
//       const reviewableTimesheets = timesheets.filter(
//         (ts) =>
//           ts.endTime === null &&
//           (ts.status === "DRAFT" || ts.status === "PENDING"),
//       );
//       // Optionally, you can use reviewableTimesheets for debugging or future logic
//       return (
//         <ReviewYourTeam
//           handleClick={handleNextStep}
//           prevStep={prevStep}
//           loading={loading}
//           manager={userId}
//           setEditDate={setEditDate}
//           editFilter={editFilter}
//           setEditFilter={setEditFilter}
//           focusIds={focusIds}
//           setFocusIds={setFocusIds}
//           setEmployeeId={setEmployeeId}
//           crewMembers={teamUsers}
//         />
//       );
//     } else {
//       return (
//         <ReviewYourDay
//           handleClick={handleNextStep}
//           prevStep={prevStep}
//           loading={loading}
//           timesheets={timesheets}
//           setReviewYourTeam={() => {}}
//           currentTimesheetId={currentTimesheetId}
//         />
//       );
//     }
//   }

//   if (step === 2 && editFilter !== null) {
//     return (
//       <EditTeamTimeSheet
//         prevStep={prevStep}
//         employeeId={employeeId}
//         editFilter={editFilter}
//         focusIds={focusIds}
//         setFocusIds={setFocusIds}
//       />
//     );
//   } else if (
//     (step === 2 && editFilter === null) ||
//     (step === 1 && teamUsers && teamUsers.length > 0 && editFilter === null)
//   ) {
//     // PreInjuryReport for both managers and non-managers after review step
//     return (
//       <PreInjuryReport
//         handleCheckboxChange={handleCheckboxChange}
//         checked={checked}
//         loading={loading}
//         base64String={base64String}
//         handleNextStepAndSubmit={handleNextStepAndSubmit}
//         prevStep={prevStep}
//       />
//     );
//   } else if (
//     (step === 2 && path === "Injury") ||
//     (step === 3 && path === "Injury")
//   ) {
//     // Injury Report step
//     return (
//       <InjuryReportContent
//         base64String={base64String}
//         handleNextStep={handleSubmitInjury}
//         prevStep={prevStep}
//         setWasInjured={setWasInjured} // Pass setWasInjured to handle state
//       />
//     );
//   } else if (
//     (step === 2 && path === "clockOut") ||
//     (step === 3 && path === "clockOut")
//   ) {
//     // Final Clock-Out step
//     return (
//       <LaborClockOut
//         prevStep={prevStep}
//         commentsValue={commentsValue}
//         pendingTimeSheets={pendingTimeSheets}
//         wasInjured={wasInjured}
//         timeSheetId={currentTimesheetId}
//       />
//     );
//   } else {
//     return null;
//   }
// }
