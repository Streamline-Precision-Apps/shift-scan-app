"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";
import { Buttons } from "./buttons";

import React from "react";
import { Texts } from "./texts";
import { Titles } from "./titles";
import { Images } from "./images";
import { Holds } from "./holds";

const ExpandVariants = cva(
  " rounded-2xl", //this applies to all variants
  {
    variants: {
      variant: {
        default: "bg-none",
        green: "bg-green-500",
        red: "bg-red-500",
      },
      size: {
        default: "",
        sm: "p-2 w-30 h-30",
        med: "p-10 w-40 h-40",
        lg: "p-10 w-50 h-50",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// this extends the capability of HTMLAttributes or the VariantProps that it can hold, specify your props here
interface ExpandProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof ExpandVariants> {
  title: string;
  divID: string;
}

const Expands: FC<ExpandProps> = ({
  className,
  variant,
  size,
  title,
  divID,
  ...props
}) => {
  function expandFunction() {
    const x = document.getElementById(divID);
    if (x !== null) {
      if (x.style.display === "none") {
        x.style.display = "block";
      } else {
        x.style.display = "none";
      }
    }
  }
  return (
    <div
      className={cn(ExpandVariants({ variant, size, className }))}
      {...props}
    >
      <Holds size={"full"}>
        <Holds position={"row"} className="py-3">
          <Holds size={"60"}>
            <Titles position={"left"} size={"h3"}>
              {title}
            </Titles>
          </Holds>
          <Holds size={"40"}>
            <Buttons className="py-2" onClick={expandFunction}>
              <Holds>
                <Images
                  titleImg="/statusOngoing.svg"
                  titleImgAlt="expand"
                  size={"20"}
                />
              </Holds>
            </Buttons>
          </Holds>
        </Holds>
      </Holds>
      <Holds className="hidden" id={divID}>
        <Texts>{props.children}</Texts>
      </Holds>
    </div>
  );
};

export { Expands, ExpandVariants };
