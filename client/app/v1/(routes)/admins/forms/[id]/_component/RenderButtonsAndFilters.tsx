"use clients";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SearchBarPopover from "../../../_pages/searchBarPopover";
import { Dispatch, SetStateAction } from "react";
import { FormIndividualTemplate } from "./hooks/types";
import FormSubmissionFilters from "./form-submission-filters";
import { useRouter } from "next/navigation";

interface PageProps {
  setShowExportModal: Dispatch<SetStateAction<boolean>>;
  openHandleDelete: (id: string) => void;
  formTemplate: FormIndividualTemplate | undefined;
  setShowCreateModal: Dispatch<SetStateAction<boolean>>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  setShowPendingOnly: Dispatch<SetStateAction<boolean>>;
  showPendingOnly: boolean;
  approvalInbox: number;
  loading: boolean;
  handleFilterChange: (newFilter: {
    dateRange: {
      from?: Date | undefined;
      to?: Date | undefined;
    };
    status: string;
  }) => void;
}

export default function RenderButtonsAndFilters({
  setShowExportModal,
  openHandleDelete,
  formTemplate,
  setShowCreateModal,
  inputValue,
  setInputValue,
  setShowPendingOnly,
  showPendingOnly,
  approvalInbox,
  loading,
  handleFilterChange,
}: PageProps) {
  const router = useRouter();
  return (
    <div className="h-fit max-h-12  w-full flex flex-row justify-between gap-2 mb-2 ">
      <div className="w-full flex flex-row gap-2 ">
        <Button
          onClick={() => router.push("/admins/forms")}
          variant="outline"
          size="sm"
          className="h-full w-10 p-2.5 text-xs"
        >
          <img
            src="/arrowBack.svg"
            alt="back"
            className="w-5 h-auto object-contain"
          />
        </Button>

        <SearchBarPopover
          term={inputValue}
          handleSearchChange={(e) => setInputValue(e.target.value)}
          placeholder={"Search forms by name..."}
          textSize="xs"
          imageSize="10"
        />
        <FormSubmissionFilters onFilterChange={handleFilterChange} />
      </div>
      <div className="flex justify-center items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setShowExportModal(true);
              }}
              variant={"default"}
              size={"icon"}
              className="rounded-lg h-full hover:bg-slate-800 min-w-12 "
            >
              <img
                src="/export-white.svg"
                alt="Export Form"
                className="h-4 w-4 "
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={2} side="top" align="center">
            <p className="text-xs">Export</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex justify-center items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setShowCreateModal(true);
              }}
              variant={"default"}
              size={"icon"}
              className="rounded-lg h-full hover:bg-slate-800 min-w-12"
            >
              <img
                src="/plus-white.svg"
                alt="Export Form"
                className="h-4 w-4"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={2} side="top" align="center">
            <p className="text-xs">Create</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex justify-center items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              onClick={() => setShowPendingOnly(!showPendingOnly)}
              className={`relative border-none min-w-16 h-full  bg-gray-900 hover:bg-gray-800 text-white ${
                showPendingOnly ? "ring-2 ring-red-400" : ""
              }`}
            >
              <div className="flex flex-row items-center">
                <img
                  src="/inbox-white.svg"
                  alt="Approval"
                  className="h-4 w-4"
                />
                {/* <p className="text-white text-sm font-extrabold">Approval</p> */}
                {Number(approvalInbox) > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-0.5 text-xs rounded-full">
                    {approvalInbox}
                  </Badge>
                )}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent align="end" side="top">
            Form Approval
          </TooltipContent>
        </Tooltip>
      </div>
      {/* Hide Delete Template if there are forms created for this template */}
      {!(
        formTemplate &&
        Array.isArray(formTemplate.Submissions) &&
        formTemplate.Submissions.length > 0
      ) &&
        !showPendingOnly &&
        !loading && (
          <div className="flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"destructive"}
                  className="rounded-lg h-full hover:none min-w-12"
                  onClick={() => {
                    if (formTemplate) {
                      openHandleDelete(formTemplate.id);
                    }
                  }}
                >
                  <img src="/trash.svg" alt="Delete Form" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={2} side="top" align="center">
                <p className="text-xs">Delete Template</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
    </div>
  );
}
