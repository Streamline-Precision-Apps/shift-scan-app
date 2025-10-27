"use server";

import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Images } from "@/components/(reusable)/images";
import Password from "./password";
import { Holds } from "@/components/(reusable)/holds";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function SignInPage() {
  const t = await getTranslations("Login");
  return (
    <Bases>
      <Contents className="justify-center">
        <Images
          titleImg="/logo.svg"
          titleImgAlt={`${t("LogoAlt")}`}
          background="white"
          size="40"
          className="mb-5 p-3"
        />
        <Holds background={"white"}>
          <Suspense fallback={<div>Loading sign in...</div>}>
            <Password />
          </Suspense>
        </Holds>
      </Contents>
    </Bases>
  );
}
