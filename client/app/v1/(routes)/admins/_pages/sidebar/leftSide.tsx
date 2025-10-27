"use client";
import "@/app/globals.css";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SignOutModal from "./SignOutModal";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, LogOut, BellPlus } from "lucide-react";
import NotificationModal from "./NotificationModal";
import { useDashboardData } from "./DashboardDataContext";
import {
  useUserProfile,
  UserImage,
  UserName,
  UserRole,
} from "./UserImageContext";
import Link from "next/link";

export default function LeftSidebar() {
  const pathname = usePathname();
  const [showLogOutModal, setShowLogOutModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isProfileOpened, setIsProfileOpened] = useState(false);
  const { data } = useDashboardData();
  const { refresh } = useUserProfile(); // Only need refresh function now
  const Page = [
    {
      id: 1,
      title: "Dashboard",
      img: "home",
      white: "home-white",
      link: "/admins",
    },
    {
      id: 2,
      title: "Personnel",
      img: "user",
      white: "user-white",
      link: "/admins/personnel",
    },

    {
      id: 3,
      title: "Equipment",
      img: "equipment",
      white: "equipment-white",
      link: "/admins/equipment",
    },
    {
      id: 4,
      title: "Jobsites",
      img: "jobsite",
      white: "jobsite-white",
      link: "/admins/jobsites",
    },
    {
      id: 5,
      title: "Cost Codes",
      img: "qrCode",
      white: "qrCode-white",
      link: "/admins/cost-codes",
    },
    {
      id: 6,
      title: "Reports",
      img: "formInspect",
      white: "formInspect-white",
      link: "/admins/reports",
    },
    {
      id: 7,
      title: "Forms",
      img: "form",
      white: "form-white",
      link: "/admins/forms",
    },
    {
      id: 8,
      title: "Timesheets",
      img: "timecards",
      white: "timecards-white",
      link: "/admins/timesheets",
    },
  ];

  return (
    <Sidebar className="w-[--sidebar-width] h-full">
      <SidebarContent className="h-full bg-white bg-opacity-25 flex flex-col">
        <SidebarGroupContent className="flex-1 flex flex-col">
          <SidebarGroup>
            <div className="w-full h-16 flex items-center justify-center bg-white rounded-lg ">
              <img src="/logo.svg" alt="logo" className="w-24 h-10" />
            </div>

            <SidebarMenu className="w-full h-full mt-4 gap-4">
              {Page.map((item) => {
                // Special handling for the Dashboard with path "/admins"
                // It should only be active when exactly on "/admins"
                let isActive;
                if (item.link === "/admins") {
                  isActive = pathname === "/admins";
                } else {
                  isActive = pathname.startsWith(item.link);
                }
                return (
                  <SidebarMenuItem
                    key={item.id}
                    className={`flex flex-row items-center  px-2 rounded-lg ${isActive ? "bg-app-dark-blue hover:bg-app-dark-blue/90 " : "hover:bg-white/20"} `}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.link}
                        prefetch={true}
                        className="h-full w-full gap-4"
                      >
                        <img
                          src={`/${isActive ? item.white : item.img}.svg`}
                          alt={item.title}
                          className="w-4 h-4"
                        />
                        <span
                          className={`text-base ${isActive ? "text-white" : ""}`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                    {/* Display badge if there is a count greater than 0 */}

                    {item.title === "Timesheets" &&
                    data &&
                    data.totalPendingTimesheets > 0 ? (
                      <SidebarMenuBadge className="rounded-full justify-center items-center py-3 px-2 bg-app-red text-white">
                        {data.totalPendingTimesheets}
                      </SidebarMenuBadge>
                    ) : item.title === "Equipment" &&
                      data &&
                      data.equipmentAwaitingApproval > 0 ? (
                      <SidebarMenuBadge className="rounded-full justify-center items-center py-3 px-2 bg-app-red text-white">
                        <span className="text-sm">
                          {data.equipmentAwaitingApproval}
                        </span>
                      </SidebarMenuBadge>
                    ) : item.title === "Jobsites" &&
                      data &&
                      data.jobsitesAwaitingApproval > 0 ? (
                      <SidebarMenuBadge className="rounded-full justify-center items-center py-3 px-2 bg-app-red text-white">
                        <span className="text-sm">
                          {data.jobsitesAwaitingApproval}
                        </span>
                      </SidebarMenuBadge>
                    ) : item.title === "Forms" &&
                      data &&
                      data.pendingForms > 0 ? (
                      <SidebarMenuBadge className="rounded-full justify-center items-center py-3 px-2 bg-app-red text-white">
                        <span className="text-sm">{data.pendingForms}</span>
                      </SidebarMenuBadge>
                    ) : null}

                    {/* Display badge if there is a count */}
                  </SidebarMenuItem>
                );
              })}
              {/* Button at the bottom, separated from menu */}
            </SidebarMenu>
          </SidebarGroup>
          <div className={`mt-auto w-full flex justify-center p-2 h-fit`}>
            {isProfileOpened ? (
              <div className="bg-white rounded-[10px] w-full flex flex-col justify-between items-center ">
                {/* Profile section */}
                <div className="w-full px-4 py-2 bg-white rounded-[10px] inline-flex justify-start items-center gap-3">
                  <div className="flex items-center w-11 h-11 justify-center">
                    <UserImage
                      onImageLoad={(img) => {
                        // Optional: Update context state when image loads
                      }}
                      className="w-11 h-11 rounded-full object-cover bg-gray-100"
                      alt="profile"
                    />
                  </div>
                  <div className="inline-flex flex-col  flex-1 justify-center items-start">
                    <UserName
                      onDataLoad={(data) => {
                        // Optional: Handle data load if needed
                      }}
                      maxLength={12}
                    />
                    <UserRole
                      onDataLoad={(data) => {
                        // Optional: Handle data load if needed
                      }}
                    />
                  </div>
                  <div className="flex justify-end items-center w-fit">
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      className="bg-transparent border-none rounded-lg w-fit hover:bg-white"
                      onClick={() => setIsProfileOpened(false)}
                    >
                      <ChevronDown className="w-2 h-1.5" color="black" />
                    </Button>
                  </div>
                </div>

                <div className="w-full flex px-4 py-2 justify-start">
                  <div className="flex flex-col w-full gap-2 items-start">
                    <Button
                      variant={"ghost"}
                      className="flex flex-row w-full justify-center gap-2 rounded-lg relative border border-neutral-100"
                      onClick={() => setShowNotificationModal(true)}
                    >
                      <BellPlus
                        className="w-2 h-1.5 absolute left-2"
                        color={`black`}
                      />
                      <p className="text-[10px]">Notification Settings</p>
                    </Button>
                    <Button
                      variant={"ghost"}
                      className="flex flex-row w-full gap-2 justify-center rounded-lg relative border border-neutral-100"
                      onClick={() => setShowLogOutModal(true)}
                    >
                      <LogOut
                        className="w-2 h-1.5 absolute left-2"
                        color={`black`}
                      />
                      <p className="text-[10px]">Log Out</p>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full px-4 py-2 bg-white rounded-[10px] inline-flex justify-start items-center gap-3">
                <div className="flex items-center w-11 h-11 justify-center">
                  <UserImage
                    onImageLoad={(img) => {
                      // Optional: Update context state when image loads
                    }}
                    className="w-11 h-11 rounded-full object-cover bg-gray-100"
                    alt="profile"
                  />
                </div>
                <div className="inline-flex flex-col flex-1 justify-center items-start">
                  <UserName
                    onDataLoad={(data) => {
                      // Optional: Handle data load if needed
                    }}
                    className="mb-2"
                    maxLength={12}
                  />
                  <UserRole
                    onDataLoad={(data) => {
                      // Optional: Handle data load if needed
                    }}
                  />
                </div>
                <div className="flex justify-end items-center w-fit">
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="bg-transparent border-none rounded-lg w-fit hover:bg-white"
                    onClick={() => setIsProfileOpened(true)}
                  >
                    <ChevronUp className="w-2 h-1.5" color="black" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SidebarGroupContent>

        {/* Modal */}
        {showLogOutModal && (
          <SignOutModal open={showLogOutModal} setOpen={setShowLogOutModal} />
        )}
        {showNotificationModal && (
          <NotificationModal
            open={showNotificationModal}
            setOpen={setShowNotificationModal}
          />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
