// Stores the id for the time sheet that is currently open (waiting to be submitted when you clock out).

"use client";
import React, { createContext, useState, ReactNode, useContext } from "react";

type CommentData = {
  id: string;
};

type CommentDataContextType = {
  savedCommentData: CommentData | null;
  setCommentData: (CommentData: CommentData | null) => void;
};

export const CommentDataContext = createContext<
  CommentDataContextType | undefined
>(undefined);

export const CommentDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [savedCommentData, setCommentDataState] = useState<CommentData | null>(
    () => {
      // Load initial state from localStorage if available
      if (typeof window !== "undefined") {
        const savedTimeSheetJSON = localStorage.getItem("savedCommentData");
        return savedTimeSheetJSON ? JSON.parse(savedTimeSheetJSON) : null;
      } else {
        return null;
      }
    }
  );

  const setCommentData = (CommentData: CommentData | null) => {
    setCommentDataState(CommentData);
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("savedCommentData", JSON.stringify(CommentData));
    } else {
      localStorage.removeItem("savedCommentData");
    }
    return null;
  };

  return (
    <CommentDataContext.Provider value={{ savedCommentData, setCommentData }}>
      {children}
    </CommentDataContext.Provider>
  );
};

export const useCommentData = () => {
  const context = useContext(CommentDataContext);
  if (!context) {
    throw new Error("useCommentData must be used within a CommentDataProvider");
  }
  return context;
};
