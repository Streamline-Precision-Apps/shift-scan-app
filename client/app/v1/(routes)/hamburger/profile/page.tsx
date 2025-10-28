"use client";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import ProfilePage from "./accountSettings";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Images } from "@/app/v1/components/(reusable)/images";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { useUserStore } from "@/app/lib/store/userStore";
import { useState, useEffect } from "react";

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
              <Holds className="absolute bottom-2 right-0 translate-x-1/4 translate-y-1/4 rounded-full h-8 w-8 border-2 p-0.5 justify-center items-center border-black bg-app-gray">
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
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get userId from user store first
    if (user?.id) {
      console.log("✅ Got userId from user store:", user.id);
      setUserId(user.id);
      setIsLoading(false);
      return;
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        console.log("✅ Got userId from localStorage:", storedUserId);
        setUserId(storedUserId);
        setIsLoading(false);
        return;
      }
    }

    // If still no userId, wait a moment and try again (in case store is still initializing)
    const timer = setTimeout(() => {
      if (!user?.id) {
        const storedUserId =
          typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        if (storedUserId) {
          console.log("✅ Got userId from localStorage (retry):", storedUserId);
          setUserId(storedUserId);
        } else {
          console.error("❌ No userId found in store or localStorage");
        }
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user?.id]);

  // Show loading skeleton while fetching userId
  if (isLoading || !userId) {
    return (
      <Bases>
        <Contents>
          <ProfileSkeleton />
        </Contents>
      </Bases>
    );
  }

  return (
    <Bases>
      <Contents>
        <ProfilePage userId={userId} />
      </Contents>
    </Bases>
  );
}
