"use client";
import "@/app/globals.css";
import { Inputs } from "@/components/(reusable)/inputs";
import { Titles } from "@/components/(reusable)/titles";
import { Texts } from "@/components/(reusable)/texts";
import { Forms } from "@/components/(reusable)/forms";
import { Reset } from "@/actions/reset";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const t = useTranslations("ForgotPassword");
  const [message, setMessage] = useState<string>("");
  const [color, SetColor] = useState<string>("");
  const router = useRouter();
  const handlePasswordReset = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await Reset(formData);
    if (result?.error) {
      SetColor("red");
    }
    if (result?.success) {
      SetColor("green");
    } else {
      SetColor("");
    }
    setMessage(result?.success || result?.error || "");
    setTimeout(() => {
      setMessage("");
      SetColor("");
    }, 3000);
  };
  return (
    <div className="w-screen h-screen grid grid-rows-10 gap-1">
      <div className="h-full flex flex-col justify-end row-span-2 gap-1 p-4">
        <Texts text={"white"} className="justify-end" size={"md"}>
          {t("RecoveryPageTitle")}
        </Texts>
      </div>
      <div className="h-full row-span-8 flex flex-col bg-white border border-zinc-300 p-4 gap-4">
        <Forms
          onSubmit={handlePasswordReset}
          className="max-w-[600px] w-full mx-auto h-full flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1 h-full">
            <Label> {t("Email")}</Label>
            <Input
              className={`border p-2 rounded-md transition-colors duration-150 border-zinc-300`}
              type="email"
              name="email"
              id="email"
              placeholder="Email"
            />

            <Texts
              size={"p3"}
              className={
                color === "green" ? "text-emerald-600/80" : " text-red-600"
              }
            >
              {message}
            </Texts>
          </div>
          <div className="w-full flex flex-row gap-4 mt-4">
            <div className="w-full">
              <Button
                className="bg-white border-app-dark-blue border-2 w-full"
                type="button"
                onClick={() => router.back()}
              >
                <p className="text-app-dark-blue font-semibold text-base">
                  {t("Back")}
                </p>
              </Button>
            </div>
            <div className="w-full">
              <Button className="bg-app-dark-blue w-full" type="submit">
                <p className="text-white font-semibold text-base">
                  {t("SendEmail")}
                </p>
              </Button>
            </div>
          </div>
        </Forms>
      </div>
    </div>
  );
}
