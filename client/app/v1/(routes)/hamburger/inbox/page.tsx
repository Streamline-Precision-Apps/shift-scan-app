"use client";

import { useUserStore } from "@/app/lib/store/userStore";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import InboxContent from "./_components/inboxContent";

export default function Inbox() {
  const { user } = useUserStore();

  if (!user) return null;
  const isManager = user.permission !== "USER";

  return (
    <Bases>
      <Contents>
        <InboxContent isManager={isManager} />
      </Contents>
    </Bases>
  );
}
