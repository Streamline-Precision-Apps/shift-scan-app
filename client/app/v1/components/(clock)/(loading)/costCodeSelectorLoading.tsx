"use client";
import React from "react";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Skeleton } from "@/components/ui/skeleton";

export default function CostCodeSelectorLoading() {
  return (
    <Grids rows={"8"} className="h-full w-full">
      {/* Search bar skeleton */}
      <Holds className="row-span-1 h-full">
        <div className="h-full w-full border-[3px] border-b-none border-black rounded-[10px] rounded-b-none flex justify-center items-center bg-white">
          <Skeleton className="h-6 w-32 bg-gray-200" />
        </div>
      </Holds>

      {/* Options list skeleton */}
      <Holds
        background={"darkBlue"}
        className="row-start-2 row-end-9 h-full border-[3px] border-black rounded-[10px] rounded-t-none overflow-hidden p-2"
      >
        <div className="space-y-2 h-full">
          {/* Loading spinner area */}
          <div className="h-full w-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-6 w-6 text-white mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-white text-lg">Loading...</p>
            </div>
          </div>
        </div>
      </Holds>
    </Grids>
  );
}
