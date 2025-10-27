import Spinner from "@/components/(animations)/spinner";
import { Holds } from "@/components/(reusable)/holds";

type MaintenanceLog = {
  id: string;
  startTime: string;
  endTime: string;
  userId: string;
  timeSheetId: string;
  User: {
    firstName: string;
    lastName: string;
    image: string;
  };
};

type Equipment = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  equipmentId: string;
  selected: boolean;
  priority: Priority;
  delay: Date | null;
  equipmentIssue: string;
  additionalInfo: string;
  repaired: boolean;
  createdBy: string;
  createdAt: string | undefined;
  MaintenanceLogs: MaintenanceLog[];
  Equipment: Equipment;
};

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  DELAYED = "DELAYED",
  PENDING = "PENDING",
  TODAY = "TODAY",
}
export function SelectionToggle({
  project,
  updatingId,
  handleToggle,
}: {
  project: Project;
  updatingId: string | null;
  handleToggle: (projectId: string) => Promise<void>;
}) {
  return (
    <Holds size="20">
      <Holds
        className="h-8 w-8 rounded-[10px]  relative"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle(project.id);
        }}
      >
        {updatingId === project.id ? (
          <Holds className="h-8 w-8 rounded-[10px] border-[3px] border-black relative">
            <Holds className="h-full w-full absolute justify-center items-center">
              <Spinner size={20} />
            </Holds>
          </Holds>
        ) : project.selected ? (
          <>
            <svg
              className="stroke-black bg-app-green rounded-[10px] border-[3px] border-black"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </>
        ) : (
          <>
            <svg
              className="stroke-white bg-white rounded-[10px] border-[3px] border-black"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </>
        )}
      </Holds>
    </Holds>
  );
}
