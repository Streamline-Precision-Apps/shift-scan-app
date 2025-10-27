"use client";
import React, { createContext, useContext } from "react";
import useFcmToken from "@/hooks/useFcmToken";

interface FcmContextValue {
  token: string | null;
  notificationPermissionStatus: NotificationPermission | null;
}

const FcmContext = createContext<FcmContextValue | undefined>(undefined);

export const FcmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, notificationPermissionStatus } = useFcmToken();

  return (
    <FcmContext.Provider value={{ token, notificationPermissionStatus }}>
      {children}
    </FcmContext.Provider>
  );
};

export function useFcmContext() {
  const context = useContext(FcmContext);
  if (!context) {
    throw new Error("useFcmContext must be used within a FcmProvider");
  }
  return context;
}
