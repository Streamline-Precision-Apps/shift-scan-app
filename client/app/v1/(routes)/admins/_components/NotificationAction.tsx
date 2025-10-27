"use client";

import { format, isToday, isYesterday } from "date-fns";
// Helper to get day label
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ResolvedNotification } from "../page";
import { Bell, BookCheck, SearchCheck, Verified } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { updateNotificationReadStatus } from "@/actions/NotificationActions";
import { markAllNotificationsAsRead } from "@/actions/NotificationActions";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

export default function NotificationActionsList({
  resolved,
  currentUserId,
  unreadCount,
}: {
  resolved: ResolvedNotification[] | undefined;
  currentUserId: string;
  unreadCount: number;
}) {
  const router = useRouter();
  // Local state to track read notifications
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  // State for switch
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  // ...existing code...
  // Add state for expanded body
  const [expandedBodyId, setExpandedBodyId] = useState<number | null>(null);
  // Async function to mark notification as read
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await updateNotificationReadStatus({ notificationId });
      setReadIds((prev) => {
        const updated = new Set(prev);
        updated.add(notificationId);
        return updated;
      });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  // Mark all visible unread notifications as read
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state to mark all as read
      if (resolved) {
        setReadIds(new Set(resolved.map((item) => item.id)));
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return `Today ${format(date, "MMM d, yyyy")}`;
    if (isYesterday(date)) return `Yesterday ${format(date, "MMM d, yyyy")}`;
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="w-[40%] h-[90vh] pb-2 rounded-lg bg-neutral-100 ">
      <div className="flex flex-col h-full">
        <div className="flex flex-row justify-between items-center bg-white rounded-lg border-b border-gray-200 p-3">
          <div className="flex flex-row items-center gap-2 ">
            <Bell className="h-4 w-4 text-blue-500" />
            <h2 className="text-md">Resolved</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="unread-notifications"
              checked={showOnlyUnread}
              onCheckedChange={setShowOnlyUnread}
              className="data-[state=checked]:bg-blue-500"
            />
            <Label
              htmlFor="unread-notifications"
              className="text-xs text-blue-500"
            >
              Show only unread
            </Label>
          </div>
        </div>
        {/* Show responses */}
        <div className="flex flex-col px-3 h-full overflow-auto  bg-neutral-100  ">
          {(() => {
            // Filter and sort notifications
            const filtered = (resolved || [])
              .filter((item) => {
                const isRead =
                  item.Reads?.some(
                    (r: { userId: string }) => r.userId === currentUserId,
                  ) || readIds.has(item.id);
                return showOnlyUnread ? !isRead : true;
              })
              .sort((a, b) => {
                if (!a.Response || !b.Response) return 0;
                return (
                  new Date(b.Response.respondedAt).getTime() -
                  new Date(a.Response.respondedAt).getTime()
                );
              });

            // Group notifications by day label
            const groups: Record<string, typeof filtered> = {};
            filtered.forEach((item) => {
              if (!item.Response) return;
              const respondedDate = new Date(item.Response.respondedAt);
              const dayLabel = getDayLabel(respondedDate);
              if (!groups[dayLabel]) groups[dayLabel] = [];
              groups[dayLabel].push(item);
            });

            // Always show Today section
            const todayLabel = getDayLabel(new Date());
            const todayNotifications = groups[todayLabel] || [];

            // Get all other day labels with notifications (excluding Today)
            const otherDayLabels = Object.keys(groups)
              .filter((label) => label !== todayLabel)
              .sort(
                (a, b) =>
                  new Date(b.replace(/^(Today|Yesterday) /, "")).getTime() -
                  new Date(a.replace(/^(Today|Yesterday) /, "")).getTime(),
              );

            // If showOnlyUnread is on and there are no unread notifications, show message and hide today label/notifications, but keep Mark All as Read
            const hasUnread =
              todayNotifications.length > 0 ||
              otherDayLabels.some((label) => groups[label]?.length > 0);
            if (showOnlyUnread && !hasUnread) {
              return (
                <>
                  <div className="flex items-center justify-between w-full mt-1 mb-2">
                    <div className="text-sm font-semibold text-gray-500 ">
                      Unread Notifications
                    </div>

                    <Button
                      variant={"ghost"}
                      size="sm"
                      className="text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                      onClick={markAllAsRead}
                      type="button"
                      disabled={unreadCount === 0}
                    >
                      Mark All as Read
                    </Button>
                  </div>
                  <div className="text-xs  text-gray-400 mt-4 text-center">
                    {`You're all caught up 🎉`}
                  </div>
                </>
              );
            }

            return (
              <>
                <div className="flex items-center justify-between w-full mt-1 mb-2">
                  <div className="text-sm font-semibold text-gray-500  ">
                    {todayLabel}
                  </div>
                  <Button
                    variant={"ghost"}
                    size="sm"
                    className="text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                    onClick={markAllAsRead}
                    type="button"
                    disabled={unreadCount === 0}
                  >
                    Mark All as Read
                  </Button>
                </div>
                {todayNotifications.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">
                    {`Nothing new today ✨`}
                  </div>
                ) : (
                  todayNotifications.map((item) => {
                    const isRead =
                      item.Reads?.some(
                        (r: { userId: string }) => r.userId === currentUserId,
                      ) || readIds.has(item.id);
                    if (!item.Response) return null;
                    const respondedDate = new Date(item.Response.respondedAt);
                    return (
                      <Fragment key={item.id}>
                        <div
                          className={`relative border rounded-md transition-colors duration-200 hover:bg-neutral-50 
            ${isRead ? "bg-white border-gray-200" : "bg-blue-50 border-blue-300"}`}
                        >
                          <div className="w-full flex flex-row justify-between p-2">
                            {/* Response title and time */}
                            <div className="w-full flex flex-col gap-1">
                              <div className="w-full flex flex-row items-center gap-4">
                                <Tooltip delayDuration={1000}>
                                  <TooltipTrigger>
                                    <div className="relative group w-8 h-8">
                                      <div className="flex items-center justify-center rounded-full bg-blue-200 text-blue-900 font-bold text-xs w-8 h-8 cursor-pointer">
                                        {`${item.Response.user?.firstName?.[0] ?? ""}${item.Response.user?.lastName?.[0] ?? ""}`}
                                      </div>
                                      {item.Response.response === "Verified" ? (
                                        <span className="absolute -bottom-1 -right-1">
                                          <Verified className="h-4 w-4 text-white bg-green-500 rounded-full" />
                                        </span>
                                      ) : item.Response.response ===
                                        "Approved" ? (
                                        <span className="absolute -bottom-1 -right-1">
                                          <Verified className="h-4 w-4 text-white bg-green-500 rounded-full" />
                                        </span>
                                      ) : item.Response.response === "Read" ? (
                                        <span className="absolute -bottom-1 -right-1">
                                          <SearchCheck className="h-4 w-4 text-white bg-green-500 rounded-full" />
                                        </span>
                                      ) : null}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    sideOffset={10}
                                    className="bg-white text-blue-700 border border-blue-300 font-semibold text-xs p-3"
                                  >
                                    {`${item.Response.response} by ${item.Response.user?.firstName ?? ""} ${item.Response.user?.lastName ?? ""}`}
                                  </TooltipContent>
                                </Tooltip>
                                <div className="w-full flex flex-col gap-1">
                                  <div className="flex flex-row justify-between gap-4 ">
                                    <p
                                      className={`text-xs font-semibold ${!isRead ? "text-blue-700" : "text-gray-800"}`}
                                    >
                                      {item.title === "Timecard Approval Needed"
                                        ? "Timecard Approved"
                                        : item.title}
                                    </p>
                                    <span className="text-xs text-gray-500 ">
                                      {formatDistanceToNow(respondedDate, {
                                        addSuffix: true,
                                      })}
                                    </span>
                                  </div>
                                  {/* Truncated notification body with expand/collapse */}
                                  <div className="flex items-center justify-between w-full">
                                    <span
                                      className={`text-xs text-gray-500 transition-all duration-200 ${
                                        expandedBodyId === item.id
                                          ? ""
                                          : "truncate max-w-[230px]"
                                      }`}
                                      style={{
                                        whiteSpace:
                                          expandedBodyId === item.id
                                            ? "normal"
                                            : "nowrap",
                                      }}
                                    >
                                      {item.body}
                                    </span>
                                    {item.body && (
                                      <button
                                        type="button"
                                        className="ml-2 focus:outline-none"
                                        onClick={() =>
                                          setExpandedBodyId(
                                            expandedBodyId === item.id
                                              ? null
                                              : item.id,
                                          )
                                        }
                                        aria-label={
                                          expandedBodyId === item.id
                                            ? "Collapse message"
                                            : "Expand message"
                                        }
                                      >
                                        {expandedBodyId === item.id ? (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 15l-7-7-7 7"
                                            />
                                          </svg>
                                        ) : (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {expandedBodyId === item.id && (
                                <div className="w-full h-fit flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      router.push(item.url ?? "/admins")
                                    }
                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200  "
                                  >
                                    <p className="text-xs ">View</p>
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-row items-start ml-2">
                              {!isRead ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="w-4 h-4"
                                      size="icon"
                                      variant="outline"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await markNotificationAsRead(item.id);
                                      }}
                                    >
                                      <BookCheck className="h-3 w-3 text-blue-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Mark as Read</TooltipContent>
                                </Tooltip>
                              ) : (
                                <div className="w-4 h-4"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    );
                  })
                )}

                {/* Other days, only if notifications exist */}
                {otherDayLabels.map((dayLabel) => (
                  <Fragment key={dayLabel}>
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="text-sm font-semibold text-gray-500 mt-4 ">
                        {dayLabel}
                      </div>
                    </div>
                    {groups[dayLabel].map((item) => {
                      const isRead =
                        item.Reads?.some(
                          (r: { userId: string }) => r.userId === currentUserId,
                        ) || readIds.has(item.id);
                      if (!item.Response) return null;
                      const respondedDate = new Date(item.Response.respondedAt);
                      return (
                        <Fragment key={item.id}>
                          <div
                            className={`relative border rounded-md transition-colors duration-200 hover:bg-neutral-50 
            ${isRead ? "bg-white border-gray-200" : "bg-blue-50 border-blue-300"}`}
                          >
                            <div className="flex flex-row justify-between p-2">
                              {/* Response title and time */}
                              <div className="w-full flex flex-col">
                                <div className="w-full flex flex-row items-center gap-4">
                                  <Tooltip delayDuration={1000}>
                                    <TooltipTrigger>
                                      <div className="relative group w-8 h-8">
                                        <div className="flex items-center justify-center rounded-full bg-blue-200 text-blue-900 font-bold text-xs w-8 h-8 cursor-pointer">
                                          {`${item.Response.user?.firstName?.[0] ?? ""}${item.Response.user?.lastName?.[0] ?? ""}`}
                                        </div>
                                        {item.Response.response ===
                                          "Verified" ||
                                        item.Response.response ===
                                          "Approved" ? (
                                          <span className="absolute -bottom-1 -right-1">
                                            <Verified className="h-4 w-4 text-white bg-green-500 rounded-full" />
                                          </span>
                                        ) : item.Response.response ===
                                          "Read" ? (
                                          <span className="absolute -bottom-1 -right-1">
                                            <SearchCheck className="h-4 w-4 text-white bg-green-500 rounded-full" />
                                          </span>
                                        ) : null}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="right"
                                      sideOffset={10}
                                      className="bg-white text-blue-700 border border-blue-300 font-semibold text-xs p-3"
                                    >
                                      {`${item.Response.response} by ${item.Response.user?.firstName ?? ""} ${item.Response.user?.lastName ?? ""}`}
                                    </TooltipContent>
                                  </Tooltip>

                                  <div className="w-full flex flex-col gap-1 ">
                                    <div className="flex flex-row justify-between gap-4 ">
                                      <p
                                        className={`text-xs font-semibold ${!isRead ? "text-blue-700" : "text-gray-800"}`}
                                      >
                                        {item.title ===
                                        "Timecard Approval Needed"
                                          ? "Timecard Approved"
                                          : item.title}
                                      </p>
                                      <span className="text-xs text-gray-500 ">
                                        {formatDistanceToNow(respondedDate, {
                                          addSuffix: true,
                                        })}
                                      </span>
                                    </div>
                                    {/* Truncated notification body with expand/collapse */}
                                    <div className="flex items-center justify-between w-full">
                                      <span
                                        className={`text-xs text-gray-500 transition-all duration-200 ${
                                          expandedBodyId === item.id
                                            ? ""
                                            : "truncate max-w-[230px]"
                                        }`}
                                        style={{
                                          whiteSpace:
                                            expandedBodyId === item.id
                                              ? "normal"
                                              : "nowrap",
                                        }}
                                      >
                                        {item.body}
                                      </span>
                                      {item.body && (
                                        <button
                                          type="button"
                                          className="ml-2 focus:outline-none"
                                          onClick={() =>
                                            setExpandedBodyId(
                                              expandedBodyId === item.id
                                                ? null
                                                : item.id,
                                            )
                                          }
                                          aria-label={
                                            expandedBodyId === item.id
                                              ? "Collapse message"
                                              : "Expand message"
                                          }
                                        >
                                          {expandedBodyId === item.id ? (
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4 text-gray-400"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 15l-7-7-7 7"
                                              />
                                            </svg>
                                          ) : (
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4 text-gray-400"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                              />
                                            </svg>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {expandedBodyId === item.id && (
                                  <div className="w-full h-fit flex justify-end mt-1">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        router.push(item.url ?? "/admins")
                                      }
                                      className="bg-blue-100 text-blue-700 hover:bg-blue-200  "
                                    >
                                      <p className="text-xs ">View</p>
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-row items-start ml-2">
                                {!isRead ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        className="w-4 h-4"
                                        size="icon"
                                        variant="outline"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await markNotificationAsRead(item.id);
                                        }}
                                      >
                                        <BookCheck className="h-3 w-3 text-blue-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Mark as Read
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <div className="w-4 h-4"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Fragment>
                      );
                    })}
                  </Fragment>
                ))}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
