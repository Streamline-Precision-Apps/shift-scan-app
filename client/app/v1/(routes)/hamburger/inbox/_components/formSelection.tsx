import { createFormSubmission } from "@/actions/hamburgerActions";
import Spinner from "@/components/(animations)/spinner";
import { PullToRefresh } from "@/components/(animations)/pullToRefresh";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Selects } from "@/components/(reusable)/selects";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import InboxSkeleton from "./inboxSkeleton";

type Form = {
  id: string;
  name: string;
};
type DraftForm = {
  id: number;
  title: string;
  formTemplateId: string;
  status: FormStatus;
  createdAt: string;
  data: Record<string, string>;
  FormTemplate: {
    name: string;
  };
};
enum FormStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
  DRAFT = "DRAFT",
}

type SentContent = {
  id: number;
  title: string;
  formTemplateId: string;
  data: Record<string, string>;
  FormTemplate: {
    name: string;
    formType: string;
  };
  User?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: FormStatus;
};
// todo you need to fetch the draft forms as well as the other forms adjust api and server actions

export default function FormSelection({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  activeTab: number;
  isManager: boolean;
}) {
  const t = useTranslations("Hamburger-Inbox");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("");
  // const [formDrafts, setFormDrafts] = useState<DraftForm[]>([]);
  const { data: session } = useSession();
  const userId = session?.user.id;
  const router = useRouter();

  // Calculate the start date (Monday) and end date (Sunday) of the current week
  const getWeekDates = (): { startDate: string; endDate: string } => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // Calculate days to subtract to get to Monday (if today is Sunday (0), we need to go back 6 days)
    const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;

    // Calculate Monday (start of week)
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToSubtract);
    monday.setHours(0, 0, 0, 0);

    // Calculate Sunday (end of week)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Format dates as ISO strings (YYYY-MM-DD)
    const startDate = monday.toISOString().split("T")[0];
    const endDate = sunday.toISOString().split("T")[0];

    return { startDate, endDate };
  };

  // Get the current week's start and end dates
  const { startDate, endDate } = getWeekDates();

  const fetchSentContent = async (
    skip: number,
    reset?: boolean,
  ): Promise<SentContent[]> => {
    const response = await fetch(
      `/api/formSubmissions/${selectedFilter}?startDate=${startDate}&endDate=${endDate}&skip=${skip}&take=10`,
    );
    const data = await response.json();
    // Defensive: filter out any non-object/string results
    return Array.isArray(data)
      ? data.filter(
          (item): item is SentContent =>
            typeof item === "object" && item !== null && "id" in item,
        )
      : [];
  };

  const {
    data: sentContent,
    isLoading,
    isInitialLoading,
    lastItemRef,
    reset: resetSentContent,
  } = useInfiniteScroll<SentContent>({
    fetchFn: fetchSentContent,
    dependencies: [selectedFilter as unknown as SentContent], // Type assertion to bypass dependency type
  });

  // Handle pull-to-refresh for sentContent
  const handleRefresh = useCallback(async () => {
    return resetSentContent();
  }, [resetSentContent]);
  // Fetch forms from the database on mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/forms");
        const data: Form[] = await response.json();
        setForms(data);
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const [createLoading, setCreateLoading] = useState(false);
  const setFormPage = async () => {
    if (createLoading) return;
    setCreateLoading(true);
    try {
      const formData = new FormData();
      formData.append("formTemplateId", selectedForm);
      if (userId) {
        formData.append("userId", userId);
      }

      const submission = await createFormSubmission(formData);

      if (!submission || !submission.id) {
        setCreateLoading(false);
        return;
      }
      router.push(
        `/hamburger/inbox/formSubmission/${selectedForm}?submissionId=${submission.id}&status=DRAFT`,
      );
    } catch (error) {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <Holds
        position={"row"}
        className="h-16 border-b-2  border-neutral-100  gap-2 px-2"
      >
        <Holds>
          <Suspense
            fallback={
              <Selects
                value={""}
                disabled
                className="text-center text-sm disabled:bg-white h-full p-2"
              >
                <option value={""}>{t("SelectAForm")}</option>
              </Selects>
            }
          >
            <>
              {loading ? (
                <Selects
                  value={""}
                  disabled
                  className="text-center text-sm disabled:bg-white h-full p-2"
                >
                  <option value={""}>{t("SelectAForm")}</option>
                </Selects>
              ) : (
                <Selects
                  value={selectedForm}
                  onChange={(e) => setSelectedForm(e.target.value)}
                  className="text-center text-sm h-full p-2 "
                >
                  <option value={""}>{t("SelectAForm")}</option>
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </Selects>
              )}
            </>
          </Suspense>
        </Holds>
        <Holds className="w-fit ">
          <Buttons
            shadow={"none"}
            onClick={setFormPage}
            background={
              selectedForm === "" || createLoading ? "darkGray" : "green"
            }
            disabled={selectedForm === "" || createLoading}
            className="w-12 h-full p-2 flex items-center justify-center"
          >
            {createLoading ? (
              <Spinner size={24} />
            ) : (
              <Images
                titleImgAlt="plus"
                titleImg="/plus.svg"
                className="max-w-6  h-auto object-contain m-auto"
              />
            )}
          </Buttons>
        </Holds>
      </Holds>

      <Holds className="h-fit w-full pb-2 ">
        <Contents width={"section"}>
          <Holds className="pb-1">
            <Titles position={"left"} size={"md"}>
              {t("DraftsSubmissions")}
            </Titles>
          </Holds>
          <Selects
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="text-center text-sm justify-center "
          >
            <option value="all">{t("SelectAFilter")}</option>
            <option value="draft">{t("Drafts")}</option>
            <option value="pending">{t("Pending")}</option>
            <option value="approved">{t("Approved")}</option>
            <option value="denied">{t("Denied")}</option>
          </Selects>
        </Contents>
      </Holds>
      <div className="flex-1 overflow-y-auto no-scrollbar border-t-black border-opacity-5 border-t-2">
        <Suspense fallback={<InboxSkeleton />}>
          {isInitialLoading ? (
            <InboxSkeleton />
          ) : (
            <PullToRefresh
              onRefresh={handleRefresh}
              pullText={t("PullToRefresh") || "Pull to refresh"}
              releaseText={t("ReleaseToRefresh") || "Release to refresh"}
              refreshingText={t("Loading") || "Loading..."}
              contentClassName="h-full"
              textColor="text-app-dark-blue"
            >
              <div className="h-full max-h-full overflow-y-auto no-scrollbar">
                <Holds className="row-start-2 row-end-7 h-full w-full ">
                  <Contents width={"section"}>
                    {!sentContent ||
                      (sentContent.length === 0 && (
                        <Holds className="h-full">
                          <Texts size={"md"} className="italic text-gray-500">
                            {selectedFilter === "denied"
                              ? t("NoDeniedFormsSubmitted")
                              : selectedFilter === "pending"
                                ? t("NoPendingFormsSubmitted")
                                : selectedFilter === "approved"
                                  ? t("NoApprovedFormsSubmitted")
                                  : t("NoFormsSubmitted")}
                          </Texts>
                          <Texts size={"sm"} className="italic text-gray-500">
                            {t("GoToFormsSectionToCreateForms")}
                          </Texts>
                        </Holds>
                      ))}
                    <div className="pt-3 pb-5 h-full w-full">
                      {Array.isArray(sentContent) &&
                        sentContent.map((form, index) => {
                          if (typeof form === "string") return null; // Defensive: skip invalid entries

                          // Defensive: fallback to FormTemplate name if title is missing or empty
                          const title =
                            form.title && form.title.length > 0
                              ? form.title.charAt(0).toUpperCase() +
                                form.title.slice(1)
                              : form.FormTemplate?.name || "";

                          const isLastItem = index === sentContent.length - 1;

                          return (
                            <Holds className="pb-3" key={form.id}>
                              <Buttons
                                ref={isLastItem ? lastItemRef : null}
                                shadow={"none"}
                                className="py-1.5 relative"
                                background={
                                  form.status === "PENDING"
                                    ? "orange"
                                    : form.status === "APPROVED"
                                      ? "green"
                                      : form.status === "DENIED"
                                        ? "red"
                                        : "lightBlue"
                                }
                                onClick={() => {
                                  router.push(
                                    `/hamburger/inbox/formSubmission/${form.formTemplateId}?submissionId=${form.id}&status=${form.status}`,
                                  );
                                }}
                                disabled={isLoading}
                              >
                                <Holds className="w-full h-full relative">
                                  <Titles size={"md"}>{title}</Titles>

                                  <Images
                                    titleImgAlt={"form Status"}
                                    titleImg={
                                      form.status === "PENDING"
                                        ? "/statusOngoingFilled.svg"
                                        : form.status === "APPROVED"
                                          ? "/statusApprovedFilled.svg"
                                          : form.status === "DENIED"
                                            ? "/statusDeniedFilled.svg"
                                            : "/formSent.svg"
                                    }
                                    className="absolute max-w-8 h-auto object-contain top-[50%] translate-y-[-50%] right-2"
                                  />
                                </Holds>
                              </Buttons>
                            </Holds>
                          );
                        })}
                      {isLoading && (
                        <Holds className="flex justify-center py-4">
                          <Spinner />
                        </Holds>
                      )}
                    </div>
                  </Contents>
                </Holds>
              </div>
            </PullToRefresh>
          )}
        </Suspense>
      </div>
    </>
  );
}
