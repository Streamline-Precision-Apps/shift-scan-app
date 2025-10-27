"use client";
import React, { useEffect, useState } from "react";
import "@/app/globals.css";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthStep } from "@/app/api/auth";
import { useTranslations } from "next-intl";
import prisma from "@/lib/prisma";
import { useSession } from "next-auth/react";

export default function Log() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buttonType = searchParams.get("bt");
  const t = useTranslations("clock-out");
  const session = useSession();
  const userId = session?.data?.user?.id;

  const [error, setError] = useState<string | null>(null);
  const [hasEquipmentCheckedOut, setHasEquipmentCheckedOut] = useState<
    boolean | null
  >(null);

  // TODO: Update this to use an API route instead.
  useEffect(() => {
    const fetchLogs = async () => {
      const currentDate = new Date();
      const past24Hours = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

      const logs = await prisma.employeeEquipmentLog.findMany({
        where: {
          // No valid filters available in Prisma schema, fetch all logs
        },
        include: {
          Equipment: true,
          TimeSheet: true,
        },
      });

      // After fetching, filter logs by userId and startTime in JS
      const filteredLogs = logs.filter(
        (log) =>
          log.TimeSheet?.userId === userId &&
          log.startTime <= currentDate &&
          log.startTime >= past24Hours
      );
      setHasEquipmentCheckedOut(filteredLogs.length > 0);
    };

    fetchLogs();
  }, [userId]);

  const handleContinue = async () => {
    try {
      if (buttonType === "b") {
        setAuthStep("break");
        router.push("/");
      } else if (buttonType === "ewd") {
        router.push("/dashboard/clock-out/");
      } else {
        setError("Invalid button type. Unable to continue.");
      }
    } catch (err) {
      console.error("Navigation error:", err);
      setError(t("NavError"));
    }
  };

  useEffect(() => {
    if (hasEquipmentCheckedOut === false) {
      handleContinue();
    }
  }, [hasEquipmentCheckedOut, handleContinue]);

  const handleReturnToDashboard = async () => {
    try {
      router.push("/dashboard");
    } catch (err) {
      console.error("Navigation error:", err);
      setError(t("NavError"));
    }
  };

  const handleGoToCurrentEquipment = async () => {
    try {
      router.push("/dashboard/equipment/current");
    } catch (err) {
      console.error("Navigation error:", err);
      setError(t("NavError"));
    }
  };

  if (hasEquipmentCheckedOut === null) {
    return <div>Loading...</div>; // Add a loading state
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-3xl font-bold">{t("EquipmentVerification")}</h1>
      {error && <div className="text-red-500">{error}</div>}
      {hasEquipmentCheckedOut ? (
        <>
          <p>You still have equipment checked out.</p>
          <div className="w-1/4">
            <button
              className="bg-app-red text-black font-bold text-xl flex justify-center w-full py-4 border border-gray-400 rounded-sm"
              onClick={handleReturnToDashboard}
            >
              {t("Return")}
            </button>
            <button
              className="bg-app-green text-black font-bold text-xl flex justify-center w-full py-4 border border-gray-400 rounded-sm mt-2"
              onClick={handleGoToCurrentEquipment}
            >
              Go to Current Equipment
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
