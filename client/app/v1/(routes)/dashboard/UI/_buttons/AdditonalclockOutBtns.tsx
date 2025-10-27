"use client";

import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Labels } from "@/components/(reusable)/labels";
import { NModals } from "@/components/(reusable)/newmodals";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { LogItem } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useModalState } from "@/hooks/(dashboard)/useModalState";

export default function ClockOutWidget({
  handleShowManagerButtons,
  comment,
  setComment,
  handleCOButton2,
  handleCOButton3,
  logs,
}: {
  handleShowManagerButtons: () => void;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  handleCOButton2: () => void;
  handleCOButton3: () => void;
  logs: LogItem[];
}) {
  const t = useTranslations("Widgets");
  const c = useTranslations("Clock");

  // Using the custom hook for modal state management
  const modalState = useModalState();

  // Automatically open modal if logs are present
  useEffect(() => {
    if (logs.length > 0) {
      modalState.handleOpenModal(); // Open the modal automatically
    }
  }, [logs, modalState]);

  return (
    <>
      <Grids rows="3" gap="5">
        <Holds className="col-span-2 row-span-1 gap-5 h-full">
          <Buttons background="orange" onClick={modalState.handleOpenModal2}>
            <Holds position="row" className="my-auto">
              <Holds size="60">
                <Texts size="p1">{t("Break")}</Texts>
              </Holds>
              <Holds size="40">
                <Images
                  titleImg="/clockBreak.svg"
                  titleImgAlt="Break Icon"
                  size="50"
                />
              </Holds>
            </Holds>
          </Buttons>
        </Holds>

        {/* Break Modal */}
        <NModals
          isOpen={modalState.isModal2Open}
          handleClose={modalState.handleCloseModal2}
          size="screen"
          background="takeABreak"
        >
          <Holds background="white" className="h-full w-full">
            <Holds background="white" className="h-full w-[90%] p-1">
              <Grids rows="7" gap="5" className="mb-5 h-full w-full">
                <Holds className="row-start-1 row-end-2 h-full w-full justify-center">
                  <Grids rows="1" cols="5" gap="3" className="h-full w-full">
                    <Holds
                      className="row-start-1 row-end-2 col-start-1 col-end-2 h-full w-full justify-center"
                      onClick={modalState.handleCloseModal2}
                    >
                      <Images
                        titleImg="/arrowBack.svg"
                        titleImgAlt="back"
                        position="left"
                      />
                    </Holds>
                  </Grids>
                </Holds>
                <Holds className="row-start-2 row-end-4 h-full w-full justify-center relative">
                  <Holds className="h-full w-[90%] relative">
                    <Labels size="p4" htmlFor="comment">
                      {c("PreviousJobComment")}
                    </Labels>
                    <TextAreas
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={c("TodayIDidTheFollowing")}
                      className="w-full h-full"
                      maxLength={40}
                      style={{ resize: "none" }}
                    />

                    <Texts
                      size="p2"
                      className={`${
                        comment.length === 40
                          ? "text-red-500 absolute bottom-5 right-2"
                          : "absolute bottom-5 right-2"
                      }`}
                    >
                      {comment.length}/40
                    </Texts>
                  </Holds>
                </Holds>

                <Holds position="row" className="row-start-7 row-end-8 h-full ">
                  <Buttons
                    background="orange"
                    onClick={handleCOButton2}
                    className="w-full py-4 "
                  >
                    <Titles size="h2">{c("Continue")}</Titles>
                  </Buttons>
                </Holds>
              </Grids>
            </Holds>
          </Holds>
        </NModals>

        {/* Logs Modal */}
        <NModals
          isOpen={modalState.isModalOpen}
          handleClose={modalState.handleCloseModal}
          size="screen"
          background="takeABreak"
        >
          <Holds background="white" className="h-full">
            <Holds className="h-full p-4">
              <Grids rows="7" gap="5">
                <Holds className="row-start-1 row-end-2 h-full w-full justify-center">
                  <Grids rows="2" cols="5" gap="3" className="h-full w-full">
                    <Holds
                      className="row-start-1 row-end-2 col-start-1 col-end-2 h-full w-full justify-center"
                      onClick={() => {
                        handleShowManagerButtons();
                        modalState.handleCloseModal();
                      }}
                    >
                      <Images
                        titleImg="/arrowBack.svg"
                        titleImgAlt="back"
                        position="left"
                      />
                    </Holds>
                    <Holds className="row-start-2 row-end-3 col-start-1 col-end-6 h-full w-full justify-center">
                      <Titles size="h1">{t("Whoops")}</Titles>
                    </Holds>
                  </Grids>
                </Holds>
                <Holds className="h-full row-start-2 row-end-3 my-auto">
                  <Texts size="p2">{t("ReturnToLogOut")}</Texts>
                </Holds>
                <Holds className="h-full row-start-3 row-end-8 my-auto overflow-y-scroll no-scrollbar border-[3px] border-black rounded-[10px]">
                  <Holds className="w-full p-2 flex flex-col space-y-4">
                    {[...new Set(logs.map((log) => log.type))].map(
                      (type, index) => (
                        <Buttons
                          key={index}
                          background="lightBlue"
                          href={
                            type === "equipment"
                              ? "/dashboard/equipment"
                              : type === "mechanic"
                              ? `/dashboard/mechanic/projects/${
                                  logs.find((log) => log.type === type)
                                    ?.maintenanceId
                                }`
                              : type === "Trucking Assistant"
                              ? "/dashboard/truckingAssistant"
                              : type === "tasco"
                              ? "/dashboard/tasco"
                              : undefined
                          }
                          className="w-full py-3"
                        >
                          <Texts size="p3">{type} </Texts>
                        </Buttons>
                      )
                    )}
                  </Holds>
                </Holds>
              </Grids>
            </Holds>
          </Holds>
        </NModals>
        <Holds className="col-span-2 row-span-1 gap-5 h-full">
          <Buttons background={"red"} onClick={handleCOButton3}>
            <Holds position={"row"} className="my-auto">
              <Holds size={"70"}>
                <Texts size={"p1"}>{t("EndDay")}</Texts>
              </Holds>
              <Holds size={"30"}>
                <Images
                  titleImg="/endDay.svg"
                  titleImgAlt="End Icon"
                  size={"50"}
                />
              </Holds>
            </Holds>
          </Buttons>
        </Holds>

        <Holds className="col-span-2 row-span-1 gap-5 h-full">
          <Buttons background="lightBlue" onClick={handleShowManagerButtons}>
            <Holds position="row" className="my-auto">
              <Holds size="60">
                <Texts size="p1">{t("GoHome")}</Texts>
              </Holds>
              <Holds size="40">
                <Images
                  titleImg="/home.svg"
                  titleImgAlt="Home Icon"
                  size="50"
                />
              </Holds>
            </Holds>
          </Buttons>
        </Holds>
      </Grids>
    </>
  );
}
