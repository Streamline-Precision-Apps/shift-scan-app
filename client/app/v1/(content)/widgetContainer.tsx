"use client";

import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  titleImg: string;
  titleImgAlt: string;
  text: string;
  background?:
    | "lightBlue"
    | "darkBlue"
    | "none"
    | "white"
    | "red"
    | "green"
    | "orange"
    | "darkGray"
    | "lightGray"
    | null
    | undefined;
  textSize?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  translation: string;
  href?: string;
  disabled?: boolean;
};

export default function WidgetContainer({
  titleImg,
  titleImgAlt,
  text,
  textSize = "h5",
  background,
  translation,
  disabled = false,
  href,
}: Props) {
  const t = useTranslations(translation);
  // Determine background class based on disabled state and background prop
  const bgClass = disabled
    ? "bg-app-dark-gray"
    : background === "lightBlue"
      ? "bg-app-blue"
      : background === "darkBlue"
        ? "bg-app-dark-blue"
        : background === "green"
          ? "bg-app-green"
          : background === "red"
            ? "bg-app-red"
            : background === "orange"
              ? "bg-app-orange"
              : background === "white"
                ? "bg-white"
                : background === "lightGray"
                  ? "bg-app-gray"
                  : background === "darkGray"
                    ? "bg-app-dark-gray"
                    : background === "none"
                      ? ""
                      : "bg-app-blue";

  // Common content that will be inside either the Link or div
  const content = (
    <>
      <img
        src={titleImg}
        alt={titleImgAlt}
        className="h-full w-full max-h-[40px] max-w-[40px] object-contain"
      />
      <Titles size={textSize}>{t(text)}</Titles>
    </>
  );

  // If href is provided and not disabled, render a Link, otherwise render a div
  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={`border-[3px] border-black rounded-[10px] shadow-[8px_8px_0px_rgba(0,0,0,0.45)] ${bgClass} h-full w-full flex flex-col justify-center items-center space-y-1`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`border-[3px] border-black rounded-[10px] shadow-[8px_8px_0px_rgba(0,0,0,0.45)] ${bgClass} h-full w-full flex flex-col justify-center items-center space-y-1 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      {content}
    </div>
  );
}
