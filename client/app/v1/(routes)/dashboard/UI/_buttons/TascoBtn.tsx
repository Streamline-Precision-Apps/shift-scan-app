import { useTranslations } from "next-intl";
import VerticalLayout from "./verticalLayout";
import { useRouter } from "next/navigation";
import HorizontalLayout from "./horizontalLayout";

export default function TascoBtn({
  permission,
  view,
  laborType,
}: {
  permission: string;
  view: string;
  laborType: string;
}) {
  const t = useTranslations("Widgets");
  const router = useRouter();
  return (
    <>
      {permission !== "USER" ? (
        <>
          <VerticalLayout
            color={"green"}
            text={"Tasco"}
            textSize={"h6"}
            titleImg={"/tasco.svg"}
            titleImgAlt={"Tasco Assistant Icon"}
            handleEvent={() => router.push("/v1/dashboard/tasco")}
          />
        </>
      ) : (
        <>
          <HorizontalLayout
            color={"green"}
            text={"Tasco"}
            textSize={"h6"}
            titleImg={"/tasco.svg"}
            titleImgAlt={"Tasco Assistant Icon"}
            handleEvent={() => router.push("/v1/dashboard/tasco")}
          />
        </>
      )}
    </>
  );
}
