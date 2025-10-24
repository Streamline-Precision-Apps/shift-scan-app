"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";
import ReactPortal from "./ReactPortal";
import React, { useEffect } from "react";
import { Bases } from "./bases";

const NModalVariants = cva("", {
  variants: {
    background: {
      default: "bg-white rounded-2xl p-1",
      takeABreak:
        "bg-linear-to-b from-app-dark-blue to-app-blue pb-7 pt-7 px-4",
      white: "bg-white rounded-2xl p-1",
      noOpacity: "bg-white rounded-2xl p-1 opacity-none",
    },
    position: {
      center: "relative",
    },
    size: {
      xs: "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[350px] h-[200px]",
      sm: "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-1/4 h-1/4",
      med: "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-1/3 h-1/3",
      medW: "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-1/2 h-1/3",
      medWW:
        "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[90%] h-1/3",
      medM: " fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-1/3 h-1/2",
      medH: " fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-1/3 h-3/4",
      lg: " fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-1/2 h-1/2",
      lgH: " fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-1/2 h-3/4",
      xl: "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-3/4 h-3/4",
      xlW: "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[90%] h-[80%]",
      xlWS: "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[90%] h-[40%] max-w-lg ",
      xlWS1:
        "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[90%] h-[65%] max-w-lg ",
      page: "fixed z-9999 rounded-[10px] p-4 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-5/6 h-5/6",
      screen:
        "fixed z-9999 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-screen h-dvh",
    },
  },
  defaultVariants: {
    background: "default",
    position: "center",
    size: "med",
  },
});

interface NModalProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof NModalVariants> {
  isOpen: boolean;
  handleClose: () => void | Promise<void>;
}

const NModals: FC<NModalProps> = ({
  className,
  background,
  position,
  size,
  isOpen,
  handleClose,
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

  return (
    <ReactPortal wrapperId="react-portal-modal-container ">
      <Bases
        background={"modal"}
        position={"start"}
        size={"screen"}
        className="z-9998" // Ensure it's just below the modal content
        onClick={handleClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            NModalVariants({ background, position, size, className }),
          )}
          {...props}
        >
          <div className="modal-content h-full ">{props.children}</div>
        </div>
      </Bases>
    </ReactPortal>
  );
};

export { NModals, NModalVariants };
