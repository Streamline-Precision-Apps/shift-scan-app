"use client";
import "@/app/globals.css";
import { useRouter } from "next/navigation";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef, ForwardedRef } from "react";
import { cn } from "@/components/(reusable)/utils";

// This determines styles of all buttons
const ButtonVariants = cva(
  "border-[3px] border-black rounded-[10px]", //this applies to all variants
  {
    variants: {
      background: {
        //only background attributes
        lightBlue: "bg-app-blue",
        darkBlue: "bg-app-dark-blue",
        green: "bg-app-green",
        red: "bg-app-red",
        orange: "bg-app-orange",
        white: "bg-white",
        lightGray: "bg-app-gray",
        darkGray: "bg-app-dark-gray",
        neutral: "bg-neutral-300",
        none: "bg-none border-0 shadow-none",
        custom: "",
      },
      position: {
        //only position attributes
        center: "self-center",
        left: "self-start",
        right: "self-end",
      },
      size: {
        //only width and height
        full: "w-full h-full",
        "90": "w-[90%]",
        "80": "w-[80%]",
        "70": "w-[70%]",
        "60": "w-[60%]",
        "50": "w-[50%]",
        "40": "w-[40%]",
        "30": "w-[30%]",
        "20": "w-[20%]",
        "10": "w-[10%]",
      },
      shadow: {
        none: "shadow-none",
        yes: "shadow-[8px_8px_0px_rgba(0,0,0,0.45)]",
      },
    },
    defaultVariants: {
      background: "lightBlue",
      position: "center",
      size: "full",
      shadow: "yes",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ButtonVariants> {
  href?: string;
  ref?: React.Ref<HTMLButtonElement | HTMLDivElement>;
}

const Buttons = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, background, position, size, shadow, href, ...props },
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const router = useRouter();
    const pageAction = () => {
      if (href) {
        if (href === "back") {
          router.back();
        } else router.push(href);
      }
    };
    return (
      <button
        ref={ref}
        onClick={() => {
          pageAction();
        }}
        className={cn(
          ButtonVariants({ background, size, position, shadow, className }),
        )}
        {...props}
      />
    );
  },
);

Buttons.displayName = "Buttons";

export { Buttons, ButtonVariants };
