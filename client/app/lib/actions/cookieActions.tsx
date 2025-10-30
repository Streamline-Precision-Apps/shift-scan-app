"use client";

import { apiRequest } from "../utils/api-Utils";

type Options = {
  label: string;
  code: string;
};
export async function getCookies({ cookieName }: { cookieName: string }) {
  try {
    const res = await apiRequest(
      `/api/cookies?name=${encodeURIComponent(cookieName)}`,
      "GET"
    );
    return res.value;
  } catch (error) {
    console.error("Failed to get cookie:", error);
    return null;
  }
}
/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
LOCALE COOKIES
- setting the cookie for locale to either es or en for spanish or english in app
-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
*/
export async function setLocale(isSpanish: boolean) {
  try {
    const localeValue = isSpanish ? "es" : "en";
    console.log("📝 setLocale API call - setting to:", localeValue);

    const response = await apiRequest("/api/cookies", "POST", {
      name: "locale",
      value: localeValue,
      options: {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    });

    console.log("✅ setLocale API response:", response);

    // Verify cookie was actually set in the browser
    if (typeof window !== "undefined") {
      const locale = document.cookie
        .split("; ")
        .find((row) => row.startsWith("locale="));
      console.log(
        "🔍 Locale cookie in browser after set:",
        locale || "(not found yet)"
      );
    }

    return response;
  } catch (error) {
    console.error("❌ Failed to set locale cookie:", error);
    throw error;
  }
}

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

Dashboard Access COOKIES
- setting the cookie for workRole to either mechanic, tasco, truck, general
- deleting the cookie for workRole to either mechanic, tasco, truck, general
- setting the cookie for dashboard access to true or false
- cookie for setting job site access
- cookie for setting cost code access
- cookie for setting time sheet access

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
*/
// setting the cookie for workRole to either mechanic, tasco, truck, general
export async function setWorkRole(workRole: string) {
  if (
    workRole !== "mechanic" &&
    workRole !== "tasco" &&
    workRole !== "truck" &&
    workRole !== "general" &&
    workRole !== ""
  ) {
    throw new Error("Not Authorized - Invalid Work Role");
  }
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "workRole",
      value: workRole,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

export async function setLaborType(laborType: string) {
  const VALID_LABOR_TYPES = [
    "truckDriver",
    "truckEquipmentOperator",
    "truckLabor",
    "mechanic",
    "general",
    "tascoAbcdLabor",
    "tascoAbcdEquipment",
    "tascoEEquipment",
    "",
  ];
  if (!VALID_LABOR_TYPES.includes(laborType)) {
    throw new Error("Not Authorized - Invalid labor type");
  }
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "laborType",
      value: laborType === "tascoEEquipment" ? "" : laborType,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

// deletes the cookie for workRole to either mechanic, tasco, truck, general
export async function RemoveWorkRole() {
  try {
    await apiRequest(`/api/cookies?name=workRole`, "DELETE");
  } catch (error) {
    console.error("Failed to delete locale cookie:", error);
  }
}

// idea of this cookie is to set it to true if the user has access to the dashboard and false if not
export async function setCurrentPageView(currentPageView: string) {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "currentPageView",
      value: currentPageView,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

export async function setProfilePicture(profilePicture: string) {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "profilePicture",
      value: profilePicture,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

// cookie for setting job site access
export async function setJobSite(jobSite: Options | null) {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "jobSite",
      value: `${jobSite?.code}|${jobSite?.label}`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

export async function setCostCode(costCode: string) {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "costCode",
      value: costCode,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

export async function setEquipment(equipment: string) {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "equipment",
      value: equipment,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}
export async function setTruck(truck: string) {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "truckId",
      value: truck,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

export async function setMechanicProjectID(mechanicProjectID: string) {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "mechanicProjectID",
      value: mechanicProjectID,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

export async function setStartingMileage(startingMileage: string) {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "startingMileage",
      value: startingMileage,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

export async function setPrevTimeSheet(timeSheetId: string) {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "timeSheetId",
      value: timeSheetId,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

ADMIN ACCESS COOKIES

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
*/
// a function to set the cookie for admin access
export async function setAdminAccess() {
  try {
    await apiRequest("/api/cookies", "POST", {
      name: "adminAccess",
      value: "true",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Failed to set locale cookie:", error);
  }
}

// a function to remove the cookie for admin access
export async function RemoveAdminAccess() {
  try {
    await apiRequest(`/api/cookies?name=adminAccess`, "DELETE");
  } catch (error) {
    console.error("Failed to delete locale cookie:", error);
  }
}
