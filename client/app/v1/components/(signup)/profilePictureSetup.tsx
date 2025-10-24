"use client";
import { useState } from "react";
import CameraComponent from "../(camera)/camera";
import { Texts } from "../(reusable)/texts";
import { useTranslations } from "next-intl";
import { ProgressBar } from "./progressBar";
import { Button } from "../ui/button";
import { useUserStore } from "@/app/lib/store/userStore";

type prop = {
  userId: string;
  handleNextStep: () => void;
  totalSteps: number;
  currentStep: number;
};

export default function ProfilePictureSetup({
  userId,
  handleNextStep,
  totalSteps,
  currentStep,
}: prop) {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const t = useTranslations("SignUpProfilePicture");

  const handleUpload = async (file: Blob) => {
    if (!userId) {
      console.warn("No user id");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("file", file, "profile.png");
      formData.append("folder", "profileImages");

      const res = await fetch("/api/uploadBlobs", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await res.json();
      // Add cache-busting param to break browser cache
      const cacheBustedUrl = `${url}?t=${Date.now()}`;
      // Make a post route to finish user setup\
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const dbRes = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileImage: cacheBustedUrl,
        }),
      }).then((res) => res.json());

      if (!dbRes.success) {
        throw new Error("Error updating url in DB");
      }
      // Update user store with new image
      useUserStore.getState().setImage(cacheBustedUrl);

      return cacheBustedUrl;
    } catch (err) {
      console.error("[Error uploading new image or updating DB:", err);
    }
  };

  const handleSubmitImage = async () => {
    // Check that we have an image blob
    if (!imageBlob) {
      return;
    }

    setIsSubmitting(true);
    try {
      await handleUpload(imageBlob);
      localStorage.setItem("userProfileImage", "Updating");
      handleNextStep(); // Proceed to the next step only if the image upload is successful
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-dvh w-full flex flex-col">
      {/*Header - fixed at top*/}
      <div className="w-full h-[10%] flex flex-col justify-end py-3">
        <Texts text={"white"} className="justify-end" size={"sm"}>
          {t("AddProfilePicture")}
        </Texts>
      </div>
      <div className="bg-white w-full h-10 border border-slate-200 flex flex-col justify-center gap-1">
        <div className="w-[95%] max-w-[600px] mx-auto">
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white ">
        <div className="max-w-[600px] w-[95%] p-4 px-2 flex flex-col mx-auto gap-4">
          <div className=" h-full max-h-[50vh] flex flex-col items-center">
            <CameraComponent setImageBlob={setImageBlob} />
          </div>
        </div>
      </div>
      <div className="w-full h-[10%] bg-white border-t border-slate-200 px-4 py-2">
        <Button
          className={
            imageBlob ? "bg-app-dark-blue w-full" : "bg-gray-300 w-full"
          }
          onClick={handleSubmitImage}
          disabled={isSubmitting}
        >
          <p className="text-white  font-semibold text-base">
            {isSubmitting ? `${t("Submitting")}` : `${t("Next")}`}
          </p>
        </Button>
      </div>
    </div>
  );
}
