"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useJobsiteData } from "./_components/useJobsiteData";
import EditJobsiteModal from "./_components/EditJobsiteModal";
import CreateJobsiteModal from "./_components/CreateJobsiteModal";
import Spinner from "@/components/(animations)/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SearchBarPopover from "../_pages/searchBarPopover";
import { PageHeaderContainer } from "../_pages/PageHeaderContainer";
import { FooterPagination } from "../_pages/FooterPagination";
import { JobsiteDataTable } from "./_components/ViewAll/JobsiteDataTable";

export default function JobsitePage() {
  const searchParams = useSearchParams();

  // Check URL parameters before initializing the hook
  const isPendingApproval = searchParams.get("isPendingApproval") === "true";
  const notificationId = searchParams.get("notificationId");

  const {
    searchTerm,
    setSearchTerm,
    loading,
    rerender,
    total,
    page,
    pageSize,
    setPage,
    setPageSize,
    showPendingOnly,
    setShowPendingOnly,
    editJobsiteModal,
    setEditJobsiteModal,
    createJobsiteModal,
    setCreateJobsiteModal,
    showDeleteDialog,
    setShowDeleteDialog,
    pendingEditId,
    openHandleEdit,
    openHandleDelete,
    openHandleQr,
    confirmDelete,
    cancelDelete,
    pendingCount,
    totalPages,
    paginatedJobsites,
    // Archive functionality
    showArchiveDialog,
    setShowArchiveDialog,
    pendingArchiveId,
    openHandleArchive,
    confirmArchive,
    cancelArchive,
    // Restore functionality
    showRestoreDialog,
    setShowRestoreDialog,
    pendingRestoreId,
    openHandleRestore,
    confirmRestore,
    cancelRestore,
  } = useJobsiteData(isPendingApproval); // Pass initial state to hook

  // Handle notification ID if present
  return (
    <div className="w-full p-4 grid grid-rows-[3rem_2rem_1fr] gap-5">
      <PageHeaderContainer
        loading={loading}
        headerText="Jobsite Management"
        descriptionText="Create, edit, and manage jobsite details"
        refetch={() => {
          rerender();
        }}
      />
      <div className="h-10 w-full flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <SearchBarPopover
            term={searchTerm}
            handleSearchChange={(e) => setSearchTerm(e.target.value)}
            placeholder={"Search by name or client..."}
            textSize="xs"
            imageSize="10"
          />
        </div>

        <div className="flex flex-row justify-end w-full gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={"icon"}
                onClick={() => setCreateJobsiteModal(true)}
                className="min-w-12 h-full"
              >
                <img
                  src="/plus-white.svg"
                  alt="Add Jobsite"
                  className="w-4 h-4"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="start" side="top">
              Create Jobsite
            </TooltipContent>
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

                  {pendingCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-0.5 text-xs rounded-full">
                      {pendingCount}
                    </Badge>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" side="top">
              Jobsite Approval
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="h-[85vh] rounded-lg w-full relative bg-white overflow-hidden">
        <div className="h-full w-full overflow-auto pb-10 border border-slate-200 rounded-t-lg">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-row items-center gap-2 justify-center bg-white bg-opacity-70 rounded-lg">
              <Spinner size={20} />
              <span className="text-lg text-gray-500">Loading...</span>
            </div>
          )}
          <JobsiteDataTable
            data={paginatedJobsites}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            searchTerm={searchTerm}
            setPage={setPage}
            setPageSize={setPageSize}
            onEditClick={openHandleEdit}
            onDeleteClick={openHandleDelete}
            onQrClick={openHandleQr}
            onArchiveClick={openHandleArchive}
            onRestoreClick={openHandleRestore}
            showPendingOnly={showPendingOnly}
          />
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <FooterPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </div>
      </div>
      {editJobsiteModal && pendingEditId && (
        <EditJobsiteModal
          cancel={() => setEditJobsiteModal(false)}
          pendingEditId={pendingEditId}
          rerender={rerender}
        />
      )}
      {createJobsiteModal && (
        <CreateJobsiteModal
          cancel={() => setCreateJobsiteModal(false)}
          rerender={rerender}
        />
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Jobsite</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this jobsite? All jobsite data
              will be permanently deleted including Timesheets. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Jobsite</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this jobsite? The jobsite will be
              marked as archived and will no longer be available for new
              timesheets. Existing timesheets will remain accessible. This
              action can be undone by restoring the jobsite.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelArchive}>
              Cancel
            </Button>
            <Button onClick={confirmArchive}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Jobsite</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this jobsite? The jobsite will be
              reactivated and will be available for new timesheets again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelRestore}>
              Cancel
            </Button>
            <Button onClick={confirmRestore}>Restore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
