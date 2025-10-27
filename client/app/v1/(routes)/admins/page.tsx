"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { PageHeaderContainer } from "./_pages/PageHeaderContainer";
import { NotificationTable } from "./_components/NotificationTable";
import { JsonValue } from "../../../../prisma/generated/prisma/runtime/library";
import { Notification } from "../../../../prisma/generated/prisma/client";
import { useSession } from "next-auth/react";
import NotificationActionsList from "./_components/NotificationAction";

export type ResolvedNotification = {
  id: number;
  topic: string | null;
  title: string;
  body: string | null;
  url: string | null;
  metadata: JsonValue | null;
  createdAt: string;
  pushedAt: string | null;
  pushAttempts: number;
  readAt: string | null;
  Response: {
    id: number;
    notificationId: number;
    userId: string;
    response: string | null;
    respondedAt: string;
    user: {
      firstName: string;
      lastName: string;
    };
  } | null;
  Reads: Array<{
    userId: string;
  }>;
};

export default function Admins() {
  const [data, setData] = useState<Notification[] | undefined>();
  const [totalCount, setTotalCount] = useState(0);
  const [resolved, setResolved] = useState<
    ResolvedNotification[] | undefined
  >();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialLoad = useRef(true);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  const fetchData = useCallback(async () => {
    try {
      if (initialLoad.current) {
        setIsLoading(true);
        initialLoad.current = false;
      }
      setIsRefreshing(true);
      const response = await fetch("/api/notification-center");
      const json = await response.json();
      // API returns { notifications: Notification[] }
      setData(json.notifications);
      setTotalCount(json.count);
      setResolved(json.resolved);
      setUnreadCount(json.unreadCount);
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col h-screen w-full p-4 ">
      {/* Main content goes here */}
      <div className="flex flex-col h-[5vh] w-full">
        <PageHeaderContainer
          loading={isRefreshing}
          headerText="Admin Dashboard"
          descriptionText="Track important updates and manage pending actions in one place."
          refetch={() => {
            fetchData();
          }}
        />
      </div>

      <div className="flex flex-row h-[90vh] w-full gap-x-4 pt-4 ">
        <NotificationTable
          data={data || []}
          setData={setData}
          totalCount={totalCount}
          loading={isLoading || isRefreshing}
        />
        <NotificationActionsList
          resolved={resolved}
          currentUserId={currentUserId}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  );
}
