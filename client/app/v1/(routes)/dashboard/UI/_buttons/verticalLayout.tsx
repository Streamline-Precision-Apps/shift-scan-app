import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";

export default function VerticalLayout({
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

  titleImg: string;
  titleImgAlt: string;
  text: string;
  handleEvent?: () => void;
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
  );
}
