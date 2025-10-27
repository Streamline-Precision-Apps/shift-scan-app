"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
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
  const [projectID, setProjectID] = useState("");

  useEffect(() => {
    const checkCookie = async () => {
      const response = await fetch(
        "/api/cookies?method=get&name=mechanicProjectID",
      );
      const data = await response.json();
      setProjectID(data);
    };

    checkCookie();
  });
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
            router.push(
              projectID
                ? `/dashboard/mechanic/projects/${projectID}`
                : "/dashboard/mechanic",
            );
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
            router.push(
              projectID
                ? `/dashboard/mechanic/projects/${projectID}`
                : "/dashboard/mechanic",
            );
          }}
        />
      )}
    </>
  );
}
