"use client";
type TinderSwipeRef = {
  swipeLeft: () => void;
  swipeRight: () => void;
};

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

type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  clockedIn: boolean;
  TimeSheets: TimeSheet[];
  totalTime: string; // Changed from number to string to match your usage
  Crews: { id: string; leadId: string }[]; // Added optional teamId
};

type ViewOption = "highlight" | "Trucking" | "Tasco" | "Equipment";

import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Selects } from "@/components/(reusable)/selects";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { CardControls } from "./CardControls";
import GeneralReviewSection from "./GeneralReviewSection";
import TascoReviewSection from "./TascoReviewSection";
import TruckingReviewSection from "./TruckingReviewSection";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  useCallback,
  use,
} from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import TinderSwipe from "@/components/(animations)/tinderSwipe";
import Spinner from "@/components/(animations)/spinner";
import EquipmentLogsSection from "./EquipmentLogsSection";
import { ApproveUsersTimeSheets } from "@/actions/ManagerTimeCardActions";
import { PullToRefresh } from "@/components/(animations)/pullToRefresh";
import { useScrollSwipeHandlers } from "@/hooks/useScrollSwipeHandlers";

export default function TimeCardApprover({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const t = useTranslations("TimeCardSwiper");
  const router = useRouter();
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMember = teamMembers[currentIndex];
  const [completed, setCompleted] = useState(false);
  const { data: session } = useSession();
  const manager = session?.user?.firstName + " " + session?.user?.lastName;
  const managerId = session?.user?.id;
  const currentTimeSheets = currentMember?.TimeSheets || [];
  const [viewOption, setViewOption] = useState<ViewOption>("highlight");
  const swipeRef = useRef<TinderSwipeRef>(null);
  const urls = useSearchParams();
  const rPath = urls.get("rPath");

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollSwipeHandlers = useScrollSwipeHandlers(setIsScrolling);

  // Memoized calculation of total time for performance
  const calculateTotalTime = useCallback((timeSheets: TimeSheet[]): string => {
    let totalMs = 0;
    for (const timesheet of timeSheets) {
      const start = Date.parse(timesheet.startTime);
      const end = Date.parse(timesheet.endTime);
      if (!isNaN(start) && !isNaN(end)) {
        totalMs += end - start;
      }
    }
    const hours = Math.floor(totalMs / 3_600_000);
    const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
    return `${hours} hrs ${minutes} mins`;
  }, []);

  // Memoized getAvailableViewOptions for stable reference
  const getAvailableViewOptions = useCallback(
    (timeSheets: TimeSheet[]): ViewOption[] => {
      const options = new Set<ViewOption>(["highlight"]);
      for (const timesheet of timeSheets) {
        if (
          timesheet.workType === "TRUCK_DRIVER" &&
          timesheet.TruckingLogs?.length
        ) {
          options.add("Trucking");
        } else if (
          timesheet.workType === "TASCO" &&
          timesheet.TascoLogs?.length
        ) {
          options.add("Tasco");
        } else if (timesheet.EmployeeEquipmentLogs?.length) {
          options.add("Equipment");
        }
      }
      return Array.from(options);
    },
    [],
  );

  // Memoized fetchCrewTimeCards for stable reference
  const fetchCrewTimeCards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/getPendingTeamTimeSheets?managerId=${managerId}`,
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data: TeamMember[] = await response.json();
      const membersWithTotals = data
        .map((member) => ({
          ...member,
          TimeSheets: member.TimeSheets.map((timesheet) => ({
            ...timesheet,
            id: timesheet.id,
          })),
          totalTime: calculateTotalTime(member.TimeSheets),
        }))
        .filter((member) => member.TimeSheets.length > 0);
      setTeamMembers(membersWithTotals);
    } catch (error) {
      console.error("Error fetching crew time cards:", error);
    } finally {
      setLoading(false);
    }
  }, [managerId, setLoading, calculateTotalTime]);

  useEffect(() => {
    fetchCrewTimeCards();
  }, [fetchCrewTimeCards]);

  // Memoized ApproveTimeSheets for stable reference
  const ApproveTimeSheets = useCallback(
    async (id: string) => {
      try {
        const approveMember = teamMembers.find((member) => member.id === id);
        if (!approveMember) return;
        const timeSheetIds = approveMember.TimeSheets.map(
          (timesheet) => timesheet.id,
        );
        const formData = new FormData();
        formData.append("id", id);
        formData.append("timesheetIds", JSON.stringify(timeSheetIds));
        formData.append("statusComment", `Approved by ${manager}`);
        formData.append("editorId", managerId || "");
        const response = await ApproveUsersTimeSheets(formData);
        if (!response.success) {
          console.error("Failed to approve timecards");
        }
      } catch (error) {
        console.error("Error submitting timecards:", error);
      }
    },
    [teamMembers, manager],
  );

  // Memoized swipe handler
  const swiped = useCallback(
    (direction: string, memberId: string) => {
      const myTeamId = currentMember?.Crews.find(
        (crew) => crew.leadId === managerId,
      )?.id;
      if (direction === "left") {
        router.push(
          `/dashboard/myTeam/${myTeamId}/employee/${memberId}?timeCard=/dashboard/myTeam/timecards?rPath=${rPath}`,
        );
      } else {
        ApproveTimeSheets(memberId);
        if (currentIndex < teamMembers.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setCompleted(true);
        }
      }
    },
    [
      currentMember,
      managerId,
      router,
      rPath,
      ApproveTimeSheets,
      currentIndex,
      teamMembers.length,
    ],
  );

  // Memoized edit/approve click handlers
  const handleEditClick = useCallback(() => {
    swipeRef.current?.swipeLeft();
  }, []);
  const handleApproveClick = useCallback(() => {
    swipeRef.current?.swipeRight();
  }, []);

  return (
    <Holds className="h-full w-full">
      <Grids rows={"8"} className="h-full w-full pb-5">
        <Holds
          className={`${
            completed ? "row-start-1 row-end-9" : "row-start-1 row-end-8 "
          } h-full w-full`}
        >
          <Contents>
            <Holds
              className={`w-full h-full rounded-[10px] border-[3px] border-black bg-[#EBC68E] ${
                loading && "animate-pulse"
              }`}
            >
              {/* Main Content Area */}
              {loading ? (
                <Holds className="h-full flex items-center justify-center">
                  <Spinner size={70} />
                </Holds>
              ) : completed ? (
                <Holds className="h-full flex flex-col items-center justify-center gap-4">
                  <Titles size={"sm"}>{t("Complete")}</Titles>
                  <Images
                    titleImg="/statusApprovedFilled.svg"
                    titleImgAlt="approved"
                    className="w-8 h-8 border-[3px] border-black rounded-full"
                  />
                  <Texts size={"sm"}>{t("YouHaveApprovedAllTimesheets")}</Texts>
                </Holds>
              ) : currentMember ? (
                <TinderSwipe
                  ref={swipeRef}
                  key={currentMember.id}
                  onSwipeLeft={() => swiped("left", currentMember.id)}
                  onSwipeRight={() => {
                    swiped("right", currentMember.id);
                    ApproveTimeSheets(currentMember.id);
                  }}
                >
                  <Grids
                    rows={"6"}
                    gap={"5"}
                    className="bg-[#EBC68E] h-full w-full p-2 rounded-lg"
                  >
                    {/* Header Section */}
                    <Holds className="row-start-1 row-end-2 w-full h-full rounded-none">
                      <Holds position={"row"} className="h-full">
                        <Holds>
                          <Titles position={"left"} size={"h5"}>
                            {`${currentMember.firstName} ${currentMember.lastName}`}
                          </Titles>
                        </Holds>
                        <Holds
                          position={"right"}
                          className="w-full h-full justify-center items-center"
                        >
                          <Texts position={"right"} size={"p5"}>
                            {currentMember.totalTime}
                          </Texts>
                        </Holds>
                      </Holds>
                      <Selects
                        value={viewOption}
                        onChange={(e) =>
                          setViewOption(e.target.value as ViewOption)
                        }
                        className="text-center text-sm"
                      >
                        {getAvailableViewOptions(currentTimeSheets).map(
                          (option) => (
                            <option key={option} value={option}>
                              {t(option)}
                            </option>
                          ),
                        )}
                      </Selects>
                    </Holds>

                    {/* Content Section */}
                    <Holds className="h-full row-start-2 row-end-7 rounded-none pb-2 no-scrollbar">
                      {viewOption === "highlight" && (
                        <GeneralReviewSection
                          currentTimeSheets={currentTimeSheets}
                          scrollSwipeHandlers={scrollSwipeHandlers}
                          isScrolling={isScrolling}
                        />
                      )}
                      {viewOption === "Trucking" && (
                        <TruckingReviewSection
                          currentTimeSheets={currentTimeSheets}
                        />
                      )}
                      {viewOption === "Tasco" && (
                        <TascoReviewSection
                          currentTimeSheets={currentTimeSheets}
                        />
                      )}
                      {viewOption === "Equipment" && (
                        <EquipmentLogsSection
                          currentTimeSheets={currentTimeSheets}
                        />
                      )}
                    </Holds>
                  </Grids>
                </TinderSwipe>
              ) : (
                <PullToRefresh
                  onRefresh={fetchCrewTimeCards}
                  textColor="text-app-dark-blue"
                >
                  <Holds className="h-full flex items-center justify-center">
                    <Texts size={"p6"} className="italic">
                      {t("NoTimesheetsToApprove")}
                    </Texts>
                    <Texts size={"p6"}>{t("PullToRefresh")}</Texts>
                  </Holds>
                </PullToRefresh>
              )}
            </Holds>
          </Contents>
        </Holds>

        {/* Controls - Only show when not loading and not completed */}

        {!loading && !completed && (
          <Holds className="row-start-8 row-end-9 w-full h-full">
            <CardControls
              completed={completed}
              handleEditClick={handleEditClick}
              handleApproveClick={handleApproveClick}
            />
          </Holds>
        )}
      </Grids>
    </Holds>
  );
}
