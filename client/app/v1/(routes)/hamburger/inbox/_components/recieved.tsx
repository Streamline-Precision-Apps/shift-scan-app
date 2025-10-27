"use client";
import { PullToRefresh } from "@/app/v1/components/(animations)/pullToRefresh";
import Spinner from "@/app/v1/components/(animations)/spinner";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Selects } from "@/app/v1/components/(reusable)/selects";
import { Texts } from "@/app/v1/components/(reusable)/texts";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import RecievedInboxSkeleton from "./recievedInboxSkeleton";
import { useInfiniteScroll } from "@/app/lib/hooks/useInfiniteScroll";

enum FormStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
  DRAFT = "DRAFT",
}

type SentContent = {
  id: string;
  formTemplateId: string;
  status: FormStatus;
  data: Record<string, string>;
  FormTemplate: {
    name: string;
    formType: string;
  };
  User: {
    firstName: string;
    lastName: string;
  };
  Approvals: {
    approver: {
      firstName: string;
      lastName: string;
    };
  }[];
};

type EmployeeRequests = {
  id: string;
  formTemplateId: string;
  User: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export default function RTab({ isManager }: { isManager: boolean }) {
  const t = useTranslations("Hamburger-Inbox");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequests[]>(
    []
  );

  const router = useRouter();

  const fetchRequests = async (skip: number, reset: boolean = false) => {
    const url = process.env.NEXT_PUBLIC_API_URL || `http://localhost:3001`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await fetch(
      `${url}/api/v1/forms/employeeRequests/filter=${
        selectedFilter ? selectedFilter : "all"
      }&skip=${skip}&take=10`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return await response.json();
  };

  const {
    data: sentContent,
    isLoading,
    isInitialLoading,
    lastItemRef,
    refresh,
  } = useInfiniteScroll<SentContent>({
    fetchFn: fetchRequests,
    dependencies: [selectedFilter],
  });

  const handleRefresh = async () => {
    await refresh(); // Use the hook's refresh function
  };

  useEffect(() => {
    const fetchEmployeeRequests = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || `http://localhost:3001`;
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${url}/api/v1/user`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await response.json();
        setEmployeeRequests(data as EmployeeRequests[]);
      } catch (err) {
        console.error("Error fetching employee requests:", err);
      }
    };

    fetchEmployeeRequests();
  }, []);

  const uniqueEmployees = Array.isArray(employeeRequests)
    ? employeeRequests.reduce((acc, current) => {
        const x = acc.find((item) => item.User.id === current.User.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, [] as EmployeeRequests[])
    : [];

  return (
    <>
      <Holds
        className="h-16 border-b-2  border-neutral-100 shrink-0 rounded-lg sticky top-0 z-10 px-2 gap-x-2"
        position={"row"}
      >
        <Suspense
          fallback={
            <Selects
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-center justify-center"
              disabled={isLoading}
            >
              <option value="all">{t("SelectAFilter")}</option>
            </Selects>
          }
        >
          <Selects
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="text-center justify-center text-black"
            disabled={isLoading}
          >
            <option value="all">{t("SelectAFilter")}</option>
            <option value="approved">{t("Approved")}</option>
            {uniqueEmployees.map((emp) => (
              <option key={emp?.User.id} value={emp?.User.id}>
                {emp?.User.firstName} {emp?.User.lastName}
              </option>
            ))}
          </Selects>
        </Suspense>
      </Holds>
      <div className="flex-1 overflow-y-auto no-scrollbar border-t-black border-opacity-5 border-t-2">
        <Suspense fallback={<RecievedInboxSkeleton />}>
          {isInitialLoading ? (
            <RecievedInboxSkeleton />
          ) : (
            <PullToRefresh
              onRefresh={handleRefresh}
              bgColor="bg-darkBlue/70"
              textColor="text-app-dark-blue"
              pullText={"Pull To Refresh"}
              releaseText={"Release To Refresh"}
              refreshingText="Loading..."
              containerClassName="h-full"
            >
              <Contents width={"section"}>
                {!sentContent ||
                  (sentContent.length === 0 && (
                    <Holds className="mt-2 h-full">
                      <Texts size={"sm"} className="italic text-gray-500">
                        {selectedFilter === "all"
                          ? t("NoTeamRequestsSubmittedOrFound")
                          : selectedFilter === "approved"
                          ? t("NoRecentlyApprovedRequests")
                          : t("NoRequestsFromSelectedEmployee")}
                      </Texts>
                      <Texts size={"xs"} className="italic text-gray-500">
                        {t("PleaseCheckBackLaterForNewRequests")}
                      </Texts>
                    </Holds>
                  ))}
                <Holds className="gap-y-4 pt-3 pb-5">
                  {sentContent.map((form, index) => {
                    const title =
                      form.FormTemplate?.formType || form.FormTemplate?.name; // Fallback if formTemplate is undefined
                    const isLastItem = index === sentContent.length - 1;
                    return (
                      <Buttons
                        key={form.id}
                        ref={isLastItem ? lastItemRef : null}
                        className="py-0.5 relative"
                        background={"lightBlue"}
                        onClick={() => {
                          router.push(
                            `/hamburger/inbox/formSubmission/${form.formTemplateId}?submissionId=${form.id}&status=${form.status}&approvingStatus=${isManager}&formApprover=TRUE`
                          );
                        }}
                        disabled={isLoading}
                      >
                        <Holds className="w-full h-full relative">
                          <Titles size={"md"}>{title}</Titles>
                          <Titles size={"xs"}>
                            {form.User.firstName + " " + form.User.lastName}
                          </Titles>
                        </Holds>
                      </Buttons>
                    );
                  })}
                  {isLoading && (
                    <Holds className="flex justify-center py-4">
                      <Spinner />
                    </Holds>
                  )}
                </Holds>
              </Contents>
            </PullToRefresh>
          )}
        </Suspense>
      </div>
    </>
  );
}
