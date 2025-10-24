"use client";
import "@/app/globals.css";
import { useEffect, useState } from "react";

import { z } from "zod";

import { useRouter } from "next/navigation";
import { EnterAccountInfo } from "@/app/v1/components/(signup)/EnterAccountInfo";
import ResetPassword from "@/app/v1/components/(signup)/resetPassword";
import NotificationSettings from "@/app/v1/components/(signup)/notificationSettings";
import ProfilePictureSetup from "@/app/v1/components/(signup)/profilePictureSetup";
import SignatureSetup from "@/app/v1/components/(signup)/signatureSetup";
import { useUserStore } from "@/app/lib/store/userStore";

// Define Zod schema for validating props
const propsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  accountSetup: z.boolean(),
});

// Validation logic
function validateProps(userId: string, accountSetup: boolean) {
  try {
    propsSchema.parse({ userId, accountSetup });
    return true;
  } catch (error) {
    console.error("Invalid props:", error);
    return false;
  }
}

export default function Content({
  userId,
  accountSetup,
  userName,
}: {
  userId: string;
  accountSetup: boolean;
  userName: string;
}) {
  const router = useRouter();
  const isValid = validateProps(userId, accountSetup); // Ensure this is at the top
  const [step, setStep] = useState(1); // Always call useState
  const totalSteps = 6; // Total number of steps in the signup process
  const handleComplete = async () => {
    try {
      // Make a post route to finish user setup\
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountSetup: true }),
      }).then((res) => res.json());

      if (res.success) {
        useUserStore.getState().setUser(res.data);
        return router.push("/v1");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  // Early return after hooks are declared
  if (!isValid) return <div>Error: Invalid props provided.</div>;

  return (
    <>
      {step === 1 && (
        <EnterAccountInfo
          userId={userId}
          handleNextStep={handleNextStep}
          userName={userName}
          totalSteps={totalSteps}
          currentStep={step}
        />
      )}

      {step === 2 && (
        <ResetPassword
          userId={userId}
          handleNextStep={handleNextStep}
          totalSteps={totalSteps}
          currentStep={step}
        />
      )}
      {step === 3 && (
        <NotificationSettings
          userId={userId}
          handleNextStep={handleNextStep}
          totalSteps={totalSteps}
          currentStep={step}
        />
      )}
      {step === 4 && (
        <ProfilePictureSetup
          userId={userId}
          handleNextStep={handleNextStep}
          totalSteps={totalSteps}
          currentStep={step}
        />
      )}

      {(step === 5 || step === 6) && (
        <SignatureSetup
          userId={userId}
          handleNextStep={handleComplete}
          setStep={setStep}
          totalSteps={totalSteps}
          currentStep={step}
        />
      )}
    </>
  );
}
