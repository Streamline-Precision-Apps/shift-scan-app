"use client";

import { TextAreas } from "@/app/v1/components/(reusable)/textareas";
import { Texts } from "@/app/v1/components/(reusable)/texts";
import { useTranslations } from "next-intl";

export default function TascoCommentsSkeleton() {
  const t = useTranslations("Tasco");
  return (
    <>
      <TextAreas
        name="comments"
        maxLength={40}
        placeholder={t("CommentPlaceholder")}
        className="h-full w-full text-base focus:outline-hidden focus:ring-transparent focus:border-current "
      />
      <Texts size={"lg"} className={`absolute bottom-5 right-2`}>
        0/40
      </Texts>
    </>
  );
}
