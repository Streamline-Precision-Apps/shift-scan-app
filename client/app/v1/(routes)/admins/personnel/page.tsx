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
import Spinner from "@/components/(animations)/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SearchBarPopover from "../_pages/searchBarPopover";
import { usePersonnelData } from "./_components/usePersonnelData";
import CreateUserModal from "./_components/createUser";
import EditUserModal from "./_components/editUser";
import { PageHeaderContainer } from "../_pages/PageHeaderContainer";
import { FooterPagination } from "../_pages/FooterPagination";
import { PersonnelDataTable } from "./_components/PersonnelDataTable";
import { CrewDataTable } from "./_components/ViewAll/CrewDataTable";
import { useCrewsData } from "./_components/useCrewsData";
import CreateCrewModal from "./_components/createCrewModal";
import EditCrewModal from "./_components/editCrewModal";
import PersonnelFilters from "./_components/PersonnelFilters";
import { Users, User } from "lucide-react";

export default function PersonnelPage() {
  const [pageState, setPageState] = useState<"Personnel" | "Crews">(
    "Personnel",
  );

  const {
    loading,
    personnelDetails,
    rerender,
    total,
    totalPages,
    page,
    pageSize,
    setPage,
    setPageSize,
    showInactive,
    searchTerm,
    setSearchTerm,
    editUserModal,
    setEditUserModal,
    createUserModal,
    setCreateUserModal,
    showDeleteDialog,
    setShowDeleteDialog,
    openHandleEdit,
    openHandleDelete,
    confirmDelete,
    cancelDelete,
    pendingEditId,
    // Filter functionality
    useFilters,
    setUseFilters,
    filters,
    setFilters,
    appliedFilters,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
  } = usePersonnelData();

  const {
    loading: crewLoading,
    crew,
    total: crewTotal,
    totalPages: crewTotalPages,
    page: crewPage,
    pageSize: crewPageSize,
    setPage: setCrewPage,
    setPageSize: setCrewPageSize,
    showInactive: crewShowInactive,
    searchTerm: crewSearchTerm,
    setSearchTerm: setCrewSearchTerm,
    rerender: crewRerender,
    editCrewModal,
    setEditCrewModal,
    createCrewModal,
    setCreateCrewModal,
    pendingEditId: crewPendingEditId,
    showDeleteDialog: crewShowDeleteDialog,
    setShowDeleteDialog: setCrewShowDeleteDialog,
    openHandleEdit: crewOpenHandleEdit,
    openHandleDelete: crewOpenHandleDelete,
    confirmDelete: crewConfirmDelete,
    cancelDelete: crewCancelDelete,
  } = useCrewsData();

  const pageLoading = loading || crewLoading;

  // Helper variables for current page state
  const currentSearchTerm =
    pageState === "Personnel" ? searchTerm : crewSearchTerm;
  const setCurrentSearchTerm =
    pageState === "Personnel" ? setSearchTerm : setCrewSearchTerm;
  const currentLoading = pageState === "Personnel" ? loading : crewLoading;
  const currentRerender = pageState === "Personnel" ? rerender : crewRerender;

  return (
    <div className="w-full p-4 grid grid-rows-[3rem_2rem_1fr] gap-5">
      <PageHeaderContainer
        loading={pageLoading}
        headerText={
          pageState === "Personnel" ? "Personnel Management" : "Crew Management"
        }
        descriptionText={
          pageState === "Personnel"
            ? "Create, edit, and manage personnel details"
            : "Create, edit, and manage crew details"
        }
        refetch={currentRerender}
      />

      <div className="h-10 w-full flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <SearchBarPopover
            term={currentSearchTerm}
            handleSearchChange={(e) => setCurrentSearchTerm(e.target.value)}
            placeholder={
              pageState === "Personnel"
                ? "Search by name, username, or number..."
                : "Search crews..."
            }
            textSize="xs"
            imageSize="10"
          />
          {pageState === "Personnel" && (
            <PersonnelFilters
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              onUseFiltersChange={setUseFilters}
              filters={filters}
              appliedFilters={appliedFilters}
              setFilters={setFilters}
              handleClearFilters={handleClearFilters}
            />
          )}
        </div>

        <div className="flex flex-row justify-end w-full gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="min-w-12 h-full"
                onClick={() =>
                  pageState === "Personnel"
                    ? setCreateUserModal(true)
                    : setCreateCrewModal(true)
                }
              >
                <img
                  src="/plus-white.svg"
                  alt={pageState === "Personnel" ? "Add User" : "Add Crew"}
                  className="w-4 h-4"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="center" side="top">
              {pageState === "Personnel" ? "Create User" : "Create Crew"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="min-w-12 h-full"
                size={"icon"}
                onClick={
                  pageState === "Personnel"
                    ? () => setPageState("Crews")
                    : () => setPageState("Personnel")
                }
              >
                {pageState !== "Personnel" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent align="center" side="top">
              {pageState === "Personnel" ? "Crews" : "Personnel"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="h-[85vh] rounded-lg w-full relative bg-white overflow-hidden">
        {/* Loading overlay */}
        {currentLoading && (
          <div className="absolute inset-0 z-20 flex flex-row items-center gap-2 justify-center bg-white bg-opacity-70 rounded-lg">
            <Spinner size={20} />
            <span className="text-lg text-gray-500">Loading...</span>
          </div>
        )}
        <div className="h-full w-full overflow-auto pb-10 border border-slate-200 rounded-t-lg">
          {pageState === "Personnel" ? (
            <PersonnelDataTable
              data={personnelDetails}
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
              showInactive={showInactive}
            />
          ) : (
            <CrewDataTable
              data={crew}
              loading={crewLoading}
              page={crewPage}
              totalPages={crewTotalPages}
              total={crewTotal}
              pageSize={crewPageSize}
              searchTerm={crewSearchTerm}
              setPage={setCrewPage}
              setPageSize={setCrewPageSize}
              onEditClick={crewOpenHandleEdit}
              onDeleteClick={crewOpenHandleDelete}
              showInactive={crewShowInactive}
            />
          )}
        </div>
        {pageState === "Personnel" && totalPages > 1 && (
          <FooterPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        )}
        {pageState === "Crews" && crewTotalPages > 1 && (
          <FooterPagination
            page={crewPage}
            totalPages={crewTotalPages}
            total={crewTotal}
            pageSize={crewPageSize}
            setPage={setCrewPage}
            setPageSize={setCrewPageSize}
          />
        )}
      </div>

      {/* Personnel Modals */}
      {pageState === "Personnel" && (
        <>
          {editUserModal && pendingEditId && (
            <EditUserModal
              cancel={() => setEditUserModal(false)}
              pendingEditId={pendingEditId}
              rerender={rerender}
            />
          )}
          {createUserModal && (
            <CreateUserModal
              cancel={() => setCreateUserModal(false)}
              rerender={rerender}
            />
          )}

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? All user data will
                  be permanently deleted including Timesheets. This action
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
        </>
      )}

      {/* Crew Modals */}
      {pageState === "Crews" && (
        <>
          {editCrewModal && crewPendingEditId && (
            <EditCrewModal
              cancel={() => setEditCrewModal(false)}
              pendingEditId={crewPendingEditId}
              rerender={crewRerender}
            />
          )}
          {createCrewModal && (
            <CreateCrewModal
              cancel={() => setCreateCrewModal(false)}
              rerender={crewRerender}
            />
          )}

          <Dialog
            open={crewShowDeleteDialog}
            onOpenChange={setCrewShowDeleteDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Crew</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this crew? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={crewCancelDelete}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={crewConfirmDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
