"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type TimesheetRedirectData = {
  timesheetId: string;
  workType: string;
  jobsite: {
    code: string;
    name: string;
  };
  costCode: string;
  tascoLog?: {
    laborType?: string;
    equipmentQrId?: string;
  };
  truckingLog?: {
    laborType?: string;
    equipmentQrId?: string;
    startingMileage?: number;
  };
};

export async function setTimesheetCookiesAndRedirect(
  data: TimesheetRedirectData,
) {
  const cookieStore = await cookies();

  try {
    // Set the timesheet ID cookie
    cookieStore.set("prevTimeSheet", data.timesheetId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    cookieStore.set("timeSheetId", data.timesheetId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Set the current page view
    cookieStore.set("currentPageView", "dashboard", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Set work role based on timesheet workType
    const workRoleMapping: Record<string, string> = {
      LABOR: "general",
      MECHANIC: "mechanic",
      TASCO: "tasco",
      TRUCK_DRIVER: "truck",
    };
    const workRole = workRoleMapping[data.workType] || "general";
    cookieStore.set("workRole", workRole, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Set jobsite information
    cookieStore.set(
      "jobSite",
      JSON.stringify({
        code: data.jobsite.code,
        label: data.jobsite.name,
      }),
      {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      },
    );

    // Set cost code
    cookieStore.set("costCode", data.costCode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Set labor type and additional cookies based on work type
    if (data.workType === "TASCO" && data.tascoLog) {
      cookieStore.set("laborType", data.tascoLog.laborType || "", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      if (data.tascoLog.equipmentQrId) {
        cookieStore.set("equipment", data.tascoLog.equipmentQrId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }
    } else if (data.workType === "TRUCK_DRIVER" && data.truckingLog) {
      cookieStore.set(
        "laborType",
        data.truckingLog.laborType || "truckDriver",
        {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        },
      );
      if (data.truckingLog.equipmentQrId) {
        cookieStore.set("truck", data.truckingLog.equipmentQrId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }
      if (data.truckingLog.startingMileage) {
        cookieStore.set(
          "startingMileage",
          data.truckingLog.startingMileage.toString(),
          {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
          },
        );
      }
    } else {
      // For LABOR and MECHANIC, set default labor type
      cookieStore.set("laborType", "", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    // Redirect to dashboard
    redirect("/dashboard");
  } catch (error) {
    console.error("Failed to set timesheet cookies:", error);
    // If cookie setting fails, still redirect to dashboard
    redirect("/dashboard");
  }
}
