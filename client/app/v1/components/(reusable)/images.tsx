import { cva, type VariantProps } from "class-variance-authority";
import { ImgHTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";

//this determines styles of all images
const ImageVariants = cva(
  "", //this applies to all variants
  {
    variants: {
      background: {
        //only background attributes
        white: "bg-white rounded-2xl",
        none: "bg-none",
      },
      position: {
        //only position attributes
        center: "self-center",
        left: "self-start",
        right: "self-end",
      },
      size: {
        //only width and height
        fill: "w-full h-full",
        full: "w-full sm:w-full md:w-[90%] lg:w-[80%] xl:w-[70%] 2xl:w-[60%]",
        "90": "w-[90%] sm:w-[85%] md:w-[75%] lg:w-[65%]",
        "80": "w-[80%]  sm:w-[75%] md:w-[70%] lg:w-[60%]",
        "70": "w-[70%] sm:w-[65%] md:w-[60%] lg:w-[55%]",
        "60": "w-[60%] sm:w-[55%] md:w-[50%] lg:w-[45%]",
        "50": "w-[50%] sm:w-[45%] md:w-[40%] lg:w-[35%]",
        "40": "w-[40%] sm:w-[35%] md:w-[30%] lg:w-[25%]",
        "30": "w-[30%] sm:w-[25%] md:w-[20%] lg:w-[15%]",
        "20": "w-[20%] sm:w-[15%] md:w-[10%] lg:w-[10%]",
        "10": "w-[10%] sm:w-[5%] md:w-[5%] lg:w-[5%]",
      },
    },
    defaultVariants: {
      background: "none",
      position: "center",
      size: "80",
    },
  }
);

interface ImageProps
  extends ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof ImageVariants> {
  titleImg: string;
  titleImgAlt: string;
}

const Images: FC<ImageProps> = ({
  className,
  background,
  position,
  size,
  titleImg,
  titleImgAlt,
  ...props
}) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={titleImg}
      alt={titleImgAlt}
      className={cn(ImageVariants({ background, position, size, className }))}
      {...props}
    />
  );
};

export { Images, ImageVariants };
