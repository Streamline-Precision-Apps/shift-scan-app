"use server";
import { auth } from "@/auth";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { redirect } from "next/navigation";
import TascoClientPage from "./components/tascoClientPage";
import { cookies } from "next/headers";
import { Titles } from "@/components/(reusable)/titles";
import { Images } from "@/components/(reusable)/images";

export default async function TascoPage() {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }

  const laborType = (await cookies()).get("laborType")?.value || "";

  if (laborType === "equipmentOperator") {
    return (
      <Bases>
        <Contents>
          <Grids rows={"7"} gap={"5"} className="h-full">
            <Holds background={"white"} className="row-span-1 h-full">
              <TitleBoxes>
                <Titles>Tasco</Titles>
                <Images
                  className="w-8 h-8"
                  titleImg={"/tasco.svg"}
                  titleImgAlt={"Tasco"}
                />
              </TitleBoxes>
            </Holds>
            <Holds background={"white"} className="row-span-6 h-full">
              <TascoClientPage />
            </Holds>
          </Grids>
        </Contents>
      </Bases>
    );
  } else {
    return (
      <Bases>
        <Contents>
          <Grids rows={"7"} gap={"5"}>
            <Holds
              background={"white"}
              className="row-span-1 h-full justify-center"
            >
              <TitleBoxes>
                <Holds
                  position={"row"}
                  className="w-full justify-center space-x-2"
                >
                  <Titles>Tasco</Titles>
                  <Images
                    className="w-8 h-8"
                    titleImg={"/tasco.svg"}
                    titleImgAlt={"Tasco"}
                  />
                </Holds>
              </TitleBoxes>
            </Holds>
            <Holds className="row-span-6 h-full">
              <TascoClientPage />
            </Holds>
          </Grids>
        </Contents>
      </Bases>
    );
  }
}
