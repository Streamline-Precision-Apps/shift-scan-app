"use client";
import "@/app/globals.css";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Suspense, use } from "react";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { Images } from "@/app/v1/components/(reusable)/images";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";

import { Forms } from "@/app/v1/components/(reusable)/forms";
import { useUserStore } from "@/app/lib/store/userStore";
import ChangePassword from "./changepassword";
import { useTranslations } from "next-intl";

export default function Index() {
  const { user } = useUserStore();

  if (!user) {
    return (
      <Bases>
        <ChangePasswordSkeleton />
      </Bases>
    );
  }

  const userId = user?.id;

  async function ChangePasswordSkeleton() {
    const t = useTranslations("Hamburger-Profile");
    return (
      <Contents>
        <Forms className="h-full w-full">
          <Grids rows={"7"} cols={"1"} gap={"5"} className="h-full w-full">
            <Holds
              background={"white"}
              size={"full"}
              className="row-start-1 row-end-2 h-full bg-white animate-pulse  "
            >
              <TitleBoxes>
                <Holds
                  position={"row"}
                  className="w-full justify-center gap-x-2 "
                >
                  <Titles size={"lg"}>{t("ChangePassword")}</Titles>
                  <Images
                    titleImg="/key.svg"
                    titleImgAlt="Key Icon"
                    className=" max-w-6 h-auto object-contain"
                  />
                </Holds>
              </TitleBoxes>
            </Holds>

            <Holds
              background={"white"}
              className=" row-start-2 row-end-8 h-full  bg-white animate-pulse "
            ></Holds>
          </Grids>
        </Forms>
      </Contents>
    );
  }
  return (
    <Bases>
      <ChangePassword userId={userId} />
    </Bases>
  );
}
