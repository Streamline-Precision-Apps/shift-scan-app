// Form.tsx
"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Inputs } from "@/components/(reusable)/inputs";
import { useTranslations } from "next-intl";

type FormProps = {
  userId: string;
  onFormSubmit: (date: string) => void;
  checked: boolean; // Add checked prop
  signature: string | null;
};

export const Form = ({ userId, checked, signature }: FormProps) => {
  const t = useTranslations("clock-out");

  return (
    <form>
      {/* Hidden inputs */}
      <Inputs type="hidden" name="date" value={new Date().toString()} />
      <Inputs
        type="checkbox"
        name="contactedSupervisor"
        value={checked ? "true" : "false"}
      />
      <Inputs type="text" name="incidentDescription" value={""} />
      <Inputs type="hidden" name="signature" value={signature ?? ""} />
      <Inputs
        type="checkbox"
        name="verifyFormSignature"
        value={checked ? "true" : "false"}
      />
      <Inputs type="hidden" name="Id" value={userId} />
      <Buttons
        type="submit"
        className="bg-app-blue w-1/2 h-1/6 py-4 px-5 rounded-lg text-black font-bold mt-5"
      >
        {t("SubmitButton")}
      </Buttons>
    </form>
  );
};
