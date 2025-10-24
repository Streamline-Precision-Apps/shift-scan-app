"use client";
import React from "react";
import { Buttons } from "../(reusable)/buttons";
import { useTranslations } from "next-intl";
import { Holds } from "../(reusable)/holds";
import { Titles } from "../(reusable)/titles";

interface StepButtonsProps {
  handleNextStep: () => void;
  isLastStep?: boolean;
  disabled: boolean;
}

export default function StepButtons({
  handleNextStep,
  isLastStep,
  disabled,
}: StepButtonsProps) {
  const t = useTranslations("Clock");
  return (
    <Holds className="h-full w-full">
      <Buttons
        background={disabled ? "darkGray" : "orange"}
        onClick={handleNextStep}
        disabled={disabled}
        className="py-2"
      >
        <Titles size={"md"}>{isLastStep ? t("Submit") : t("Continue")}</Titles>
      </Buttons>
    </Holds>
  );
}
