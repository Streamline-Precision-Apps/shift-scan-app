// "use client";
// import React, { useState, useEffect, useCallback } from "react";
// import { Holds } from "@/components/(reusable)/holds";
// import { Inputs } from "@/components/(reusable)/inputs";
// import { Images } from "@/components/(reusable)/images";
// import { Grids } from "@/components/(reusable)/grids";
// import { TimesheetHighlights } from "@/lib/types";
// import { Texts } from "@/components/(reusable)/texts";
// import { Buttons } from "@/components/(reusable)/buttons";
// import { Titles } from "@/components/(reusable)/titles";
// import { NModals } from "@/components/(reusable)/newmodals";
// import { useTranslations } from "next-intl";
// import { JobsiteSelector } from "@/components/(clock)/(General)/jobsiteSelector";
// import { CostCodeSelector } from "@/components/(clock)/(General)/costCodeSelector";
// import { toZonedTime } from "date-fns-tz";

// interface TimeCardHighlightsProps {
//   highlightTimesheet: TimesheetHighlights[];
//   edit: boolean;
//   manager: string;
//   onDataChange: (data: TimesheetHighlights[]) => void;
//   date: string;
//   focusIds?: string[];
//   setFocusIds?: (ids: string[]) => void;
//   isReviewYourTeam?: boolean;
// }

// export default function TimeCardHighlights({
//   highlightTimesheet,
//   edit,
//   manager,
//   onDataChange,
//   date,
//   focusIds,
//   setFocusIds,
//   isReviewYourTeam,
// }: TimeCardHighlightsProps) {
//   const [jobsiteModalOpen, setJobsiteModalOpen] = useState(false);
//   const [costCodeModalOpen, setCostCodeModalOpen] = useState(false);
//   const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
//   const t = useTranslations("Clock");

//   // Add state to store local input values to prevent losing focus while typing
//   const [inputValues, setInputValues] = useState<
//     Record<string, string | number | null>
//   >({});

//   // Create a unique key for each input field
//   const getInputKey = (id: string, fieldName: string) => {
//     return `${id}-${fieldName}`;
//   };

//   // Get the current value from local state or use the original value
//   const getDisplayValue = (
//     id: string,
//     fieldName: string,
//     originalValue: string | number | null,
//   ) => {
//     const key = getInputKey(id, fieldName);
//     return key in inputValues ? inputValues[key] : originalValue;
//   };

//   // Update local state without triggering parent update (and thus avoiding re-render)
//   const handleLocalChange = (
//     id: string,
//     fieldName: string,
//     value: string | number | null,
//   ) => {
//     setInputValues((prev) => ({
//       ...prev,
//       [getInputKey(id, fieldName)]: value,
//     }));
//   };

//   // Update parent state only when field loses focus (onBlur)
//   const handleBlur = (
//     id: string,
//     field: "startTime" | "endTime",
//     timeString: string,
//   ) => {
//     const key = getInputKey(id, field);

//     if (key in inputValues) {
//       const value = inputValues[key];
//       handleTimeChange(id, field, value as string);

//       // Clear from local state to avoid duplicate processing
//       setInputValues((prev) => {
//         const newState = { ...prev };
//         delete newState[key];
//         return newState;
//       });
//     }
//   };

//   const isEmptyData = !highlightTimesheet || highlightTimesheet.length === 0;
//   const handleTimeChange = useCallback(
//     (id: string, field: "startTime" | "endTime", timeString: string) => {
//       const updated = highlightTimesheet.map((item) => {
//         if (item.id === id) {
//           let newValue = null;

//           if (timeString) {
//             try {
//               // Extract time components
//               const [hours, minutes] = timeString
//                 .split(":")
//                 .map((part) => parseInt(part, 10));

//               // Create a new date using the original date components but with new time
//               let baseDate;

//               // Try to use the existing date if possible
//               if (item[field] && item[field] instanceof Date) {
//                 baseDate = new Date(item[field]);
//               } else if (item[field] && typeof item[field] === "string") {
//                 baseDate = new Date(item[field]);
//               } else {
//                 // Fallback to the component's date prop
//                 baseDate = new Date(date);
//               }

