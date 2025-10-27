"use server";
import InboxContent from "@/app/(routes)/hamburger/inbox/_components/inboxContent";
import { auth } from "@/auth";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";

export default async function Inbox() {
  const session = await auth();
  if (!session) return null;
  const isManager = session.user.permission !== "USER";

  return (
    <Bases>
      <Contents>
        <InboxContent isManager={isManager} />
      </Contents>
    </Bases>
  );
}
