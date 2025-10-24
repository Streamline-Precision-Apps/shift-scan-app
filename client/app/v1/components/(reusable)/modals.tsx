"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";
import ReactPortal from "./ReactPortal";
import React, { useEffect } from "react";
import { Buttons } from "./buttons";
import { Images } from "./images";
import { Titles } from "./titles";
import { Contents } from "./contents";
import { Bases } from "./bases";
import { Holds } from "./holds";
import { signOut } from "next-auth/react";

const ModalVariants = cva(
  "", //this applies to all variants
  {
    variants: {
      background: {
        default: "bg-white opacity-90 rounded-2xl p-1",
      },
      position: {
        center: "relative",
      },
      size: {
        default:
          "fixed rounded-sm p-1 bg-white top-1/4 left-3/4 -translate-x-1/4 -translate-y-1/2 flex flex-col",
        sm: "absolute left-[50%] top-[50%]",
        med: "",
        lg: " fixed rounded-3xl p-1 bg-white opacity-none h-fit w-2/3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-normal mt-16",
        clock:
          "fixed rounded-sm top-1/3 -translate-y-1/3 flex flex-col w-full h-full ",
        fullPage:
          "fixed left-0 top-0 mt-10 rounded-2xl rounded-b-none w-full h-full",
      },
    },
    defaultVariants: {
      background: "default",
      position: "center",
      size: "default",
    },
  },
);

interface ModalProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof ModalVariants> {
  type?: string;
  isOpen: boolean;
  step?: number;
  handleClose: () => void;
  handleSubmit?: () => void;
}

