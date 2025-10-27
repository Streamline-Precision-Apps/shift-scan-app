"use client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { TimesheetDataTable } from "./_components/ViewAll/TimesheetDataTable";
import { CreateTimesheetModal } from "./_components/Create/CreateTimesheetModal";
import { EditTimesheetModal } from "./_components/Edit/EditTimesheetModal";
import { ExportModal } from "./_components/Export/ExportModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SearchBarPopover from "../_pages/searchBarPopover";
import { Badge } from "@/components/ui/badge";
import useAllTimeSheetData from "./_components/useAllTimeSheetData";
import { PageHeaderContainer } from "../_pages/PageHeaderContainer";
import { FooterPagination } from "../_pages/FooterPagination";
import Spinner from "@/components/(animations)/spinner";
import { useSearchParams } from "next/navigation";
import TimesheetFilters from "./_components/ViewAll/TimesheetFilters";

export default function AdminTimesheets() {
  const searchParams = useSearchParams();

  const jobsiteId = searchParams.get("jobsiteId");
  const costCode = searchParams.get("costCode");
  const id = searchParams.get("id");
  const notificationId = searchParams.get("notificationId");
  const equipmentId = searchParams.get("equipmentId");
  const {
    inputValue,
    setInputValue,
    loading,
    page,
    setPage,
    totalPages,
    total,
    pageSize,
    pageSizeOptions,
    setPageSize,
    showCreateModal,
    setShowCreateModal,
    deletingId,
    isDeleting,
    setIsDeleting,
    showEditModal,
    setShowEditModal,
    editingId,
    setEditingId,
    approvalInbox,
    showPendingOnly,
    setShowPendingOnly,
    exportModal,
    setExportModal,
    statusLoading,
    sortedTimesheets,
    rerender,
    handleApprovalAction,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handlePageSizeChange,
    handleExport,
    setFilters,
    reFilterPage,
    costCodes,
    jobsites,
    equipment,
    filters,
    notificationIds,
    setNotificationIds,
    handleClearFilters,
    crew,
    users,
    exportFileName,
    setExportFileName,
  } = useAllTimeSheetData({
    jobsiteId,
    costCode,
    id,
    notificationId,
    equipmentId,
  });

  return (
    <div className="w-full p-4 grid grid-rows-[3rem_2rem_1fr] gap-5">
      <PageHeaderContainer
        loading={loading}
        headerText="Timesheets Management"
        descriptionText="Create, manage, and track timesheets"
        refetch={() => {
          rerender();
        }}
      />
      <div className="h-10 w-full flex flex-row justify-between gap-4">
        <div className="flex flex-row w-full gap-2">
          <SearchBarPopover
            term={inputValue}
            handleSearchChange={(e) => setInputValue(e.target.value)}
            placeholder={"Search by id, name, profit id, or cost code... "}
            textSize="xs"
            imageSize="10"
          />

          <div className="w-full min-w-[40px] max-h-10 flex flex-row">
            <TimesheetFilters
              filters={filters}
              onFilterChange={setFilters}
              setFilters={setFilters}
              onUseFiltersChange={reFilterPage}
              jobsites={jobsites}
              costCodes={costCodes}
              equipment={equipment}
              handleClearFilters={handleClearFilters}
            />
          </div>
        </div>
        <div className="w-full h-full flex flex-row justify-end items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setExportModal(true)}
                size={"icon"}
                className=" relative border-none hover:bg-gray-800 min-w-12 h-full  text-white"
              >
                <div className="flex w-fit h-fit flex-row items-center">
                  <img
                    src="/export-white.svg"
                    alt="Export"
                    className="h-4 w-4"
                  />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent align="start" side="top">
              Export
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={"icon"}
                className=" relative border-none hover:bg-gray-800 min-w-12 h-full  text-white"
                onClick={() => setShowCreateModal(true)}
              >
                <div className="flex w-fit h-fit flex-row items-center">
                  <img
                    src="/plus-white.svg"
                    alt="Create New Form"
                    className="h-4 w-4"
                  />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Create Timesheet</TooltipContent>
          </Tooltip>

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
              Timecard Approval
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="h-[85vh] rounded-lg w-full relative bg-white overflow-hidden">
        <div className="h-full w-full overflow-auto pb-10">
          <TimesheetDataTable
            data={sortedTimesheets}
            showPendingOnly={showPendingOnly}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={setPage}
            onDeleteClick={handleDeleteClick}
            deletingId={deletingId}
            isDeleting={isDeleting}
            onEditClick={(id: number) => {
              setEditingId(id);
              setShowEditModal(true);
            }}
            onApprovalAction={handleApprovalAction}
            statusLoading={statusLoading}
            searchTerm={inputValue}
            setPage={setPage}
          />
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-row items-center gap-2 justify-center bg-white bg-opacity-70 rounded-lg">
              <Spinner size={20} />
              <span className="text-lg text-gray-500">Loading...</span>
            </div>
          )}
          <div className="flex items-center justify-end space-x-2 py-4 ">
            <FooterPagination
              page={loading ? 1 : page}
              totalPages={loading ? 1 : totalPages}
              total={loading ? 0 : total}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          </div>
        </div>
      </div>

      {/*Modal Section*/}
      {showCreateModal && (
        <CreateTimesheetModal
          onClose={() => setShowCreateModal(false)}
          onCreated={rerender}
        />
      )}
      {/* Export Modal */}
      {exportModal && (
        <ExportModal
          onClose={() => setExportModal(false)}
          onExport={handleExport}
          crew={crew}
          users={users}
          profitCenters={jobsites}
          exportFileName={exportFileName}
          setExportFileName={setExportFileName}
        />
      )}
      {/* ...existing code... */}
      {showEditModal && editingId && (
        <EditTimesheetModal
          timesheetId={editingId}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={rerender}
          notificationIds={notificationIds}
          setNotificationIds={setNotificationIds}
        />
      )}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timesheet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timesheet? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
