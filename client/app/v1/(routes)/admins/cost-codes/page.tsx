"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCostCodeData } from "./_components/useCostCodeData";
import Spinner from "@/components/(animations)/spinner";
import CreateCostCodeModal from "./_components/CreateCostCodeModal";
import EditCostCodeModal from "./_components/EditCostCodeModal";
import { useTagData } from "./_components/useTagData";
import CreateTagModal from "./_components/CreateTagModal";
import EditTagModal from "./_components/EditTagModal";
import SearchBarPopover from "../_pages/searchBarPopover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tags } from "lucide-react";
import { PageHeaderContainer } from "../_pages/PageHeaderContainer";
import { FooterPagination } from "../_pages/FooterPagination";
import CostCodeDataTable from "./_components/ViewAll/CostCodeDataTable";
import TagDataTable from "./_components/ViewAll/TagDataTable";

export default function CostCodePage() {
  const [pageState, setPageState] = useState<"CostCode" | "Tags">("CostCode");
  const {
    loading,
    rerender,
    total,
    page,
    totalPages,
    pageSize,
    setPage,
    setPageSize,
    inputValue,
    setInputValue,
    editCostCodeModal,
    setEditCostCodeModal,
    createCostCodeModal,
    setCreateCostCodeModal,
    pendingEditId,
    showDeleteDialog,
    setShowDeleteDialog,
    openHandleEdit,
    confirmDelete,
    openHandleDelete,
    cancelDelete,
    filteredCostCodes,
    showArchiveDialog,
    setShowArchiveDialog,
    openHandleArchive,
    confirmArchive,
    cancelArchive,
    showRestoreDialog,
    setShowRestoreDialog,
    openHandleRestore,
    confirmRestore,
    cancelRestore,
  } = useCostCodeData();

  const {
    createTagModal,
    setCreateTagModal,
    editTagModal,
    setEditTagModal,
    showDeleteTagDialog,
    setShowDeleteTagDialog,
    pendingTagEditId,
    loading: tagLoading,
    rerender: tagRerender,
    inputValue: searchTag,
    setInputValue: setSearchTag,
    confirmTagDelete,
    cancelTagDelete,
    openHandleTagEdit,
    openHandleTagDelete,
    totalPages: totalPagesTags,
    filteredTags,
    total: totalTags,
  } = useTagData();

  const pageLoading = tagLoading || loading;

  return (
    <div className="w-full p-4 grid grid-rows-[3rem_2rem_1fr] gap-5">
      <PageHeaderContainer
        loading={pageState === "CostCode" ? loading : tagLoading}
        headerText={
          pageState === "CostCode" ? "Cost Code Management" : "Tag Management"
        }
        descriptionText={`Create, edit, and manage 
              ${pageState === "CostCode" ? "Cost Code" : "Tag"} details
              `}
        refetch={pageState === "CostCode" ? rerender : tagRerender}
      />

      <div className="h-10 w-full flex flex-row justify-between">
        {pageState === "CostCode" ? (
          <SearchBarPopover
            term={inputValue}
            handleSearchChange={(e) => setInputValue(e.target.value)}
            placeholder={"Search by name..."}
            textSize="xs"
            imageSize="10"
          />
        ) : (
          <SearchBarPopover
            term={searchTag}
            handleSearchChange={(e) => setSearchTag(e.target.value)}
            placeholder={"Search by name..."}
            textSize="xs"
            imageSize="10"
          />
        )}

        <div className="flex flex-row justify-end w-full gap-2">
          {pageState === "CostCode" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="min-w-12 h-full"
                  onClick={() => setCreateCostCodeModal(true)}
                >
                  <img
                    src="/plus-white.svg"
                    alt="Add CostCode"
                    className="w-4 h-4"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="center" side="top">
                Create Cost Code
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="min-w-12 h-full"
                  onClick={() => setCreateTagModal(true)}
                >
                  <img
                    src="/plus-white.svg"
                    alt="Add CostCode"
                    className="w-4 h-4"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="center" side="top">
                Create Tag
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="min-w-12 h-full"
                size={"icon"}
                onClick={
                  pageState === "CostCode"
                    ? () => setPageState("Tags")
                    : () => setPageState("CostCode")
                }
              >
                {pageState !== "CostCode" ? (
                  <img src="/qrCode-white.svg" alt="Tags" className="w-4 h-4" />
                ) : (
                  <Tags className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent align="center" side="top">
              {pageState === "CostCode" ? "Tags" : "Cost Codes"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="h-[85vh] rounded-lg w-full relative bg-white overflow-hidden">
        <div className="h-full w-full overflow-auto pb-10">
          {filteredTags.length === 0 &&
            pageState === "Tags" &&
            tagLoading === false && (
              <div className="absolute inset-0 z-20 flex flex-row items-center gap-2 justify-center rounded-lg">
                <span className="text-lg text-gray-500">No Results found</span>
              </div>
            )}
          {filteredCostCodes.length === 0 &&
            pageState === "CostCode" &&
            loading === false && (
              <div className="absolute inset-0 z-20 flex flex-row items-center gap-2 justify-center rounded-lg">
                <span className="text-lg text-gray-500">No Results found</span>
              </div>
            )}

          {pageLoading && (
            <div className="absolute inset-0 z-20 flex flex-row items-center gap-2 justify-center bg-white bg-opacity-70 rounded-lg">
              <Spinner size={20} />
              <span className="text-lg text-gray-500">Loading...</span>
            </div>
          )}

          {pageState === "CostCode" ? (
            <CostCodeDataTable
              loading={loading}
              data={filteredCostCodes}
              openHandleDelete={openHandleDelete}
              openHandleEdit={openHandleEdit}
              searchTerm={inputValue}
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
              openHandleArchive={openHandleArchive}
              openHandleRestore={openHandleRestore}
            />
          ) : (
            <TagDataTable
              loading={tagLoading}
              data={filteredTags}
              openHandleDelete={openHandleTagDelete}
              openHandleEdit={openHandleTagEdit}
              searchTerm={inputValue}
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          )}

          {pageState === "CostCode" ? (
            <div className="flex items-center justify-end space-x-2 py-4 ">
              <FooterPagination
                page={loading ? 1 : page}
                totalPages={loading ? 1 : totalPages}
                total={loading ? 1 : total}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            </div>
          ) : (
            <div className="flex items-center justify-end space-x-2 py-4 ">
              <FooterPagination
                page={loading ? 1 : page}
                totalPages={loading ? 1 : totalPagesTags}
                total={loading ? 1 : totalTags}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            </div>
          )}
        </div>
      </div>
      {editCostCodeModal && pendingEditId && (
        <EditCostCodeModal
          cancel={() => setEditCostCodeModal(false)}
          pendingEditId={pendingEditId}
          rerender={rerender}
        />
      )}
      {createCostCodeModal && (
        <CreateCostCodeModal
          cancel={() => setCreateCostCodeModal(false)}
          rerender={rerender}
        />
      )}
      {createTagModal && (
        <CreateTagModal
          cancel={() => setCreateTagModal(false)}
          rerender={tagRerender}
        />
      )}
      {editTagModal && pendingTagEditId && (
        <EditTagModal
          cancel={() => setEditTagModal(false)}
          pendingEditId={pendingTagEditId}
          rerender={tagRerender}
        />
      )}

      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Cost Code</DialogTitle>
            <DialogDescription>
              {`If you archive this Cost Code, it will no longer be available for new timesheets but can be restored later if needed.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelArchive}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmArchive}>
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Cost Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this Cost Code? Restoring a Cost
              Code will make it available for use in future Timesheets.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelRestore}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRestore}>
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cost Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Cost Code? All Cost Code data
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

      <Dialog open={showDeleteTagDialog} onOpenChange={setShowDeleteTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Tag? All Tag data will be
              permanently deleted including Timesheets. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelTagDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmTagDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
