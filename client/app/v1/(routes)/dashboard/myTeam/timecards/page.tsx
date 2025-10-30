"use client";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { useTranslations } from "next-intl";
import TimeCardApprover from "./_Components/TimeCardApprover";
import Spinner from "@/app/v1/components/(animations)/spinner";

export default function TimeCards() {
  const t = useTranslations("TimeCardSwiper");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const url = searchParams.get("rPath");
  return (
    <Bases>
      <Contents>
        <Grids
          rows={"7"}
          gap={"5"}
          className={`h-full bg-white rounded-[10px] ${
            loading && "animate-pulse"
          }`}
        >
          <Holds className="row-span-1 h-full">
            <TitleBoxes
              onClick={() => router.push(`/v1/dashboard/myTeam?rPath=${url}`)}
            >
              <Holds className="h-full justify-end">
                <Titles size={"h2"}>{t("ReviewYourTeam")}</Titles>
              </Holds>
            </TitleBoxes>
          </Holds>
          <Suspense
            fallback={
              <Holds className="row-start-2 row-end-8 h-full w-full">
                <Spinner />
              </Holds>
            }
          >
            <Holds className="row-start-2 row-end-8 h-full w-full">
              <TimeCardApprover loading={loading} setLoading={setLoading} />
            </Holds>
          </Suspense>
        </Grids>
      </Contents>
    </Bases>
  );
}
