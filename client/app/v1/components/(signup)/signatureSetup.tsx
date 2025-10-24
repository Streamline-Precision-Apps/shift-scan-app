"use client";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Texts } from "../(reusable)/texts";
import { Holds } from "../(reusable)/holds";
import { useTranslations } from "next-intl";
import { Images } from "../(reusable)/images";
import { ProgressBar } from "./progressBar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import SignatureSetUpModal from "./signatureSetupModal";
import { useUserStore } from "@/app/lib/store/userStore";

interface SignatureSetupProps {
  userId: string;
  handleNextStep: () => void;
  totalSteps: number;
  currentStep: number;
  setStep: Dispatch<SetStateAction<number>>;
}

const SignatureSetup: React.FC<SignatureSetupProps> = ({
  userId,
  handleNextStep,
  totalSteps,
  currentStep,
  setStep,
}) => {
  const [base64String, setBase64String] = useState<string | null>(null);
  const [editSignatureModalOpen, setEditSignatureModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [bannerMessage, setBannerMessage] = useState<string>("");

  const t = useTranslations("SignUpVirtualSignature");

  // Hide the banner after 5 seconds if it is shown
  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  useEffect(() => {
    if (base64String) {
      setStep(6); // Move to the next step when a signature is added
    }
  }, [base64String]);

  const handleSubmitImage = async () => {
    if (!base64String) {
      setBannerMessage("Please capture a signature before proceeding.");
      setShowBanner(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature: base64String,
        }),
      }).then((res) => res.json());

      if (!res.success) {
        throw new Error("Error updating signature in DB");
      }
      useUserStore.getState().setUser(res.data);

      handleNextStep(); // Proceed to the next step only if the image upload is successful
    } catch (error) {
      console.error("Error uploading signature:", error);
      setBannerMessage(
        "There was an error uploading your signature. Please try again."
      );
      setShowBanner(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-dvh w-full flex flex-col">
      {/*Header - fixed at top*/}
      <div className="w-full h-[10%] flex flex-col justify-end py-3">
        <Texts text={"white"} className="justify-end" size={"sm"}>
          {t("AddASignature")}
        </Texts>
      </div>
      <div className="bg-white w-full h-10 border border-slate-200 flex flex-col justify-center gap-1">
        <div className="w-[95%] max-w-[600px] mx-auto">
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>
      {/*Middle - scrollable content*/}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white pb-[200px]">
        <div className="max-w-[600px] w-[95%] p-4 px-2 flex flex-col mx-auto gap-4">
          <div className=" h-full max-h-[60vh] flex flex-col items-center gap-8">
            <p className="text-xs text-gray-400">{t("AddYourBestSignature")}</p>
            <div>
              <Holds className="w-[300px] h-[200px] rounded-[10px] border-[3px] border-black justify-center items-center relative ">
                {base64String && (
                  <Images
                    titleImg={base64String}
                    titleImgAlt={t("Signature")}
                    className="justify-center items-center "
                    size={"50"}
                  />
                )}
                <Holds
                  background={"orange"}
                  className="absolute top-1 right-1 w-fit h-fit rounded-full border-[3px] border-black p-2"
                  onClick={() => setEditSignatureModalOpen(true)}
                >
                  <Images
                    titleImg="/formEdit.svg"
                    titleImgAlt={"Edit"}
                    className="max-w-5 h-auto object-contain"
                  />
                </Holds>
              </Holds>
            </div>
          </div>
        </div>

        <Dialog
          open={editSignatureModalOpen}
          onOpenChange={() => setEditSignatureModalOpen(false)}
        >
          <DialogHeader>
            <DialogTitle className="p-0"></DialogTitle>
          </DialogHeader>
          <DialogContent className="max-w-3xl w-full rounded-lg">
            <div className="mt-4">
              <SignatureSetUpModal
                setBase64String={setBase64String}
                closeModal={() => setEditSignatureModalOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/*Footer - fixed at bottom*/}
      <div className="w-full h-[10%] bg-white border-t border-slate-200 px-4 py-2">
        <Button
          className={
            base64String ? "bg-green-500 w-full" : "bg-gray-300 w-full"
          }
          onClick={handleSubmitImage}
          disabled={isSubmitting}
        >
          {currentStep === totalSteps ? (
            <p className="text-white font-semibold text-base">
              {isSubmitting ? `${t("Submitting")}` : `${t("CompleteSetup")}`}
            </p>
          ) : (
            <p className="text-white font-semibold text-base">
              {isSubmitting ? `${t("Submitting")}` : `${t("Next")}`}
            </p>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SignatureSetup;
