import React from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

interface SpinnerProps {
  isRefreshing: boolean;
  fetchData: () => void;
  selectedReportId?: string | undefined;
  reportPage?: boolean;
}
export default function ReloadBtnSpinner({
  isRefreshing,
  fetchData,
  selectedReportId = undefined,
  reportPage = false,
}: SpinnerProps) {
  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="ghost"
              size="icon"
              disabled={isRefreshing}
              className={`h-8 w-8 p-0 hover:bg-slate-500 hover:bg-opacity-20 bg-slate-500 bg-opacity-20`}
              onClick={fetchData}
            >
              <div className="relative">
                <img
                  src={"/statusOngoing-white.svg"}
                  alt="logo"
                  className={`w-4 h-auto object-contain ${isRefreshing ? "animate-spin-custom" : ""}`}
                />
              </div>
            </Button>
          </span>
        </TooltipTrigger>

        {!reportPage && !isRefreshing && (
          <TooltipContent side="left" sideOffset={7}>
            Reload page
          </TooltipContent>
        )}

        {!isRefreshing && selectedReportId && (
          <TooltipContent side="left" sideOffset={7}>
            Reload page
          </TooltipContent>
        )}
        {reportPage && !selectedReportId && (
          <TooltipContent side="left" sideOffset={7}>
            Select a report
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
}
