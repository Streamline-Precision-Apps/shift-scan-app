"use client";

import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { redirect } from "next/navigation";
import TascoClientPage from "./components/tascoClientPage";
import { cookies } from "next/headers";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { Images } from "@/app/v1/components/(reusable)/images";

export default function TascoPage() {
  // const session = await auth();
  // if (!session) {
  //   redirect("/signin");
  // }

  // const laborType = (await cookies()).get("laborType")?.value || "";

  // if (laborType === "equipmentOperator") {
  //   return (
  //     <Bases>
  //       <Contents>
  //         <Grids rows={"7"} gap={"5"} className="h-full">
  //           <Holds background={"white"} className="row-span-1 h-full">
  //             <TitleBoxes>
  //               <Titles>Tasco</Titles>
  //               <Images
  //                 className="w-8 h-8"
  //                 titleImg={"/tasco.svg"}
  //                 titleImgAlt={"Tasco"}
  //               />
  //             </TitleBoxes>
  //           </Holds>
  //           <Holds background={"white"} className="row-span-6 h-full">
  //             <TascoClientPage />
  //           </Holds>
  //         </Grids>
  //       </Contents>
  //     </Bases>
  //   );
  // } else {
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
// }