const Modals: FC<ModalProps> = ({
  className,
  background,
  position,
  size,
  type,
  isOpen,
  step,
  handleClose,
  handleSubmit,
  ...props
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return (): void => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (type === "signOut") {
    return (
      <ReactPortal wrapperId="react-portal-modal-container">
        <div className="modal ">
          <div className="fixed top-0 left-0 w-screen h-screen bg-neutral-800 opacity-50" />
          <div
            className={cn(
              ModalVariants({ background, position, size, className }),
            )}
            {...props}
          >
            <div className="modal-content">{props.children}</div>
            <div className=" flex flex-row gap-10">
              <Buttons
                onClick={() => {
                  handleClose();
                  signOut({
                    redirect: true,
                    redirectTo: "/signin", // Specify the redirection URL
                  });
                }}
                className="close-btn"
                background={"green"}
                size={"full"}
              >
                <Titles size={"h3"}>Yes</Titles>
              </Buttons>
              <Buttons
                onClick={handleClose}
                className="close-btn"
                background={"red"}
                size={"full"}
              >
                <Titles size={"h3"}>Cancel</Titles>
              </Buttons>
            </div>
          </div>
        </div>
      </ReactPortal>
    );
  }
  if (type === "decision") {
    return (
      <ReactPortal wrapperId="react-portal-modal-container">
        <div className="modal ">
          <div className="fixed top-0 left-0 w-screen h-screen bg-neutral-800 opacity-50" />
          <div
            className={cn(
              ModalVariants({ background, position, size, className }),
            )}
            {...props}
          >
            <div className="modal-content">{props.children}</div>
            <div className=" flex flex-row gap-10">
              <Buttons
                onClick={handleSubmit}
                className="close-btn"
                background={"green"}
                size={"full"}
              >
                <Titles size={"h3"}>Yes</Titles>
              </Buttons>
              <Buttons
                onClick={handleClose}
                className="close-btn"
                background={"red"}
                size={"full"}
              >
                <Titles size={"h3"}>Cancel</Titles>
              </Buttons>
            </div>
          </div>
        </div>
      </ReactPortal>
    );
  } else if (type === "clock")
    return (
      <ReactPortal wrapperId="react-portal-modal-container">
        <div
          className={cn(
            ModalVariants({ background, position, size, className }),
          )}
          {...props}
        >
          <Buttons
            onClick={handleClose}
            className="close-btn"
            background={"red"}
            size={"full"}
          >
            {step === 5 ? (
              <></>
            ) : (
              <Images titleImg="/statusDenied.svg" titleImgAlt="x" />
            )}
          </Buttons>
          <Contents className="modal-content">{props.children}</Contents>
        </div>
      </ReactPortal>
    );
  else if (type === "expand")
    return (
      <>
        <Buttons
          onClick={handleClose}
          className="close-btn"
          background={"red"}
          size={"full"}
        >
          <Images titleImg="/statusDenied.svg" titleImgAlt="x" />
        </Buttons>
        <Contents>{props.children}</Contents>
      </>
    );
  else if (type === "base64")
    return (
      <ReactPortal wrapperId="react-portal-modal-container">
        <div className="fixed top-0 left-0 w-screen h-screen bg-neutral-800 opacity-50" />
        <div
          className={cn(
            ModalVariants({ background, position, size, className }),
          )}
          {...props}
        >
          <Buttons
            onClick={handleClose}
            background={"red"}
            className="close-btn"
            size={"20"}
          >
            <Images
              titleImg="/statusDenied.svg"
              titleImgAlt="x"
              className="mx-auto p-2"
            />
          </Buttons>
          <div className="modal-content-wrapper max-h-[80vh] overflow-y-auto scrollbar-hide">
            {props.children}
          </div>
        </div>
      </ReactPortal>
    );
  else if (type === "signature")
    return (
      <ReactPortal wrapperId="react-portal-modal-container">
        <div className="fixed top-0 left-0 w-screen h-screen bg-neutral-800 opacity-50" />
        <div className={cn(ModalVariants({ size, className }))} {...props}>
          <Buttons
            onClick={handleClose}
            background={"red"}
            className="close-btn"
            size={"10"}
          >
            <Images
              titleImg="/arrowLeftSymbol.svg"
              titleImgAlt="x"
              className="mx-auto"
            />
          </Buttons>
          <div className="modal-content-wrapper max-h-[80vh] overflow-y-auto scrollbar-hide">
            {props.children}
          </div>
        </div>
      </ReactPortal>
    );
  else if (type === "StartDay")
    return (
      <ReactPortal wrapperId="react-portal-modal-container ">
        <Bases
          background={"modal"}
          position={"start"}
          size={"screen"}
          className="overflow-scroll"
        >
          <div
            className={cn(
              ModalVariants({ background, position, size, className }),
            )}
            {...props}
          >
            <Titles>{props.title}</Titles>
            <Holds size={"full"} className="pb-10">
              <Buttons
                onClick={handleClose}
                className=" mr-2 close-btn w-10 h-10"
                background={"red"}
                position={"right"}
              >
                <Holds>
                  <Images
                    titleImg="/statusDenied.svg"
                    titleImgAlt="x"
                    size={"50"}
                    className="m-auto "
                  />
                </Holds>
              </Buttons>
            </Holds>
            <div className="modal-content-wrapper overflow-auto ">
              {props.children}
            </div>
          </div>
        </Bases>
      </ReactPortal>
    );
  else
    return (
      <ReactPortal wrapperId="react-portal-modal-container ">
        <Bases background={"modal"} position={"start"} size={"screen"}>
          <div
            className={cn(
              ModalVariants({ background, position, size, className }),
            )}
            {...props}
          >
            <Titles>{props.title}</Titles>
            <div className="modal-content">{props.children}</div>
            <Holds size={"full"} className="mb-10">
              <Buttons
                onClick={handleClose}
                className="close-btn"
                size={"90"}
                background={"red"}
                position={"center"}
              >
                <Holds>
                  <Images
                    titleImg="/statusDenied.svg"
                    titleImgAlt="x"
                    size={"10"}
                    className="my-auto"
                  />
                </Holds>
              </Buttons>
            </Holds>
          </div>
        </Bases>
      </ReactPortal>
    );
};

export { Modals, ModalVariants };
