"use client";
import ReloadBtnSpinner from "@/components/(animations)/reload-btn-spinner";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

type PageHeaderContainerProps = {
  loading: boolean;
  headerText: string;
  descriptionText?: string;
  refetch: () => void;
  children?: React.ReactNode;
  reportPage?: boolean;
  selectedReportId?: string;
};

export const PageHeaderContainer = ({
  headerText,
  descriptionText,
  refetch,
  loading,
  children,
  reportPage = false,
  selectedReportId = undefined,
}: PageHeaderContainerProps) => {
  const { setOpen, open } = useSidebar();
  return (
    <div className="h-full  max-h-12 w-full flex flex-row justify-between gap-4 ">
      <div className="w-full flex flex-row gap-5 ">
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 p-0 hover:bg-slate-500 hover:bg-opacity-20 ${
              open ? "bg-slate-500 bg-opacity-20" : "bg-app-blue "
            }`}
            onClick={() => {
              setOpen(!open);
            }}
          >
            <img
              src={open ? "/condense-white.svg" : "/condense.svg"}
              alt="logo"
              className="w-4 h-auto object-contain "
            />
          </Button>
        </div>

        <div className="flex flex-col">
          {loading ? (
            <Skeleton className="h-6 w-40 mt-1" />
          ) : (
            <p className="text-left w-fit text-base text-white font-bold">
              {headerText}
            </p>
          )}

          {loading ? (
            <Skeleton className="h-4 w-52 mt-1" />
          ) : (
            <p className="text-left text-xs text-white">{descriptionText}</p>
          )}
        </div>
        <div className="flex justify-end items-center ml-auto">
          <div className="flex flex-row gap-2 items-center">
            {children}
            <ReloadBtnSpinner
              isRefreshing={loading}
              fetchData={refetch}
              reportPage={reportPage}
              selectedReportId={selectedReportId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