//               // Ensure we have a valid base date
//               if (isNaN(baseDate.getTime())) {
//                 console.warn("Invalid base date, using current date");
//                 baseDate = new Date(); // Last resort fallback
//               }

//               // Create a completely new date object to avoid reference issues
//               const newDate = new Date(baseDate);

//               // Set only the time portion, keeping the date intact
//               newDate.setHours(hours || 0);
//               newDate.setMinutes(minutes || 0);
//               newDate.setSeconds(0);
//               newDate.setMilliseconds(0);

//               // Validate final date
//               if (!isNaN(newDate.getTime())) {
//                 newValue = newDate;
//               } else {
//                 console.warn(`Failed to create valid date from: ${timeString}`);
//                 newValue = item[field]; // Fallback to existing value
//               }
//             } catch (error) {
//               console.error(
//                 `Error processing time value: ${timeString}`,
//                 error,
//               );
//               newValue = item[field]; // Keep existing value
//             }
//           }

//           return { ...item, [field]: newValue };
//         }
//         return item;
//       });
//       onDataChange(updated);
//     },
//     [date, onDataChange, highlightTimesheet],
//   );
//   const handleJobsiteChange = useCallback(
//     (id: string, jobsiteId: string, jobsiteName?: string) => {
//       // Use the provided jobsiteId directly - it comes from the selector
//       // and should be the database ID (primary key), not the qrId
//       const updatedData = highlightTimesheet.map((item) => {
//         if (item.id === id) {
//           return {
//             ...item,
//             jobsiteId, // Use the database ID
//             Jobsite: { ...(item.Jobsite || {}), name: jobsiteName || "" },
//           };
//         }
//         return item;
//       });

//

//       onDataChange(updatedData);
//     },
//     [highlightTimesheet, onDataChange],
//   );

//   const handleCostCodeChange = useCallback(
//     (id: string, costcode: string) => {
//       const updatedData = highlightTimesheet.map((item) => {
//         if (item.id === id) {
//           return {
//             ...item,
//             costcode,
//           };
//         }
//         return item;
//       });
//       onDataChange(updatedData);
//     },
//     [highlightTimesheet, onDataChange],
//   );
//   const formatTimeForInput = useCallback(
//     (date: Date | string | null | undefined): string => {
//       if (!date) return "";

//       // Handle special string cases that aren't dates
//       if (date === "N/A") return "";

//       try {
//         // Safely handle the date value
//         let dateObj: Date;

//         if (date instanceof Date) {
//           dateObj = date;
//         } else if (typeof date === "string") {
//           // Skip processing if the string is not a valid date format
//           if (/^[a-zA-Z\/]+$/.test(date)) {
//             return "";
//           }
//           dateObj = new Date(date);
//         } else {
//           return "";
//         }

//         // Validate the date is valid before attempting to format
//         if (isNaN(dateObj.getTime())) {
//           // Only log warnings for values that should be dates but aren't
//           if (date !== "N/A" && date !== "") {
//             console.warn("Invalid date value:", date);
//           }
//           return "";
//         }

//         // Format using local timezone
//         const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//         const zoned = toZonedTime(dateObj, timeZone);
//         const hours = zoned.getHours().toString().padStart(2, "0");
//         const minutes = zoned.getMinutes().toString().padStart(2, "0");
//         return `${hours}:${minutes}`;
//       } catch (error) {
//         console.error("Error formatting time:", error);
//         return "";
//       }
//     },
//     [],
//   ); // Helper to format time for display in local timezone (HH:mm)
//   const formatTimeLocal = useCallback(
//     (date: Date | string | null | undefined): string => {
//       if (!date) return "";

//       // Handle special string cases that aren't dates
//       if (date === "N/A") return "";

//       try {
//         // Safely handle the date value
//         let dateObj: Date;

