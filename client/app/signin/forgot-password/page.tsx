"use client";
import "@/app/globals.css";
import { Texts } from "@/app/v1/components/(reusable)/texts";
import { Forms } from "@/app/v1/components/(reusable)/forms";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/app/v1/components/ui/label";
import { Button } from "@/app/v1/components/ui/button";
import { useTranslations } from "next-intl";
import { Input } from "@/app/v1/components/ui/input";
import { Reset } from "@/app/lib/actions/reset";
import { Titles } from "@/app/v1/components/(reusable)/titles";

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
    <main className="relative min-h-screen overflow-hidden bg-app-gradient bg-to-br from-app-dark-blue via-app-blue to-app-blue px-4 py-8 md:py-0 md:max-h-screen flex flex-col items-center justify-center">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-app-dark-blue via-app-blue to-app-blue animate-gradient-move opacity-80" />
        <div className="absolute left-1/2 top-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-app-blue opacity-20 rounded-full blur-3xl" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-app-blue opacity-10 rounded-full blur-2xl" />
      </div>
      <div className="relative z-10 w-full h-[90vh] max-w-md">
        <div className="bg-white/95 h-full backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 space-y-8 md:space-y-6">
          <div className="text-center h-full flex flex-col justify-center items-center gap-4">
            <div className="w-full h-full flex flex-col  gap-4 items-center justify-center">
              <Forms
                onSubmit={handlePasswordReset}
                className=" w-full mx-auto h-[calc(100vh-80px)] flex flex-col justify-between"
              >
                <div className="h-fit flex flex-col space-y-2 w-full mb-4">
                  <h1 className="text-xl font-bold text-app-dark-blue mb-2">
                    {t("ForgotPasswordTitle")}
                  </h1>
                  <Texts size={"sm"} className="text-center text-gray-600 ">
                    {t("RecoveryPageTitle")}
                  </Texts>
                </div>
                <div className="flex flex-col flex-1 gap-1 overflow-y-auto p-1">
                  <Label className="text-left"> {t("Email")}</Label>
                  <Input
                    className={`border p-2 rounded-md transition-colors duration-150 border-zinc-300`}
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                  />

                  <div className="mt-2 w-full h-6 ">
                    <Texts
                      size={"md"}
                      className={
                        color === "green"
                          ? "text-emerald-600/80"
                          : " text-red-600"
                      }
                    >
                      {message}
                    </Texts>
                  </div>
                </div>
                <div className="w-full flex flex-row gap-4 mt-4 shrink-0">
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
        </div>
      </div>
    </main>
  );
}
