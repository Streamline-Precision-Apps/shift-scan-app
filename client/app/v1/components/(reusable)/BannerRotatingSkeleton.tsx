"use client";

import { Holds } from "@/components/(reusable)/holds";
import Spinner from "../(animations)/spinner";

export default function BannerRotatingSkeleton() {
  return (
    <Holds className="w-[80%] h-full mx-auto justify-center items-center">
      <Spinner size={40} color="white" />
    </Holds>
  );
}
