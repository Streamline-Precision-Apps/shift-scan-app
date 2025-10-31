"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import VerticalLayout from "./verticalLayout";
import HorizontalLayout from "./horizontalLayout";
import { useRouter } from "next/navigation";

export default function MechanicBtn({
  permission,
  view,
}: {
  permission: string;
  view: string;
}) {
  const router = useRouter();
  const t = useTranslations("Widgets");

  return (
    <>
      {permission !== "USER" && view === "mechanic" ? (
        <VerticalLayout
          text={"Mechanic"}
          titleImg={"/mechanic.svg"}
          titleImgAlt={"Mechanic Icon"}
          color={"green"}
          textSize={"h6"}
          handleEvent={() => {
            router.push("/v1/dashboard/mechanic");
          }}
        />
      ) : (
        <HorizontalLayout
          text={"Mechanic"}
          titleImg={"/mechanic.svg"}
          titleImgAlt={"Mechanic Icon"}
          color={"green"}
          textSize={"h6"}
          handleEvent={() => {
            router.push("/v1/dashboard/mechanic");
          }}
        />
      )}
    </>
  );
}
