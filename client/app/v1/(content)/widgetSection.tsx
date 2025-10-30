"use client";
import { Contents } from "./../components/(reusable)/contents";
import { useTranslations } from "next-intl";
import { Grids } from "./../components/(reusable)/grids";
import DisplayBreakTime from "./displayBreakTime";
import { useEffect, useState } from "react";
import Hours from "./hours";
import { Holds } from "./../components/(reusable)/holds";
import { useRouter } from "next/navigation";
import WidgetContainer from "./widgetContainer";
import DisplayBanner from "./displayBanner";
import DisplayBreakBanner from "./displayBreakBanner";
import { useUserStore } from "@/app/lib/store/userStore";
import { usePayPeriodData } from "@/app/lib/hooks/usePayPeriodData";
import Spinner from "../components/(animations)/spinner";
import { Banners } from "../components/(reusable)/banners";
import { useProfitStore } from "@/app/lib/store/profitStore";
import { useEquipmentStore } from "@/app/lib/store/equipmentStore";
import { useCostCodeStore } from "@/app/lib/store/costCodeStore";

export default function WidgetSection() {
  const [loadingUi, setLoadingUi] = useState(true);

  const { user, setUser, setPayPeriodTimeSheets } = useUserStore();
  const { setJobsites } = useProfitStore();
  const { setEquipments } = useEquipmentStore();
  const { setCostCodes } = useCostCodeStore();
  const router = useRouter();
  const [toggle, setToggle] = useState(true);

  // If no user, try to load from localStorage first, then refetch from /api/v1/init if needed
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          try {
            // Try to load all stores from localStorage
            let allStoresLoaded = false;
            if (typeof window !== "undefined") {
              const userStoreRaw = localStorage.getItem("user-store");
              const jobsitesStoreRaw = localStorage.getItem("profit-store");
              const equipmentsStoreRaw =
                localStorage.getItem("equipment-store");
              const costCodesStoreRaw = localStorage.getItem("cost-code-store");

              if (
                userStoreRaw &&
                jobsitesStoreRaw &&
                equipmentsStoreRaw &&
                costCodesStoreRaw
              ) {
                try {
                  const userStoreObj = JSON.parse(userStoreRaw);
                  const jobsitesStoreObj = JSON.parse(jobsitesStoreRaw);
                  const equipmentsStoreObj = JSON.parse(equipmentsStoreRaw);
                  const costCodesStoreObj = JSON.parse(costCodesStoreRaw);

                  // Zustand stores may have either 'state' or direct properties
                  const userData =
                    userStoreObj?.state?.user || userStoreObj?.user;
                  const jobsitesData =
                    jobsitesStoreObj?.state?.jobsites ||
                    jobsitesStoreObj?.jobsites;
                  const equipmentsData =
                    equipmentsStoreObj?.state?.equipments ||
                    equipmentsStoreObj?.equipments;
                  const costCodesData =
                    costCodesStoreObj?.state?.costCodes ||
                    costCodesStoreObj?.costCodes;

                  if (
                    userData &&
                    Array.isArray(jobsitesData) &&
                    Array.isArray(equipmentsData) &&
                    Array.isArray(costCodesData)
                  ) {
                    setUser(userData);
                    setJobsites(jobsitesData);
                    setEquipments(equipmentsData);
                    setCostCodes(costCodesData);
                    allStoresLoaded = true;
                    setLoadingUi(false);
                    return; // Don't fetch from API if all data found in localStorage
                  }
                } catch (err) {
                  console.error("Error parsing stored data:", err);
                }
              }
            }

            // Get token and userId from localStorage if available
            let token = "";
            let userId: string | undefined = undefined;
            if (typeof window !== "undefined") {
              token = localStorage.getItem("token") || "";
              userId = localStorage.getItem("userId") as string | undefined;
            }

            const url =
              process.env.NEXT_PUBLIC_API_URL || `http://localhost:3001`;
            const res = await fetch(`${url}/api/v1/init`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ token, userId: String(userId) }),
            });

            if (res.ok) {
              const data = await res.json();

              // Set all stores and persist to localStorage
              if (data.user) {
                setUser(data.user);
                // Store with stringified userId
                if (typeof window !== "undefined") {
                  localStorage.setItem("userId", String(data.user.id));
                }
              }
              if (data.jobsites) setJobsites(data.jobsites);
              if (data.equipments) setEquipments(data.equipments);
              if (data.costCodes) setCostCodes(data.costCodes);
            }
          } catch (e) {
            console.error("Error fetching user data:", e);
          }
        }
      } catch (e) {
        console.error("Error in fetchUser:", e);
      } finally {
        setLoadingUi(false);
      }
    };
    fetchUser();
  }, [user, setUser, setJobsites, setEquipments, setCostCodes]);

  const accountSetup = user?.accountSetup;
  const permission = user?.permission;
  const locale = "en"; // Placeholder until cookies can be used
  const isTerminate = user?.terminationDate ? true : false;

  const { pageView, setPageView, loading } = usePayPeriodData(
    setPayPeriodTimeSheets
  );

  // Derived values
  const date = new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // const user = session.user as Session["user"];
  const isManager = ["ADMIN", "SUPERADMIN", "MANAGER"].includes(
    permission || ""
  );

  // Custom hooks
  // UseTotalPayPeriodHours(payPeriodSheets);

  // Handlers
  const handleToggle = () => setToggle(!toggle);

  // Handle page redirects in a separate useEffect
  useEffect(() => {
    if (pageView === "dashboard") {
      router.push("/dashboard");
    }
    if (pageView === "removeLocalStorage") {
      setPageView("");
    }
  }, [pageView, router, accountSetup, setPageView]);

  if (loadingUi) {
    // Match the main layout: BannerSection (row-start-2 row-end-4), MainContentSection (row-start-4 row-end-9)
    return (
      <>
        <Holds className="row-start-2 row-end-4 bg-app-blue bg-opacity-20 w-full h-full justify-center items-center rounded-[10px] relative">
          <Banners />
        </Holds>
        <Holds
          background={"white"}
          className="row-start-4 row-end-9 w-full h-full rounded-[10px] flex justify-center items-center"
        >
          <Spinner size={40} />
        </Holds>
      </>
    );
  }

  // Main render
  return (
    <>
      <BannerSection
        pageView={pageView}
        user={user || { firstName: "" }}
        date={date}
      />

      <MainContentSection
        toggle={toggle}
        pageView={pageView}
        isManager={isManager}
        handleToggle={handleToggle}
        loading={loading}
        isTerminate={isTerminate}
      />
    </>
  );
}
// ...existing code...

