"use server";
import { auth } from "@/auth";
import { Bases } from "@/components/(reusable)/bases";
import Content from "@/components/(signup)/content";

export default async function SignUpPage() {
  const session = await auth();
  const userid = session?.user?.id;
  const accountSetup = session?.user?.accountSetup;
  const userName = session?.user?.firstName + " " + session?.user?.lastName;

  return (
    <Content
      userId={userid ?? ""}
      accountSetup={accountSetup ?? true}
      userName={userName ?? ""}
    />
  );
}