//         if (date instanceof Date) {
//           dateObj = date;
//         } else if (typeof date === "string") {
//           // Skip processing if the string is not a valid date format
//           if (/^[a-zA-Z\/]+$/.test(date)) {
//             return "";
//           }
//           dateObj = new Date(date);
//         } else {
//           return "";
//         }

//         // Check if date is valid before formatting
//         if (isNaN(dateObj.getTime())) {
//           // Only log warnings for values that should be dates but aren't
//           if (date !== "N/A" && date !== "") {
//             console.warn("Invalid date value for local formatting:", date);
//           }
//           return "";
//         }

//         return dateObj.toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//       } catch (error) {
//         console.error("Error formatting local time:", error);
//         return "";
//       }
//     },
//     [],
//   );

//   const openJobsiteModal = (id: string) => {
//     if (!edit) return;
//     setCurrentEditingId(id);
//     setJobsiteModalOpen(true);
//   };

//   const openCostCodeModal = (id: string) => {
//     if (!edit) return;
//     setCurrentEditingId(id);
//     setCostCodeModalOpen(true);
//   };
//   const handleJobsiteSelect = (
//     jobsite: { id: string; code: string; label: string } | null,
//   ) => {
//     if (currentEditingId && jobsite) {
//       // Use the actual id (database primary key) instead of code (qrId)
//

//       // Pass the database ID instead of the qrId (code)
//       handleJobsiteChange(currentEditingId, jobsite.id, jobsite.label);
//     }
//     setJobsiteModalOpen(false);
//   };
//   const handleCostCodeSelect = (
//     costcode: { id: string; code: string; label: string } | null,
//   ) => {
//     if (currentEditingId && costcode) {
//       // For cost codes, continue using the code property as before
//       handleCostCodeChange(currentEditingId, costcode.code);
//     }
//     setCostCodeModalOpen(false);
//   };
//   // Add debugging function to log date values
//   const debugLogDate = useCallback(
//     (context: string, dateValue: Date | string | number | null | undefined) => {
//       if (!dateValue) {
//
//         return;
//       }

//       try {
//         if (dateValue instanceof Date) {
//
//         } else if (typeof dateValue === "string") {
//           const parsed = new Date(dateValue);
//
//         } else {
//
//         }
//       } catch (error) {
//         console.error(`${context}: Error logging date:`, error);
//       }
//     },
//     [],
//   );

//   return (
//     <Holds className="w-full h-full">
//       <Grids rows={"7"}>
//         <Holds className="row-start-1 row-end-8 overflow-y-scroll no-scrollbar h-full w-full">
//           {isEmptyData ? (
//             <Holds className="w-full h-full flex items-center justify-center">
//               <Texts size="p6" className="text-gray-500 italic">
//                 {t("NoDataFoundForCurrentDate")}
//               </Texts>
//             </Holds>
//           ) : (
//             <>
//               {" "}
//               <Grids cols={"7"} className="w-full h-fit">
//                 <Holds className="col-start-2 col-end-4 w-full h-full pl-1">
//                   <Titles position={"left"} size={"h6"}>
//                     {t("StartEnd")}
//                   </Titles>
//                 </Holds>
//                 <Holds className="col-start-4 col-end-8 w-full h-full pr-1">
//                   <Titles position={"right"} size={"h6"}>
//                     {t("JobsiteCostCode")}
//                   </Titles>
//                 </Holds>{" "}
//               </Grids>{" "}
//               {highlightTimesheet
//                 .filter((sheet) => {
//                   // Only show if endTime is a valid Date
//                   if (!sheet.endTime) return false;
//                   const dateObj =
//                     sheet.endTime instanceof Date
//                       ? sheet.endTime
//                       : new Date(sheet.endTime);
//                   return !isNaN(dateObj.getTime());
//                 })
//                 .map((sheet) => {
//                   // Ensure focusIds exists and is an array before using includes
//                   const isFocused =
//                     Array.isArray(focusIds) && focusIds.includes(sheet.id);
//                   const handleToggleFocus = () => {
//                     if (
//                       !isReviewYourTeam ||
//                       !setFocusIds ||
//                       !Array.isArray(focusIds)
//                     )
//                       return;
//                     if (isFocused) {
//                       setFocusIds(focusIds.filter((id) => id !== sheet.id));
//                     } else {
//                       setFocusIds([...focusIds, sheet.id]);
//                     }
//                   };
//                   const rowContent = (
//                     <>
//                       {" "}
//                       <Holds
//                         background={isFocused ? "orange" : "white"}
//                         className={`relative border-black border-[3px] rounded-[10px] mb-3
//                         ${isReviewYourTeam ? "cursor-pointer" : ""}`}
//                         onClick={(e) => {
//                           if (!isReviewYourTeam) {
//                             return;
//                           }
//                           // Stop propagation to prevent parent handlers from triggering
//                           e.stopPropagation();

