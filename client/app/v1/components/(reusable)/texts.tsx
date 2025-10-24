import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";
import { Mako } from "next/font/google";

const mako = Mako({
  subsets: ["latin"],
  weight: "400",
});

//this determines styles of all paragraph text
const TextVariants = cva(
  "", //this applies to all variants
  {
    variants: {
      text: {
        //only text color and style
        black: "text-black",
        white: "text-white",
        disabled: "text-gray-600",
        link: "text-black underline underline-offset-2",
        red: "text-red-500",
        green: "text-green-500",
        gray: "text-gray-500",
        italic: "italic",
      },
      position: {
        //only position attributes
        center: "text-center",
        left: "text-start",
        right: "text-end",
      },
      size: {
        //only text size
        p1: "text-3xl sm:text-3xl md:text-4xl lg:text-5xl",
        p2: "text-2xl sm:text-2xl md:text-3xl lg:text-4xl",
        p3: "text-xl sm:text-xl md:text-2xl lg:text-3xl",
        p4: "text-lg sm:text-lg md:text-xl lg:text-2xl",
        p5: "text-md sm:text-md md:text-lg lg:text-xl",
        p6: "text-sm sm:text-sm md:text-med lg:text-lg",
        p7: "text-xs sm:text-xs md:text-sm lg:text-med",
        p8: "text-[10px] sm:text-[10px] md:text-xs lg:text-sm",
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
    },
    defaultVariants: {
      text: "black",
      position: "center",
      size: "p2",
    },
  }
);

interface TextProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof TextVariants> {}

const Texts: FC<TextProps> = ({
  className,
  text,
  position,
  size,
  ...props
}) => {
  return (
    <div className={mako.className}>
      <p
        className={cn(TextVariants({ text, position, size, className }))}
        {...props}
      />
    </div>
  );
};

export { Texts, TextVariants };
