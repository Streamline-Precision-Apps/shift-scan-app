"use client";
import { useUserStore } from "@/app/lib/store/userStore";
import { Buttons } from "../(reusable)/buttons";
import { Holds } from "../(reusable)/holds";
import { useEffect } from "react";

// Utility to extract the ?t= value from the image URL
function getImageTimestamp(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/[?&]t=(\d+)/);
  return match ? match[1] : null;
}

// Custom hook to cache user image by timestamp
export function useCachedUserImage() {
  const userImage = useUserStore((state) => state.user?.image);

  useEffect(() => {
    if (!userImage) return;
    const cachedUrl = localStorage.getItem("userImageUrl");
    const cachedTimestamp = getImageTimestamp(cachedUrl);
    const currentTimestamp = getImageTimestamp(userImage);
    if (cachedUrl !== userImage && cachedTimestamp !== currentTimestamp) {
      localStorage.setItem("userImageUrl", userImage);
    }
  }, [userImage]);
}

// Utility to get the cached image
export function getCachedUserImageUrl() {
  return localStorage.getItem("userImageUrl");
}

export default function HamburgerMenuNew({
  isHome = true,
}: {
  isHome?: boolean;
}) {
  const image = useUserStore((state) => state.user?.image || "");

  return (
    <Holds
      position={"row"}
      background={"white"}
      className="row-start-1 row-end-2 h-full p-2 py-3"
    >
      <Holds className="w-24 h-full flex flex-col items-center justify-center relative">
        <Buttons
          href={
            isHome
              ? "/v1/hamburger/profile?returnUrl=/v1"
              : "/v1/hamburger/profile"
          }
          background={"none"}
          shadow={"none"}
          className="absolute inset-0 w-full h-full z-10"
        />
        <div className="relative">
          <img
            src={image ? image : "/profileEmpty.svg"}
            alt="profile"
            className="max-w-12  h-auto object-contain bg-black border-[3px] border-black rounded-full z-0"
          />
          <img
            src={"/settingsFilled.svg"}
            alt={"settings"}
            className="w-5 h-5 absolute -right-1  -bottom-1 z-1 rounded-full "
          />
        </div>
      </Holds>

      <Holds className="w-full h-full justify-center items-center">
        <img src={"/logo.svg"} alt="logo" className="max-w-16" />
      </Holds>

      <Holds className="w-24 h-full justify-center">
        <Buttons
          href={isHome ? "/hamburger/inbox?returnUrl=/v1" : "/hamburger/inbox"}
          background={"none"}
          shadow={"none"}
          className=" w-16 h-auto justify-center"
        >
          <img
            src={"/form.svg"}
            alt={"inbox"}
            className="relative max-w-9 h-auto object-contain  mx-auto"
          />
        </Buttons>
      </Holds>
    </Holds>
  );
}
