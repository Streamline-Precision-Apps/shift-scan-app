"use server";
import "@/app/globals.css";
import { Bases } from "@/components/(reusable)/bases";
import ChangePassword from "@/app/(routes)/hamburger/changePassword/changepassword";
import { auth } from "@/auth";
import { Suspense } from "react";
import { Holds } from "@/components/(reusable)/holds";
import { Titles } from "@/components/(reusable)/titles";
import { Images } from "@/components/(reusable)/images";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { getTranslations } from "next-intl/server";
import { Forms } from "@/components/(reusable)/forms";

export default async function Index() {
  const session = await auth();
  if (!session) return null;
  const userId = session.user.id;

  async function ChangePasswordSkeleton() {
    const t = await getTranslations("Hamburger-Profile");
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
      <Suspense fallback={<ChangePasswordSkeleton />}>
        <ChangePassword userId={userId} />
      </Suspense>
    </Bases>
  );
}

// Fallback UI matching the ChangePassword section style
