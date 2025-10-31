"use client";

import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import DbWidgetSection from "./dbWidgetSection";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import BannerRotating from "@/app/v1/components/(reusable)/bannerRotating";
import BannerRotatingSkeleton from "@/app/v1/components/(reusable)/BannerRotatingSkeleton";
import { Suspense, useEffect, useState } from "react";
import HamburgerMenuNew from "@/app/v1/components/(animations)/hamburgerMenuNew";
import ActiveTimesheetCheck from "@/app/v1/components/ActiveTimesheetCheck";
import DashboardLoadingView from "./UI/_dashboards/dashboardLoadingView";
import LoadingHamburgerMenuNew from "@/app/v1/components/(animations)/loadingHamburgerMenuNew";
import { useUserStore } from "@/app/lib/store/userStore";
import { getCookies } from "@/app/lib/actions/cookieActions";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUserStore();

  // State for cookies
  const [cookiesState, setCookiesState] = useState({
    currentPageView: "",
    mechanicProjectID: "",
    workRole: "general",
    laborType: "",
    loading: true,
  });

  useEffect(() => {
    async function fetchCookies() {
      const [currentPageView, mechanicProjectID, workRole, laborType] =
        await Promise.all([
          getCookies({ cookieName: "currentPageView" }),
          getCookies({ cookieName: "mechanicProjectID" }),
          getCookies({ cookieName: "workRole" }),
          getCookies({ cookieName: "laborType" }),
        ]);
      setCookiesState({
        currentPageView: currentPageView || "",
        mechanicProjectID: mechanicProjectID || "",
        workRole: workRole || "general",
        laborType: laborType || "",
        loading: false,
      });
    }
    fetchCookies();
  }, []);

  useEffect(() => {
    if (!cookiesState.loading && cookiesState.currentPageView !== "dashboard") {
      router.push("/v1");
    }
  }, [cookiesState.loading, cookiesState.currentPageView, router]);

  if (cookiesState.loading) {
    return <div>Loading...</div>;
  }

  // You can't use redirect() in client components, so you could use router.push if needed
  if (cookiesState.currentPageView !== "dashboard") {
    return <div>Redirecting...</div>;
  }

  if (!user)
    return (
      <Bases>
        <Contents>
          <Holds className="h-full">
            <div className="flex justify-center items-center h-full">
              <p className="text-red-500">User not found. Please log in.</p>
            </div>
          </Holds>
        </Contents>
      </Bases>
    );

  // Main return component (unchanged)
  return (
    <Bases>
      <Contents>
        <Grids rows={"8"} gap={"5"}>
          {/* Active timesheet check component - runs on dashboard load */}

          <ActiveTimesheetCheck userId={user.id} />

          <Suspense fallback={<LoadingHamburgerMenuNew />}>
            <HamburgerMenuNew isHome={false} />
          </Suspense>
          <div className="row-start-2 row-end-4 bg-app-blue/10 w-full h-full justify-center items-center rounded-[10px]">
            <Suspense fallback={<BannerRotatingSkeleton />}>
              <BannerRotating />
            </Suspense>
          </div>
          <Holds background={"white"} className="row-start-4 row-end-9 h-full">
            <Suspense fallback={<DashboardLoadingView />}>
              <DbWidgetSection
                view={cookiesState.workRole}
                mechanicProjectID={cookiesState.mechanicProjectID}
                laborType={cookiesState.laborType}
              />
            </Suspense>
          </Holds>
        </Grids>
      </Contents>
    </Bases>
  );
}
