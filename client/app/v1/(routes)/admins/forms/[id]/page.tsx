"use client";
import { Button } from "@/components/ui/button";
import { use } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExportModal } from "../_components/Table/exportModal";
import EditFormSubmissionModal from "./_component/editFormSubmissionModal";
import CreateFormSubmissionModal from "./_component/CreateFormSubmissionModal";
import Spinner from "@/components/(animations)/spinner";
import useSubmissionDataById from "./_component/hooks/useSubmissionDataById";
import RenderTitleDescriptionStatus from "./_component/RenderTitleDescriptionStatus";
import RenderButtonsAndFilters from "./_component/RenderButtonsAndFilters";
import { FooterPagination } from "../../_pages/FooterPagination";
import { FormSubmissionDataTable } from "./_component/formSubmissionDataTable";

interface PageProps {
  params: Promise<{ id: string }>;
}

const FormPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const {
    inputValue,
    setInputValue,
    page,
    setPage,
    pageSize,
    setPageSize,
    showExportModal,
    setShowExportModal,
    exportDateRange,
    setExportDateRange,
    showDeleteSubmissionDialog,
    setShowDeleteSubmissionDialog,
    showCreateModal,
    setShowCreateModal,
    formTemplate,
    loading,
    showDeleteDialog,
    setShowDeleteDialog,
    actionLoading,
    statusPopoverOpen,
    setStatusPopoverOpen,
    showFormSubmission,
    setShowFormSubmission,
    selectedSubmissionId,
    setSelectedSubmissionId,
    setRefreshKey,
    STATUS_OPTIONS,
    currentStatus,
    openHandleDelete,
    confirmDelete,
    cancelDelete,
    openHandleDeleteSubmission,
    confirmSubmissionDelete,
    cancelSubmissionDelete,
    triggerRerender,
    handleStatusChange,
    handleExport,
    setShowPendingOnly,
    showPendingOnly,
    approvalInbox,
    handleFilterChange,
    onApprovalAction,
  } = useSubmissionDataById(id);
  return (
    <div className="w-full p-4 grid grid-rows-[3rem_2rem_1fr] gap-5">
      <RenderTitleDescriptionStatus
        formTemplate={formTemplate}
        loading={loading}
        setStatusPopoverOpen={setStatusPopoverOpen}
        handleStatusChange={handleStatusChange}
        setRefreshKey={setRefreshKey}
        actionLoading={actionLoading}
        statusPopoverOpen={statusPopoverOpen}
        currentStatus={currentStatus}
        STATUS_OPTIONS={STATUS_OPTIONS}
      />
      <RenderButtonsAndFilters
        setShowExportModal={setShowExportModal}
        openHandleDelete={openHandleDelete}
        formTemplate={formTemplate}
        setShowCreateModal={setShowCreateModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
        setShowPendingOnly={setShowPendingOnly}
        showPendingOnly={showPendingOnly}
        approvalInbox={approvalInbox}
        loading={loading}
        handleFilterChange={handleFilterChange}
      />

      <div className="h-[85vh] rounded-lg w-full relative bg-white overflow-hidden">
        <div className="h-full w-full overflow-auto pb-10">
          <FormSubmissionDataTable
            formTemplate={formTemplate}
            loading={loading}
            page={page}
            pageSize={pageSize}
            inputValue={inputValue}
            setPage={setPage}
            setPageSize={setPageSize}
            setShowFormSubmission={setShowFormSubmission}
            setSelectedSubmissionId={setSelectedSubmissionId}
            openHandleDeleteSubmission={openHandleDeleteSubmission}
            isSignatureRequired={formTemplate?.isSignatureRequired}
            searchTerm={inputValue}
            showPendingOnly={showPendingOnly}
            onApprovalAction={onApprovalAction}
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
              totalPages={loading ? 1 : formTemplate?.totalPages || 1}
              total={loading ? 0 : formTemplate?.total || 0}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          </div>
        </div>
      </div>

      {/* Create Section Modal */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form Template?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this form template? All form data
              will be permanently deleted. This action cannot be undone.
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
      {/* Delete Submission Confirmation Dialog */}
      <Dialog
        open={showDeleteSubmissionDialog}
        onOpenChange={setShowDeleteSubmissionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form Submission?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this form submission? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelSubmissionDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmSubmissionDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showExportModal && (
        <ExportModal
          setDateRange={setExportDateRange}
          dateRange={exportDateRange}
          onClose={() => {
            setShowExportModal(false);
          }}
          onExport={handleExport}
        />
      )}
      {showCreateModal && formTemplate && (
        <CreateFormSubmissionModal
          formTemplate={formTemplate}
          closeModal={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            triggerRerender();
          }}
        />
      )}
      {showFormSubmission && selectedSubmissionId && formTemplate && (
        <EditFormSubmissionModal
          id={selectedSubmissionId}
          formTemplate={formTemplate}
          closeModal={() => setShowFormSubmission(false)}
          onSuccess={() => {
            setShowFormSubmission(false);
            triggerRerender();
          }}
        />
      )}
    </div>
  );
};

export default FormPage;
