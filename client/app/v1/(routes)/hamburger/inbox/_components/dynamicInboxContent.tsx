"use client";
import { useState, Dispatch, SetStateAction } from "react";
import FormSelection from "./formSelection";
import RTab from "./recieved";

export default function DynamicInboxContent({
  activeTab,
  setActiveTab,
  isManager,
}: {
  activeTab: number;
  setActiveTab: Dispatch<SetStateAction<number>>;
  isManager: boolean;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <>
      {activeTab === 1 ? (
        <FormSelection
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          loading={loading}
          setLoading={setLoading}
          isManager={isManager}
        />
      ) : activeTab === 3 ? (
        <RTab isManager={isManager} />
      ) : null}
    </>
  );
}
