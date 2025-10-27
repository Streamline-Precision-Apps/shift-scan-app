"use client";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import ProfilePage from "./accountSettings";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Images } from "@/app/v1/components/(reusable)/images";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { useUserStore } from "@/app/lib/store/userStore";

function ProfileSkeleton() {
  return (
    <Grids rows={"6"} gap={"5"} className="h-full w-full">
      <Holds
        background={"white"}
        size={"full"}
        className="row-start-1 row-end-2 h-full bg-white animate-pulse  "
      >
        <TitleBoxes>
          <div className="w-full flex justify-center relative">
            <div className="w-20 h-20 relative">
              <Images
                titleImg={"/profileEmpty.svg"}
                titleImgAlt="profile"
                className={`w-full h-full rounded-full object-cover `}
              />
              <Holds className="absolute bottom-2 right-0 translate-x-1/4 translate-y-1/4 rounded-full h-8 w-8 border-[2px] p-0.5 justify-center items-center border-black bg-app-gray">
                <Images titleImg="/camera.svg" titleImgAlt="camera" />
              </Holds>
            </div>
          </div>
        </TitleBoxes>
      </Holds>

      <Holds
        background={"white"}
        className=" row-start-2 row-end-7 h-full  bg-white animate-pulse "
      ></Holds>
    </Grids>
  );
}

export default function EmployeeProfile() {
  const { user } = useUserStore();
  const userId = user?.id as string;

  if (!user || !userId) {
    <Bases>
      <Contents>
        <ProfileSkeleton />
      </Contents>
    </Bases>;
  }

  return (
    <Bases>
      <Contents>
        <ProfilePage userId={userId} />
      </Contents>
    </Bases>
  );
}
