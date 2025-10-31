import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { useTranslations } from "next-intl";
import { Titles } from "@/app/v1/components/(reusable)/titles";

export default function HorizontalLayout({
  color,
  handleEvent,
  text,
  titleImg,
  titleImgAlt,
  textSize = "h3",
}: {
  color?:
    | "none"
    | "white"
    | "red"
    | "green"
    | "orange"
    | "darkBlue"
    | "lightBlue"
    | "darkGray"
    | "lightGray"
    | null
    | undefined;
  handleEvent?: () => void;
  titleImg: string;
  titleImgAlt: string;
  text: string;
  textSize?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "lg"
    | "md"
    | "sm"
    | "xs";
}) {
  const t = useTranslations("Widgets");
  return (
    <Holds className="h-full w-full col-span-2">
      <Buttons
        background={color}
        onClick={handleEvent}
        className="h-full w-full flex flex-col justify-center items-center space-y-1 "
      >
        <img
          src={titleImg}
          alt={titleImgAlt}
          className="h-full w-full max-h-[40px] max-w-[40px] object-contain"
        />

        <Titles size={textSize}>{t(text)}</Titles>
      </Buttons>
    </Holds>
  );
}
