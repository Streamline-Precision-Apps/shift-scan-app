"use client";
import { useTranslations } from "next-intl";
import "@/app/globals.css";

type Props = {
  date: Promise<string>;
  translation: string;
};

export default function Banner({ date, translation }: Props) {
  const t = useTranslations(translation);
  return (
    <div className=" bg-app-blue text-black p-none rounded-sm w-full h-24 flex mx-auto flex-col items-center justify-center lg:h-16">
      <h1 className="text-3xl font-bold">{t("Banner")}</h1>
      <h2 className="text-xl font-light">{date}</h2>
    </div>
  );
}
