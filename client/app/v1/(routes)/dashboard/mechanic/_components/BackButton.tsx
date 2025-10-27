import { Buttons } from "@/components/(reusable)/buttons";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  const t = useTranslations("MechanicWidget");
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("rUrl");
  return (
    <Holds className="col-span-1 row-span-1 flex items-center justify-center fixed">
      <Buttons
        onClick={
          returnUrl
            ? () => router.push(returnUrl)
            : () => router.push("/dashboard")
        }
        background="none"
        position="left"
        size="50"
        shadow="none"
      >
        <Images
          titleImg="/arrowBack.svg"
          titleImgAlt={t("Mechanic")}
          className="max-w-8 h-auto object-contain"
        />
      </Buttons>
    </Holds>
  );
}