//                           handleToggleFocus();
//                         }}
//                         // Add data attributes to help debug in browser
//                         data-review-mode={isReviewYourTeam ? "true" : "false"}
//                         data-row-id={sheet.id}
//                         data-focused={isFocused ? "true" : "false"}
//                       >
//                         {/* Add an explicit overlay div for click handling that's always on top */}
//                         {isReviewYourTeam && (
//                           <div
//                             className="absolute top-0 left-0 w-full h-full z-50 cursor-pointer"
//                             onClick={(e) => {
//                               e.preventDefault();
//                               e.stopPropagation();
//                               handleToggleFocus();
//                             }}
//                           />
//                         )}
//                         <Buttons
//                           shadow={"none"}
//                           background={"none"}
//                           className="w-full h-full text-left"
//                           // Completely remove this onClick as it might interfere// Prevent button from capturing clicks in review mode
//                         >
//                           {sheet.startTime && sheet.endTime ? (
//                             <Grids cols={"8"} className="w-full h-full">
//                               <Holds className="col-start-1 col-end-2 p-2">
//                                 <Images
//                                   titleImg={
//                                     sheet.workType === "TASCO"
//                                       ? "/tasco.svg"
//                                       : sheet.workType === "TRUCK_DRIVER"
//                                         ? "/trucking.svg"
//                                         : sheet.workType === "MECHANIC"
//                                           ? "/mechanic.svg"
//                                           : sheet.workType === "LABOR"
//                                             ? "/equipment.svg"
//                                             : "null"
//                                   }
//                                   titleImgAlt={`${sheet.workType} Icon`}
//                                   className="m-auto w-8 h-8"
//                                 />
//                               </Holds>
//                               <Holds className="col-start-2 col-end-5 border-x-[3px] border-black h-full">
//                                 {" "}
//                                 <Holds className="h-full justify-center border-b-[1.5px] border-black">
//                                   {" "}
//                                   <Inputs
//                                     type="time"
//                                     value={formatTimeForInput(sheet.startTime)}
//                                     onChange={(e) =>
//                                       handleLocalChange(
//                                         sheet.id,
//                                         "startTime",
//                                         e.target.value,
//                                       )
//                                     }
//                                     onBlur={(e) =>
//                                       handleBlur(
//                                         sheet.id,
//                                         "startTime",
//                                         e.target.value,
//                                       )
//                                     }
//                                     className="text-xs border-none h-full rounded-none justify-center text-center px-1 w-full"
//                                     background={isFocused ? "orange" : "white"}
//                                     disabled={!edit}
//                                   />
//                                 </Holds>{" "}
//                                 <Holds className="h-full w-full justify-center border-t-[1.5px] border-black">
//                                   {" "}
//                                   <Inputs
//                                     type="time"
//                                     value={formatTimeForInput(sheet.endTime)}
//                                     onChange={(e) =>
//                                       handleLocalChange(
//                                         sheet.id,
//                                         "endTime",
//                                         e.target.value,
//                                       )
//                                     }
//                                     onBlur={(e) =>
//                                       handleBlur(
//                                         sheet.id,
//                                         "endTime",
//                                         e.target.value,
//                                       )
//                                     }
//                                     className="text-xs border-none h-full rounded-none justify-center text-center px-1 w-full"
//                                     background={isFocused ? "orange" : "white"}
//                                     disabled={!edit}
//                                   />
//                                 </Holds>
//                               </Holds>
//                               <Holds className="col-start-5 col-end-9 h-full">
//                                 <Holds className="border-b-[1.5px] border-black h-full justify-center">
//                                   {" "}
//                                   <Inputs
//                                     type={"text"}
//                                     value={sheet.Jobsite?.name || "N/A"}
//                                     className="text-xs border-none h-full rounded-b-none rounded-l-none rounded-br-none justify-center text-right"
//                                     onClick={() => openJobsiteModal(sheet.id)}
//                                     background={isFocused ? "orange" : "white"}
//                                     disabled={!edit}
//                                     readOnly
//                                   />
//                                 </Holds>{" "}
//                                 <Holds className="h-full justify-center text-right border-t-[1.5px] border-black">
//                                   <Inputs
//                                     type={"text"}
//                                     value={sheet.costcode || "N/A"}
//                                     className="text-xs border-none h-full rounded-t-none rounded-bl-none justify-center text-right"
//                                     onClick={() => openCostCodeModal(sheet.id)}
//                                     background={isFocused ? "orange" : "white"}
//                                     disabled={!edit}
//                                     readOnly
//                                   />
//                                 </Holds>
//                               </Holds>
//                             </Grids>
//                           ) : (
//                             <Texts size="p6" className="text-gray-500 italic">
//                               {t("IncompleteTimesheetData")}
//                             </Texts>
//                           )}
//                         </Buttons>
//                       </Holds>
//                     </>
//                   );
//                   // Always use a keyed fragment for the row
//                   return (
//                     <React.Fragment key={sheet.id}>{rowContent}</React.Fragment>
//                   );
//                 })}
//             </>
//           )}
//         </Holds>
//       </Grids>

