import { useTranslations } from "next-intl";
import ClockOutLayout from "./verticalLayout";
import { Holds } from "@/components/(reusable)/holds";
import HorizontalLayout from "./horizontalLayout";
import VerticalLayout from "./verticalLayout";
import useModalState from "@/hooks/(dashboard)/useModalState";
import { useRouter } from "next/navigation";
import { LogItem } from "@/lib/types";
import { NModals } from "@/components/(reusable)/newmodals";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { useEffect } from "react";
export default function ClockOutBtn({
  permission,
  View,
  laborType,
  logs,
  mechanicProjectID,
}: {
  permission: string;
  View: string | null;
  laborType: string;
  logs: LogItem[];
  mechanicProjectID: string;
}) {
  const t = useTranslations("Widgets");
  const modalState = useModalState();
  const router = useRouter();

  // Disable background interactions when modal is open
  useEffect(() => {
    if (modalState.isModalOpen) {
      // Add a style to disable pointer events on the body
      document.body.style.pointerEvents = "none";
      // Also add a class to make sure
      document.body.classList.add("modal-open");
    } else {
      // Re-enable pointer events
      document.body.style.pointerEvents = "auto";
      document.body.classList.remove("modal-open");
    }

    // Cleanup
    return () => {
      document.body.style.pointerEvents = "auto";
      document.body.classList.remove("modal-open");
    };
  }, [modalState.isModalOpen]);

  return (
    <>
      {/*Truck Driver Clock Out Button layout */}
      {permission !== "USER" ? (
        <>
          {/* Manager Clock Out for Trucking */}
          {View === "truck" && (
            <>
              {laborType === "truckDriver" && (
                <HorizontalLayout
                  text={"ClockOut"}
                  titleImg={"/clockOut.svg"}
                  titleImgAlt={"clock Out Icon"}
                  color={"red"}
                  textSize={"h6"}
                  handleEvent={() => {
                    if (logs.length === 0) {
                      router.push("/dashboard/clock-out");
                    } else {
                      modalState.handleOpenModal();
                    }
                  }}
                />
              )}
              {laborType === "truckEquipmentOperator" && (
                <HorizontalLayout
                  text={"ClockOut"}
                  titleImg={"/clockOut.svg"}
                  titleImgAlt={"clock Out Icon"}
                  color={"red"}
                  textSize={"h6"}
                  handleEvent={() => {
                    if (logs.length === 0) {
                      router.push("/dashboard/clock-out");
                    } else {
                      modalState.handleOpenModal();
                    }
                  }}
                />
              )}

              {laborType === "truckLabor" && (
                <VerticalLayout
                  color={"red"}
                  text={"ClockOut"}
                  titleImg={"/clockOut.svg"}
                  textSize={"h6"}
                  titleImgAlt={"clock Out Icon"}
                  handleEvent={() => {
                    if (logs.length === 0) {
                      router.push("/dashboard/clock-out");
                    } else {
                      modalState.handleOpenModal();
                    }
                  }}
                />
              )}
            </>
          )}

          {/* Manager Clock Out for Mechanic */}
          {View === "mechanic" && (
            <>
              <HorizontalLayout
                color={"red"}
                text={"ClockOut"}
                titleImg={"/clockOut.svg"}
                titleImgAlt={"clock Out Icon"}
                textSize={"h6"}
                // handleEvent={() => handleShowAdditionalButtons("clockOut")}
                handleEvent={() => {
                  if (logs.length === 0) {
                    router.push("/dashboard/clock-out");
                  } else if (mechanicProjectID === "") {
                    router.push("/dashboard/clock-out");
                  } else {
                    modalState.handleOpenModal();
                  }
                }}
              />
            </>
          )}
          {View === "tasco" && (
            <>
              <HorizontalLayout
                color={"red"}
                text={"ClockOut"}
                titleImg={"/clockOut.svg"}
                titleImgAlt={"clock Out Icon"}
                textSize={"h6"}
                handleEvent={() => {
                  if (logs.length === 0) {
                    router.push("/dashboard/clock-out");
                  } else {
                    modalState.handleOpenModal();
                  }
                }}
              />
            </>
          )}
          {View === "general" && (
            <>
              <HorizontalLayout
                color={"red"}
                text={"ClockOut"}
                titleImg={"/clockOut.svg"}
                titleImgAlt={"clock Out Icon"}
                textSize={"h6"}
                handleEvent={() => {
                  if (logs.length === 0) {
                    router.push("/dashboard/clock-out");
                  } else {
                    modalState.handleOpenModal();
                  }
                }}
              />
            </>
          )}
        </>
      ) : (
        <>
          {/* User Clock Out */}
          {View === "truck" && (
            <HorizontalLayout
              text={"ClockOut"}
              titleImg={"/clockOut.svg"}
              titleImgAlt={"clock Out Icon"}
              textSize={"h6"}
              color={"red"}
              handleEvent={() => {
                if (logs.length === 0) {
                  router.push("/dashboard/clock-out");
                } else {
                  modalState.handleOpenModal();
                }
              }}
            />
          )}
          {View === "mechanic" && (
            <HorizontalLayout
              text={"ClockOut"}
              titleImg={"/clockOut.svg"}
              titleImgAlt={"clock Out Icon"}
              textSize={"h6"}
              color={"red"}
              handleEvent={() => {
                if (logs.length === 0) {
                  router.push("/dashboard/clock-out");
                } else {
                  modalState.handleOpenModal();
                }
              }}
            />
          )}
          {View === "tasco" && (
            <>
              <HorizontalLayout
                color={"red"}
                text={"ClockOut"}
                titleImg={"/clockOut.svg"}
                titleImgAlt={"clock Out Icon"}
                textSize={"h6"}
                handleEvent={() => {
                  if (logs.length === 0) {
                    router.push("/dashboard/clock-out");
                  } else {
                    modalState.handleOpenModal();
                  }
                }}
              />
            </>
          )}
          {View === "general" && (
            <>
              <HorizontalLayout
                color={"red"}
                text={"ClockOut"}
                titleImg={"/clockOut.svg"}
                titleImgAlt={"clock Out Icon"}
                textSize={"h6"}
                handleEvent={() => {
                  if (logs.length === 0) {
                    router.push("/dashboard/clock-out");
                  } else {
                    modalState.handleOpenModal();
                  }
                }}
              />
            </>
          )}
        </>
      )}
      <NModals
        isOpen={modalState.isModalOpen}
        handleClose={() => {
          modalState.handleCloseModal();
        }}
        size="screen"
        background="takeABreak"
        className="z-[9999] pointer-events-auto"
        style={{ pointerEvents: "auto" }}
      >
        <Holds
          background="white"
          className="h-full relative z-[9999] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          style={{
            pointerEvents: "auto",
            position: "relative",
            zIndex: 10000,
          }}
        >
          <Holds className="h-full p-4">
            <Grids rows="7" gap="5">
              <Holds className="row-start-1 row-end-2 h-full w-full justify-center">
                <Grids rows="2" cols="5" gap="3" className="h-full w-full">
                  <button
                    type="button"
                    className="row-start-1 row-end-2 col-start-1 col-end-2 h-full w-full flex justify-center items-center z-[10000] cursor-pointer relative bg-transparent border-none p-0 m-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      modalState.handleCloseModal();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Images
                      titleImg="/arrowBack.svg"
                      titleImgAlt="back"
                      position="left"
                    />
                  </button>
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
                    ),
                  )}
                </Holds>
              </Holds>
            </Grids>
          </Holds>
        </Holds>
      </NModals>
    </>
  );
}
