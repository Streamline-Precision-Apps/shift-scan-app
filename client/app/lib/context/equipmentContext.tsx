// Stores the data for the equipment.

"use client";
import React, { createContext, useState, ReactNode, useContext } from "react";

type ScanDataEQContextProps = {
  scanEQResult: scanEQResult | null;
  setscanEQResult: (result: scanEQResult | null) => void;
};

type scanEQResult = {
  data: string;
};

const ScanDataEQContext = createContext<ScanDataEQContextProps | undefined>(
  undefined
);

export const ScanDataEQProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [scanEQResult, setscanEQResult] = useState<scanEQResult | null>(null);

  return (
    <ScanDataEQContext.Provider value={{ scanEQResult, setscanEQResult }}>
      {children}
    </ScanDataEQContext.Provider>
  );
};

export const useEQScanData = () => {
  const context = useContext(ScanDataEQContext);
  if (context === undefined) {
    throw new Error("useScanData must be used within a ScanDataProvider");
  }
  return context;
};
