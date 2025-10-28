"use server";
import "@/app/globals.css";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import QRGeneratorContent from "./content";
import { Suspense } from "react";
import LoadingQRGeneratorContent from "./loadingUiQrGenerator";

export default async function QrGeneratorDashboard() {
  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"}>
          <Suspense fallback={<LoadingQRGeneratorContent />}>
            <QRGeneratorContent />
          </Suspense>
        </Grids>
      </Contents>
    </Bases>
  );
}
