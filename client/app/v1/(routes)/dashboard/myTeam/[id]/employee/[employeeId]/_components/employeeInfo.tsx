"use client";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  email: string;
  DOB?: Date;
  clockedIn?: boolean;
};

type Contact = {
  phoneNumber: string;
  emergencyContact?: string;
  emergencyContactNumber?: string;
};

import Spinner from "@/components/(animations)/spinner";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Labels } from "@/components/(reusable)/labels";
import { Texts } from "@/components/(reusable)/texts";
import { formatPhoneNumber } from "@/utils/phoneNumberFormater";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { PhoneCall } from "lucide-react";
import { useState } from "react";

export default function EmployeeInfo({
  employee,
  contacts,
  loading,
}: {
  employee: Employee | null;
  contacts: Contact | null;
  loading: boolean;
}) {
  const t = useTranslations("MyTeam");
  const [showModal, setShowModal] = useState(false);
  return (
    <Contents width={"section"} className="pt-2 pb-5">
      {loading ? (
        <Holds
          background={"white"}
          className="h-full justify-center items-center animate-pulse"
        >
          <Spinner size={70} />
        </Holds>
      ) : (
        <div className="h-full w-full bg-white">
          <div className="flex justify-center items-center relative w-24 h-24 mx-auto">
            <img
              src={employee?.image ? employee.image : "/profileFilled.svg"}
              alt="Team"
              className="w-24 h-24 rounded-full border-[3px] border-black"
              onClick={() => setShowModal(true)}
            />
            <Holds
              background={employee?.clockedIn ? "green" : "lightGray"}
              className="absolute top-1 right-3 w-6 h-6 rounded-full p-1.5 border-[3px] border-black"
            />
          </div>
          <Labels htmlFor={"phoneNumber"} size={"sm"}>
            {t("PhoneNumber")}
          </Labels>
          <div className="w-full h-10 flex justify-center items-center gap-2 border-black border-[3px] rounded-[10px] relative ">
            <Texts className="text-center text-sm ">
              {formatPhoneNumber(contacts?.phoneNumber)}
            </Texts>
            <Buttons
              className="w-10 h-9 rounded-r-none rounded-l-[8px] border-none  flex justify-center items-center absolute -left-1"
              shadow={"none"}
              href={`tel:${contacts?.phoneNumber}`}
              background={"darkBlue"}
            >
              <PhoneCall color="white" />
            </Buttons>
          </div>
          <Labels htmlFor={"email"} size={"sm"}>
            {t("Email")}
          </Labels>
          <Inputs
            name={"email"}
            className={"text-center text-sm"}
            value={employee?.email}
            readOnly
          />
          <Labels htmlFor={"emergencyContact"} size={"sm"}>
            {t("EmergencyContact")}
          </Labels>
          <Inputs
            name={"emergencyContact"}
            className={"text-center text-sm"}
            readOnly
            value={contacts?.emergencyContact}
          />
          <Labels htmlFor={"emergencyContactNumber"} size={"sm"}>
            {t("EmergencyContactNumber")}
          </Labels>
          <div className="w-full h-10  flex justify-center items-center gap-2 border-black border-[3px] rounded-[10px] relative ">
            <Texts className="text-center text-sm ">
              {formatPhoneNumber(contacts?.emergencyContactNumber)}
            </Texts>
            <Buttons
              className="w-10 h-9 rounded-r-none rounded-l-[8px] border-none flex justify-center items-center absolute -left-1"
              shadow={"none"}
              href={`tel:${contacts?.emergencyContactNumber}`}
              background={"darkBlue"}
            >
              <PhoneCall color="white" />
            </Buttons>
          </div>

          <Labels htmlFor={"dob"} size={"sm"}>
            {t("DOB")}
            <Inputs
              name={"dob"}
              className={"text-center text-sm"}
              readOnly
              value={
                employee?.DOB
                  ? format(new Date(employee?.DOB), "MM/dd/yyyy")
                  : ""
              }
            />
          </Labels>
        </div>
      )}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-white text-2xl font-bold bg-black bg-opacity-40 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={employee?.image ? employee.image : "/profileFilled.svg"}
              alt="Profile Large"
              className="rounded-lg max-w-md max-h-[80vh] shadow-lg"
            />
          </div>
        </div>
      )}
    </Contents>
  );
}
