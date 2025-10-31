"use client";
import React, { createContext, useState, ReactNode, useContext } from "react";

type CurrentViewProps = {
  currentView: string | null;
  setCurrentView: (currentView: string | null) => void;
};

const CurrentView = createContext<CurrentViewProps | undefined>(undefined);

export const CurrentViewProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentView, setCurrentViewState] = useState<string | null>(() => {
    // Load initial state from localStorage if available
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("currentView");
      return savedView ? savedView : null;
    } else {
      return null;
    }
  });

  const setCurrentView = (view: string | null) => {
    setCurrentViewState(view);
    // Save to localStorage
    if (typeof window !== "undefined") {
      if (view) {
        localStorage.setItem("currentView", view);
      } else {
        localStorage.removeItem("currentView");
      }
    }
  };

  return (
    <CurrentView.Provider value={{ currentView, setCurrentView }}>
      {children}
    </CurrentView.Provider>
  );
};

export const useCurrentView = () => {
  const context = useContext(CurrentView);
  if (!context) {
    throw new Error(
      "useCurrentView must be used within a CurrentViewProvider"
    );
  }
  return context;
};
