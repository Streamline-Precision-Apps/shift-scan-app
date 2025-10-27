import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef, useMemo } from "react";
import TimeSheetRenderer from "@/app/(routes)/dashboard/myTeam/[id]/employee/[employeeId]/_components/timeSheetRenderer";
import { approvePendingTimesheets } from "@/actions/timeSheetActions";
import { Buttons } from "@/components/(reusable)/buttons";
import { Texts } from "@/components/(reusable)/texts";
import TinderSwipe, {
  TinderSwipeRef,
} from "@/components/(animations)/tinderSwipe";
import ReviewTabOptions from "./ReviewTabOptions";
import { useAllEquipment } from "@/hooks/useAllEquipment";
import {
  FormStatus,
  WorkType,
} from "../../../../../../prisma/generated/prisma/client";

// import { useTimesheetData } from "@/hooks/(ManagerHooks)/useTimesheetData";

type TimesheetHighlights = {
  submitDate: string;
  date: Date | string;
  id: number;
  userId: string;
  jobsiteId: string;
  costcode: string;
  startTime: Date | string;
  endTime: Date | string | null;
  status: FormStatus; // Enum: PENDING, APPROVED, etc.
  workType: WorkType; // Enum: Type of work
  Jobsite: {
    name: string;
  };
};

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

const FILTER_OPTIONS: {
  value: TimesheetFilter | "trucking" | "tasco";
  label: string;
}[] = [
  { value: "timesheetHighlights", label: "Time Sheet Highlights" },
  { value: "trucking", label: "Trucking" },
  { value: "tasco", label: "TASCO" },
  { value: "equipmentLogs", label: "Equipment Logs" },
  { value: "mechanicLogs", label: "Mechanic Logs" },
];

const TRUCKING_TABS: { value: TimesheetFilter; label: string; icon: string }[] =
  [
    {
      value: "truckingEquipmentHaulLogs",
      label: "Equipment Hauls",
      icon: "/hauling.svg",
    },
    {
      value: "truckingMaterialHaulLogs",
      label: "Material Hauls",
      icon: "/form.svg",
    },
    { value: "truckingRefuelLogs", label: "Refuel Logs", icon: "/refuel.svg" },
    { value: "truckingStateLogs", label: "State Logs", icon: "/state.svg" },
  ];
const TASCO_TABS: { value: TimesheetFilter; label: string; icon: string }[] = [
  { value: "tascoHaulLogs", label: "Haul Logs", icon: "/hauling.svg" },
  { value: "tascoRefuelLogs", label: "Refuel Logs", icon: "/refuel.svg" },
];

interface ReviewYourTeamProps {
  handleClick: () => void;
  prevStep: () => void;
  loading: boolean;
  manager: string; // should be string, not boolean
  setEditDate: (date: string) => void;
  editFilter: TimesheetFilter | null;
  setEditFilter: (filter: TimesheetFilter | null) => void;
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  setEmployeeId: (id: string) => void;
  crewMembers?: crewUsers[];
}

