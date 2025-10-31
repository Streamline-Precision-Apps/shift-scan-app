"use client";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

// Define notification types
type NotificationType = "error" | "success" | "neutral";

type NotificationProps = {
  notification: string | null;
  type: NotificationType; // Add type to indicate the state
  setNotification: (
    notification: string | null,
    type?: NotificationType,
  ) => void;
};

const Notification = createContext<NotificationProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notification, setNotificationState] = useState<string | null>(null);
  const [type, setType] = useState<NotificationType>("neutral");

  const setNotification = (
    message: string | null,
    stateType: NotificationType = "neutral",
  ) => {
    setNotificationState(message);
    setType(stateType);

    // Save to localStorage (optional, can be removed if not needed)
    if (typeof window !== "undefined") {
      if (message) {
        localStorage.setItem(
          "notification",
          JSON.stringify({ message, stateType }),
        );
      } else {
        localStorage.removeItem("notification");
      }
    }
  };

  // Automatically clear the notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotificationState(null);
        setType("neutral"); // Reset to neutral after clearing
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <Notification.Provider value={{ notification, type, setNotification }}>
      {children}
    </Notification.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(Notification);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
