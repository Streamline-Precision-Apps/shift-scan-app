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

export default function WidgetSection() {
  const { user, setUser, setPayPeriodTimeSheets } = useUserStore();
  const router = useRouter();
  const [toggle, setToggle] = useState(true);

  // If no user, refetch from /api/v1/init
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) {
        try {
          // Get token and userId from localStorage if available
          let token = "";
          let userId = undefined;
          if (typeof window !== "undefined") {
            token = localStorage.getItem("token") || "";
            userId = localStorage.getItem("userId") || undefined;
            // Fallback to cookie if token not in localStorage
          }
          const url =
            process.env.NEXT_PUBLIC_API_URL || `http://localhost:3001`;

          const res = await fetch(`${url}/api/v1/init`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, userId }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) setUser(data.user);
          }
        } catch (e) {
          // Optionally handle error
        }
      }
    };
    fetchUser();
  }, [user, setUser]);

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
            href="/dashboard/qr-generator?rPath=/"
          />
          <WidgetContainer
            titleImg="/team.svg"
            titleImgAlt={t("MyTeamIcon")}
            text={"MyTeam"}
            background={"lightBlue"}
            translation={"Widgets"}
            href="/dashboard/myTeam?rPath=/"
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
          href={pageView === "break" ? "/break" : "/clock"}
          disabled={isTerminate}
        />
        {/*Todo: Eventually add to the disabled prop || isLocationOn === false */}
      </Holds>
    </>
  );
}
