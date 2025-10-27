import { Holds } from "@/components/(reusable)/holds";
import { Grids } from "@/components/(reusable)/grids";
import { Contents } from "@/components/(reusable)/contents";
import { Titles } from "@/components/(reusable)/titles";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import Spinner from "@/components/(animations)/spinner";
import { Buttons } from "@/components/(reusable)/buttons";
import { Images } from "@/components/(reusable)/images";

export default function LoadingQRGeneratorContent() {
  return (
    <>
      <Holds
        background="white"
        className="row-start-1 row-end-2 h-full animate-pulse"
      >
        <TitleBoxes position="row">
          <Titles size="xl">
            <span className="inline-block bg-gray-200 rounded w-40 h-7" />
          </Titles>
        </TitleBoxes>
      </Holds>
      <Holds className="row-start-2 row-end-8 h-full">
        <Grids rows="10">
          <Holds position="row" className="gap-x-1 h-full">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="bg-gray-200 rounded w-24 h-8 mb-2" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="bg-gray-200 rounded w-32 h-8 mb-2" />
            </div>
          </Holds>
          <Holds
            background="white"
            className="rounded-t-none row-span-9 h-full animate-pulse"
          >
            <Contents width="section" className="py-5">
              <Grids rows="7" cols="3" gap="5">
                <Holds
                  background="darkBlue"
                  className="w-full h-full row-start-1 row-end-7 col-span-3 justify-center items-center"
                >
                  <Spinner color="border-app-white" />
                </Holds>
                <Holds className="row-start-7 row-end-8 col-start-1 col-end-2 h-full">
                  <Buttons
                    background="darkGray"
                    disabled
                    className="w-full h-full justify-center items-center"
                  >
                    <Images
                      src="/qrCode.svg"
                      alt="Team"
                      className="w-8 h-8 mx-auto"
                      titleImg=""
                      titleImgAlt=""
                    />
                  </Buttons>
                </Holds>
                <Holds
                  size="full"
                  className="row-start-7 row-end-8 col-start-2 col-end-4 h-full"
                >
                  <Buttons background="green" disabled />
                </Holds>
              </Grids>
            </Contents>
          </Holds>
        </Grids>
      </Holds>
    </>
  );
}
