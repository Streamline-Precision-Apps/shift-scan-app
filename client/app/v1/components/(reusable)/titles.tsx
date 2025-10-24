import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";
import { Anton } from "next/font/google";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
});

//this determines styles of all title text
const TitleVariants = cva(
  "", //this applies to all variants
  {
    variants: {
      text: {
        //only text color and style
        black: "text-black",
        bold: "text-black font-bold",
        white: "text-white",
        disabled: "text-gray-600",
        link: "text-black underline underline-offset-2",
      },
      position: {
        //only position attributes
        center: "text-center",
        left: "text-start",
        right: "text-end",
      },
      size: {
        //only text size
        h1: "text-3xl sm:text-3xl md:text-4xl lg:text-5xl",
        h2: "text-2xl sm:text-2xl md:text-3xl lg:text-4xl",
        h3: "text-xl sm:text-xl md:text-2xl lg:text-3xl",
        h4: "text-lg sm:text-lg md:text-xl lg:text-2xl",
        h5: "text-base sm:text-med md:text-lg lg:text-xl",
        h6: "text-sm",
        h7: "text-xs",
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
      size: "h2",
    },
  }
);

interface TitleProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof TitleVariants> {}

const Titles: FC<TitleProps> = ({
  className,
  text,
  position,
  size,
  ...props
}) => {
  return (
    <div className={anton.className}>
      <h1
        className={cn(TitleVariants({ text, position, size, className }))}
        {...props}
      />
    </div>
  );
};

export { Titles, TitleVariants };