const ReviewYourTeam: React.FC<ReviewYourTeamProps> = ({
  handleClick,
  prevStep,
  loading,
  manager,
  setEditDate,
  editFilter,
  setEditFilter,
  focusIds,
  setFocusIds,
  setEmployeeId,
  crewMembers = [],
}) => {
  // Ensure manager is always first in the review list, and not duplicated
  const [managerUser, setManagerUser] = useState<crewUsers | null>(null);
  useEffect(() => {
    // Try to find the manager in the crewMembers list by matching id or name
    let found: crewUsers | undefined = undefined;
    if (crewMembers && crewMembers.length > 0) {
      found = crewMembers.find(
        (u) => u.id === manager || `${u.firstName} ${u.lastName}` === manager,
      );
    }
    if (found) {
      setManagerUser(found);
    } else {
      // If not found, create a minimal manager user object (must match crewUsers type)
      setManagerUser({
        id: manager,
        firstName: "Manager",
        lastName: "",
        clockedIn: false,
      } as crewUsers);
    }
  }, [crewMembers, manager]);

  // Remove manager from crewMembers if present, to avoid duplicate
  const filteredTeam = crewMembers.filter(
    (u) => u.id !== manager && `${u.firstName} ${u.lastName}` !== manager,
  );
  const t = useTranslations("Clock");
  const tinderSwipeRef = useRef<TinderSwipeRef>(null);
  const [pendingTimesheets, setPendingTimesheets] = useState<
    Record<string, TimesheetHighlights[]>
  >({});
  const [dataLoaded, setDataLoaded] = useState(false); // Track when data is loaded
  const [focusIndex, setFocusIndex] = useState(0);
  const [filter, setFilter] = useState<
    | "timesheetHighlights"
    | "trucking"
    | "tasco"
    | "equipmentLogs"
    | "mechanicLogs"
  >("timesheetHighlights");
  const [truckingTab, setTruckingTab] = useState<TimesheetFilter>(
    "truckingEquipmentHaulLogs",
  );
  const [tascoTab, setTascoTab] = useState<TimesheetFilter>("tascoHaulLogs");
  const tinderRef = useRef<TinderSwipeRef>(null);
  const allEquipment = useAllEquipment();

  // Track tab completion status
  const [tabsComplete, setTabsComplete] = useState({
    timesheetHighlights: true,
    equipmentLogs: true,
    truckingEquipmentHaulLogs: true,
    truckingMaterialHaulLogs: true,
    truckingRefuelLogs: true,
    truckingStateLogs: true,
    tascoHaulLogs: true,
    tascoRefuelLogs: true,
  });

  // Compose the review list: manager first, then team. Always include manager, even if no pending timesheets.
  const reviewList = [
    ...(managerUser ? [managerUser] : []),
    ...filteredTeam,
  ].filter(
    (member, idx, arr) => arr.findIndex((u) => u.id === member.id) === idx,
  );

  // Memoize the userIds array for stable dependency (as a string key)
  const userIds = useMemo(() => {
    return [
      ...(managerUser ? [managerUser.id] : []),
      ...filteredTeam.map((u) => u.id),
    ];
  }, [managerUser?.id, filteredTeam.map((u) => u.id).join(",")]);
  // Create a stable string key for dependency
  const userIdsKey = userIds.join(",");

  // Adjust focusIndex if needed
  useEffect(() => {
    if (focusIndex >= reviewList.length) {
      setFocusIndex(0);
    }
  }, [reviewList.length]);
  const focusUser = reviewList[focusIndex];
  // Fetch only the current user's pending timesheets when focusUser changes
  useEffect(() => {
    if (!focusUser) return;
    const fetchUserTimesheets = async () => {
      try {
        const res = await fetch(`/api/getPendingTeamTimesheets`);
        const data = await res.json();
        setPendingTimesheets({ [focusUser.id]: data });
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching timesheets:", error);
        setDataLoaded(true);
      }
    };
    fetchUserTimesheets();
  }, [focusUser?.id]);

  // Approve all pending timesheets for the focus user
  const handleApprove = async () => {
    if (!focusUser) return;
    const userTimesheets = pendingTimesheets[focusUser.id] || [];
    if (userTimesheets.length === 0) {
      // Move to next user
      if (focusIndex < reviewList.length - 1) {
        setFocusIndex(focusIndex + 1);
        setEmployeeId(reviewList[focusIndex + 1].id);
      } else {
        setEditFilter(null);
        handleClick();
      }
      return;
    }
    await approvePendingTimesheets(focusUser.id, manager);
    // Re-fetch pending timesheets after approval
    try {
      const res = await fetch(`/api/getPendingTeamTimesheets`);
      const data = await res.json();
      setPendingTimesheets(data);
      setDataLoaded(true);
    } catch (error) {
      console.error(
        "Error re-fetching pending timesheets after approve:",
        error,
      );
    }
    // Move to next user (if any)
    if (focusIndex < reviewList.length - 1) {
      setFocusIndex(focusIndex + 1);
      setEmployeeId(reviewList[focusIndex + 1].id);
    } else {
      setEditFilter(null);
      handleClick();
    }
  };

  // Edit button handler
  const handleEdit = () => {
    setEditDate(new Date().toISOString().slice(0, 10));
    setEditFilter(
      filter === "trucking"
        ? truckingTab
        : filter === "tasco"
          ? tascoTab
          : filter,
    );
    setEmployeeId(focusUser.id);
    handleClick();
  }; // Debug data flow - moved up with other hooks to avoid conditional hooks
  useEffect(() => {
    if (dataLoaded && !loading) {
      const userTimesheets = pendingTimesheets[focusUser?.id] || [];
      checkTabsCompletion(userTimesheets);
    }
  }, [dataLoaded, loading, pendingTimesheets, focusUser?.id]); // Calculate total hours from all timesheets with endTime
  const calculateTotalHours = (timesheets: TimesheetHighlights[]): number => {
    let totalMinutes = 0;

    timesheets.forEach((timesheet) => {
      if (timesheet.startTime && timesheet.endTime) {
        const startTime = new Date(timesheet.startTime);
        const endTime = new Date(timesheet.endTime as string);

        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          // Calculate time difference in minutes
          const diffMinutes =
            (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          totalMinutes += diffMinutes;
        }
      }
    });

    // Convert total minutes to hours (rounded to 1 decimal place)
    return Math.round((totalMinutes / 60) * 10) / 10;
  };

  // Add state for date (default to today)
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(today);

  // Determine the current filter to use for the hook
  const getCurrentTimesheetFilter = () => {
    if (filter === "trucking") return truckingTab;
    if (filter === "tasco") return tascoTab;
    return filter as TimesheetFilter;
  };

  // For review, use the bulk-fetched pendingTimesheets for the focus user
  const timesheetData = pendingTimesheets[focusUser?.id] || [];
  const timesheetLoading = loading; // Use parent loading state

  // Ensure API is called on tab click (immediate fetch)
  const handleTruckingTabChange = (tab: TimesheetFilter) => {
    setTruckingTab(tab);
    // No per-user fetch needed in review step
  };
  const handleTascoTabChange = (tab: TimesheetFilter) => {
    setTascoTab(tab);
    // No per-user fetch needed in review step
  };

  // Check completion status for tabs
  const checkTabsCompletion = (timesheets: TimesheetHighlights[]) => {
    if (!timesheets || timesheets.length === 0) return;
    const updatedTabsComplete = { ...tabsComplete };
    // No log completion checks possible on TimesheetHighlights, so mark as complete
    updatedTabsComplete.truckingEquipmentHaulLogs = true;
    updatedTabsComplete.truckingMaterialHaulLogs = true;
    updatedTabsComplete.truckingRefuelLogs = true;
    updatedTabsComplete.truckingStateLogs = true;
    updatedTabsComplete.tascoHaulLogs = true;
    updatedTabsComplete.tascoRefuelLogs = true;
    updatedTabsComplete.equipmentLogs = true;
    setTabsComplete(updatedTabsComplete);
  };

  // Clear focusIds when returning from edit (when focusIds changes from non-empty to empty)
  useEffect(() => {
    if (focusIds.length === 0) {
      // No-op, but this ensures the UI resets
    }
  }, [focusIds]);
  // Use a separate state to track if we've loaded data and determined there are no members
  const [hasNoMembers, setHasNoMembers] = useState(false);
  // Handle case when no users are found - use a separate effect and state
  useEffect(() => {
    // Only run this check after we've loaded data
    if (dataLoaded && !loading) {
      if (reviewList.length === 0) {
        // Set flag that we've determined there are no members
        setHasNoMembers(true);
      }
    }
  }, [reviewList.length, loading, dataLoaded]);

  // Separate effect for navigation to avoid render-during-render issues
  useEffect(() => {
    if (hasNoMembers) {
      // Use setTimeout to defer state updates to next tick to avoid React warnings
      setTimeout(() => {
        setEditFilter(null);
        handleClick();
      }, 0);
    }
  }, [hasNoMembers, setEditFilter, handleClick]);

  // Helper to toggle selection for entity IDs (not employee IDs)
  const handleSelectEntity = (id: string) => {
    if (focusIds.includes(id)) {
      setFocusIds(focusIds.filter((fid) => fid !== id));
    } else {
      setFocusIds([...focusIds, id]);
    }
  };

  if (loading) {
    return (
      <Bases>
        <Contents>
          <Holds className="h-full flex items-center justify-center">
            <Titles size="h2">{t("Loading")}</Titles>
          </Holds>
        </Contents>
      </Bases>
    );
  }

  // Removed 'NoTeamMembers' loading view for managers. Always proceed to their own review card if no team members are found.

  // If hasNoMembers is true, we're about to navigate away,
  // so render a temporary loading state
  if (hasNoMembers) {
    return (
      <Bases>
        <Contents>
          <Holds className="h-full flex items-center justify-center">
            <Titles size="h2">{t("Proceeding")}</Titles>
          </Holds>
        </Contents>
      </Bases>
    );
  }

  // Calculate total hours for the focus user from ALL completed timesheets regardless of filter
  const totalHours = calculateTotalHours(
    pendingTimesheets[focusUser?.id]?.filter(
      (ts) => ts.endTime !== null && ts.endTime !== undefined,
    ) || [],
  );
  return (
    <Bases>
      <Contents>
        <Holds
          background={"white"}
          className="row-span-1 h-full p-4 flex flex-col"
        >
          <Holds className="h-full w-full flex-1 flex flex-col">
            <Grids rows={"8"} gap={"5"} className="h-full">
              <Holds className="row-start-1 row-end-2 h-full w-full justify-center">
                <TitleBoxes onClick={prevStep}>
                  <Holds className="h-full justify-end">
                    <Titles size={"h2"}>{t("ReviewYourTeam")}</Titles>
                  </Holds>
                </TitleBoxes>
              </Holds>
              {/* Main content area with TinderSwipe - Fixed height container */}
              <Holds
                className="row-start-2 row-end-8 w-full items-start" // changed from default to items-start
                style={{ height: "calc(100% - 10px)" }}
              >
                <TinderSwipe
                  ref={tinderSwipeRef}
                  onSwipeLeft={handleEdit}
                  onSwipeRight={handleApprove}
                  swipeThreshold={100}
                >
                  <Holds className="h-full w-full items-start">
                    {" "}
                    {/* added items-start */}
                    <div className="flex flex-col h-full w-full bg-orange-200 rounded-lg overflow-hidden border-2 border-black shadow-md">
                      {/* User info header with name and hours - updated styling */}
                      <div className="flex justify-between w-full px-2 py-3 bg-orange-200 border-b-2 border-black">
                        {" "}
                        {/* removed items-center */}
                        <Titles
                          size="h3"
                          className="text-left font-bold text-gray-800"
                        >
                          {focusUser
                            ? `${focusUser.firstName} ${focusUser.lastName}`
                            : "Unknown User"}
                        </Titles>
                        <Texts size="p4" className="font-bold text-gray-800">
                          {totalHours} {t("Hrs")}
                        </Texts>
                      </div>
                      {/* Filter dropdown with reduced padding */}
                      <div className="w-full px-2 pt-2 pb-2 bg-orange-200">
                        <div className="flex flex-row items-center">
                          <select
                            className="w-full border-2 border-black rounded-md px-3 py-2 text-sm bg-white text-gray-800 font-medium"
                            value={filter}
                            onChange={(e) =>
                              setFilter(e.target.value as typeof filter)
                            }
                          >
                            {FILTER_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Tabs for Trucking/TASCO using the new NewTab component */}
                      {(filter === "trucking" || filter === "tasco") && (
                        <div className="w-full px-2 pt-1 pb-1 bg-orange-200">
                          <Holds className="h-12">
                            <ReviewTabOptions
                              activeTab={
                                filter === "trucking" ? truckingTab : tascoTab
                              }
                              setActiveTab={
                                filter === "trucking"
                                  ? handleTruckingTabChange
                                  : handleTascoTabChange
                              }
                              tabs={
                                filter === "trucking"
                                  ? TRUCKING_TABS
                                  : TASCO_TABS
                              }
                              isLoading={timesheetLoading}
                            />
                          </Holds>
                        </div>
                      )}
                      <div
                        className="flex-1 w-full bg-orange-200 rounded-b-lg px-2 py-2"
                        style={{
                          maxHeight: "calc(100% - 120px)",
                          minHeight: "60%",
                          overflowY: "auto",
                        }}
                      >
                        <TimeSheetRenderer
                          filter={getCurrentTimesheetFilter()}
                          data={timesheetData}
                          edit={false}
                          manager={manager}
                          onDataChange={() => {}}
                          date={date}
                          focusIds={focusIds}
                          setFocusIds={setFocusIds}
                          handleSelectEntity={handleSelectEntity}
                          isReviewYourTeam={true}
                          allEquipment={allEquipment}
                        />
                      </div>
                    </div>
                  </Holds>
                </TinderSwipe>
              </Holds>
              {/* Action Buttons - improved styling */}
              <Holds className="row-start-8 row-end-9 w-full px-4 py-2">
                <div className="flex flex-row w-full justify-between gap-4">
                  <Buttons
                    className="w-5/12 px-4 py-3 rounded-lg font-bold border-2 border-black"
                    background={"orange"}
                    onClick={() => {
                      if (tinderSwipeRef.current) {
                        tinderSwipeRef.current.swipeLeft();
                      } else {
                        handleEdit();
                      }
                    }}
                  >
                    <Holds
                      position="row"
                      className="justify-center items-center gap-2"
                    >
                      <img src="/formEdit.svg" alt="Edit" className="w-5 h-5" />
                      {t("Edit")}
                    </Holds>
                  </Buttons>
                  <Buttons
                    className="w-5/12 px-4 py-3 rounded-lg font-bold border-2 border-black"
                    background={"green"}
                    onClick={() => {
                      if (tinderSwipeRef.current) {
                        tinderSwipeRef.current.swipeRight();
                      } else {
                        handleApprove();
                      }
                    }}
                    disabled={focusIds.length > 0}
                  >
                    <Holds
                      position="row"
                      className="justify-center items-center gap-2"
                    >
                      <img
                        src="/statusApproved.svg"
                        alt="Approve"
                        className="w-5 h-5"
                      />
                      {t("Approve")}
                    </Holds>
                  </Buttons>
                </div>
              </Holds>
            </Grids>
          </Holds>
        </Holds>
      </Contents>
    </Bases>
  );
};

export default ReviewYourTeam;