//       <NModals
//         background={"white"}
//         size={"xlW"}
//         isOpen={jobsiteModalOpen}
//         handleClose={() => setJobsiteModalOpen(false)}
//       >
//         <Holds background={"white"} className="w-full h-full p-2">
//           <JobsiteSelector
//             onJobsiteSelect={handleJobsiteSelect}
//             initialValue={
//               currentEditingId
//                 ? {
//                     id:
//                       highlightTimesheet.find(
//                         (item: TimesheetHighlights) =>
//                           item.id === currentEditingId,
//                       )?.id || "",

//                     code:
//                       highlightTimesheet.find(
//                         (item: TimesheetHighlights) =>
//                           item.id === currentEditingId,
//                       )?.jobsiteId || "",
//                     label:
//                       highlightTimesheet.find(
//                         (item: TimesheetHighlights) =>
//                           item.id === currentEditingId,
//                       )?.Jobsite?.name || "",
//                   }
//                 : undefined
//             }
//           />
//         </Holds>
//       </NModals>

//       <NModals
//         background={"white"}
//         size={"xlW"}
//         isOpen={costCodeModalOpen}
//         handleClose={() => setCostCodeModalOpen(false)}
//       >
//         <Holds background={"white"} className="w-full h-full p-2">
//           <CostCodeSelector
//             onCostCodeSelect={handleCostCodeSelect}
//             initialValue={
//               currentEditingId
//                 ? {
//                     id:
//                       highlightTimesheet.find(
//                         (item: TimesheetHighlights) =>
//                           item.id === currentEditingId,
//                       )?.id || "",
//                     code:
//                       highlightTimesheet.find(
//                         (item: TimesheetHighlights) =>
//                           item.id === currentEditingId,
//                       )?.costcode || "",
//                     label:
//                       highlightTimesheet.find(
//                         (item: TimesheetHighlights) =>
//                           item.id === currentEditingId,
//                       )?.costcode || "",
//                   }
//                 : undefined
//             }
//           />
//         </Holds>
//       </NModals>
//     </Holds>
//   );
// }
