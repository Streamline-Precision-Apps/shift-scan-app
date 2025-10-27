"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dispatch, SetStateAction } from "react";
import { FormIndividualTemplate } from "./hooks/types";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderContainer } from "../../../_pages/PageHeaderContainer";

interface PageProps {
  formTemplate: FormIndividualTemplate | undefined;
  loading: boolean;
  setStatusPopoverOpen: Dispatch<SetStateAction<boolean>>;
  handleStatusChange: (
    status: "ACTIVE" | "ARCHIVED" | "DRAFT",
  ) => Promise<void>;
  setRefreshKey: Dispatch<SetStateAction<number>>;
  actionLoading: "archive" | "publish" | "draft" | null;
  statusPopoverOpen: boolean;
  currentStatus: {
    value: string;
    label: string;
    color: string;
  } | null;
  STATUS_OPTIONS: {
    value: string;
    label: string;
    color: string;
  }[];
}

export default function RenderTitleDescriptionStatus({
  formTemplate,
  loading,
  setStatusPopoverOpen,
  handleStatusChange,
  setRefreshKey,
  actionLoading,
  statusPopoverOpen,
  currentStatus,
  STATUS_OPTIONS,
}: PageProps) {
  if (loading || !formTemplate) {
    return (
      <PageHeaderContainer
        loading={loading}
        headerText=""
        refetch={() => {
          setRefreshKey((key) => key + 1);
        }}
      >
        <p className="text-white text-sm">Current Status: </p>

        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 min-w-[120px] `}
          disabled={actionLoading !== null}
        >
          <span
            className={`inline-block w-3 h-3 rounded-full bg-gray-300 border border-gray-300`}
          />
          <Skeleton className="h-3 w-8 inline-block align-middle" />

          <svg
            className="w-3 h-3 ml-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
      </PageHeaderContainer>
    );
  }
  return (
    <PageHeaderContainer
      loading={loading}
      headerText={formTemplate.name}
      descriptionText="Review and manage all form submissions."
      refetch={() => {
        setRefreshKey((key) => key + 1);
      }}
    >
      {formTemplate && (
        <>
          <p className="text-white text-sm">Current Status: </p>
          <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 min-w-[120px] `}
                disabled={actionLoading !== null}
              >
                <span
                  className={`inline-block w-3 h-3 rounded-full ${currentStatus?.color} border border-gray-300`}
                />
                <span className="font-semibold text-xs">
                  {actionLoading
                    ? actionLoading === "archive"
                      ? "Archiving..."
                      : actionLoading === "publish"
                        ? "Publishing..."
                        : "Updating..."
                    : currentStatus?.label}
                </span>
                <svg
                  className="w-3 h-3 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-0">
              <div className="py-1">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    className={`flex items-center w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${
                      formTemplate.isActive === status.value ? "bg-gray-50" : ""
                    }`}
                    onClick={() =>
                      handleStatusChange(
                        status.value as "ACTIVE" | "ARCHIVED" | "DRAFT",
                      )
                    }
                    disabled={
                      formTemplate.isActive === status.value ||
                      actionLoading !== null
                    }
                  >
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${status.color} border border-gray-300`}
                    />
                    <span className="font-semibold flex-1">{status.label}</span>

                    {formTemplate.isActive === status.value && (
                      <svg
                        className="w-4 h-4 ml-2 text-emerald-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </PageHeaderContainer>
  );
}