function BannerSection({
  pageView,
  user,
  date,
}: {
  pageView: string;
  user: {
    firstName: string;
  };

  date: string;
}) {
  return (
    <Holds className="row-start-2 row-end-4 bg-app-blue bg-opacity-20 w-full h-full justify-center items-center rounded-[10px] relative">
      {pageView === "" && (
        <DisplayBanner firstName={user.firstName} date={date} />
      )}
      {pageView === "break" && <DisplayBreakBanner />}
    </Holds>
  );
}
function MainContentSection({
  toggle,
  pageView,
  isManager,
  handleToggle,
  loading,
  isTerminate,
}: {
  toggle: boolean;
  pageView: string;
  isManager: boolean;
  handleToggle: () => void;
  loading: boolean;
  isTerminate: boolean;
}) {
  return (
    <Holds
      background={toggle ? "white" : "darkBlue"}
      className="row-start-4 row-end-9 h-full"
    >
      <Contents width={"section"} className="py-5">
        <Grids rows={"11"} cols={"2"} gap={"5"}>
          <TimeDisplaySection
            toggle={toggle}
            pageView={pageView}
            handleToggle={handleToggle}
            loading={loading}
          />

          {toggle && (
            <WidgetButtonsSection
              pageView={pageView}
              isManager={isManager}
              isTerminate={isTerminate}
            />
          )}
        </Grids>
      </Contents>
    </Holds>
  );
}
function TimeDisplaySection({
  toggle,
  pageView,
  handleToggle,
  loading,
}: {
  toggle: boolean;
  pageView: string;
  handleToggle: () => void;
  loading: boolean;
}) {
  if (pageView === "break") {
    return toggle ? (
      <Holds className="col-span-2 row-span-3 gap-5 h-full">
        <DisplayBreakTime setToggle={handleToggle} display={toggle} />
      </Holds>
    ) : (
      <Holds className="col-span-2 row-span-11 gap-5 h-full">
        <Hours setToggle={handleToggle} display={toggle} loading={loading} />
      </Holds>
    );
  }

  return (
    <Holds
      className={
        toggle
          ? "col-span-2 row-span-3 gap-5 h-full"
          : "col-span-2 row-span-11 gap-5 h-full"
      }
    >
      <Hours setToggle={handleToggle} display={toggle} loading={loading} />
    </Holds>
  );
}
function WidgetButtonsSection({
  pageView,
  isManager,
  isTerminate,
}: {
  pageView: string;
  isManager: boolean;
  isTerminate: boolean;
}) {
  const t = useTranslations("Home");
  return (
    <>
      {isManager && (
        <Holds position={"row"} className="col-span-2 row-span-4 gap-5 h-full">
          <WidgetContainer
            titleImg="/qrCode.svg"
            titleImgAlt={t("QrIcon")}
            text={"QR"}
            background={"lightBlue"}
            translation={"Widgets"}
            href="/v1/dashboard/qr-generator?rPath=/v1"
          />
          <WidgetContainer
            titleImg="/team.svg"
            titleImgAlt={t("MyTeamIcon")}
            text={"MyTeam"}
            background={"lightBlue"}
            translation={"Widgets"}
            href="/v1/dashboard/myTeam?rPath=/v1"
          />
        </Holds>
      )}

      <Holds
        className={
          isManager
            ? "col-span-2 row-span-4 gap-5 h-full"
            : "col-span-2 row-span-8 gap-5 h-full py-3"
        }
      >
        <WidgetContainer
          titleImg="/clockIn.svg"
          titleImgAlt={t("ClockInIcon")}
          text={"Clock-btn" + (pageView === "break" ? "-break" : "")}
          textSize={isManager ? "h3" : "h3"}
          background={"green"}
          translation={"Home"}
          href={pageView === "break" ? "/v1/break" : "/v1/clock"}
          disabled={isTerminate}
        />
        {/*Todo: Eventually add to the disabled prop || isLocationOn === false */}
      </Holds>
    </>
  );
}
