import { useTranslations } from "next-intl";
import { Texts } from "../(reusable)/texts";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ProgressBar } from "./progressBar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { useUserStore } from "@/app/lib/store/userStore";
import { setLocaleCookie } from "@/app/lib/client/cookie-utils";

export const EnterAccountInfo = ({
  userId,
  handleNextStep,
  userName,
  totalSteps,
  currentStep,
}: {
  userId: string;
  handleNextStep: () => void;
  userName: string;
  totalSteps: number;
  currentStep: number;
}) => {
  const t = useTranslations("SignUpAccountInfo");

  const [form, setForm] = useState({
    email: "",
    phoneNumber: "",
    date: undefined as Date | undefined,
    language: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    phoneNumber: false,
    emergencyContactPhone: false,
  });

  // Simple email and phone regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Phone must be at least 9 digits
  const phoneDigits = (val: string) => val.replace(/\D/g, "");
  const phoneValid = phoneDigits(form.phoneNumber).length >= 10;
  const emergencyPhoneValid =
    phoneDigits(form.emergencyContactPhone).length >= 10;
  const emailValid = emailRegex.test(form.email);

  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Example server action placeholder
  // async function submitToServer(data: typeof form) { ... }

  // Format phone as 3-3-4 (US style)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (field === "phoneNumber" || field === "emergencyContactPhone") {
        // Only store digits in state
        value = value.replace(/\D/g, "").slice(0, 10);
      }
      setForm((prev) => ({ ...prev, [field]: value }));
      if (
        field === "email" ||
        field === "phoneNumber" ||
        field === "emergencyContactPhone"
      ) {
        setTouched((prev) => ({ ...prev, [field]: true }));
      }
    };

  const handleLanguageChange = (value: string) => {
    setForm((prev) => ({ ...prev, language: value }));
    setLocaleCookie(value);
  };

  const handleDateChange = (date: Date | undefined) => {
    setForm((prev) => ({ ...prev, date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all as touched for validation
    setTouched({
      email: true,
      phoneNumber: true,
      emergencyContactPhone: true,
    });

    // Validate all fields
    if (!emailValid || !phoneValid || !emergencyPhoneValid) {
      return;
    }

    const data = new FormData();
    data.append("id", userId);
    data.append("email", form.email);
    data.append("DOB", form.date ? form.date.toISOString() : "");
    data.append("phoneNumber", form.phoneNumber);
    data.append("language", form.language);
    data.append("emergencyContact", form.emergencyContactName);
    data.append("emergencyContactNumber", form.emergencyContactPhone);

    // Make a post route to finish user setup\
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        DOB: form.date ? form.date.toISOString() : "",
        Contact: {
          phoneNumber: form.phoneNumber,
          emergencyContactName: form.emergencyContactName,
          emergencyContactNumber: form.emergencyContactPhone,
        },
        UserSettings: {
          language: form.language,
        },
      }),
    }).then((res) => res.json());

    if (res.success) {
      useUserStore.getState().setUser(res.data);
    }

    handleNextStep();
  };
  return (
    <div className="h-dvh w-full flex flex-col">
      {/*Header - fixed at top*/}
      <div className="w-full h-[10%] flex flex-col justify-end py-3">
        <Texts text={"white"} className="justify-end" size={"sm"}>
          {t("ItsTimeToSetUpYourAccount")}
        </Texts>
        <Texts text={"white"} className="justify-end" size={"sm"}>
          {userName}
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
          <div>
            <Label>{t("LanguagePreference")}</Label>
            <Select value={form.language} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("SelectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="en">{t("English")}</SelectItem>
                  <SelectItem value="es">{t("Spanish")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <Label>{t("DateOfBirth")}</Label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="justify-between font-normal"
                >
                  {form.date ? form.date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={form.date}
                  captionLayout="dropdown"
                  onSelect={(date: Date | undefined) => {
                    handleDateChange(date);
                    setDatePopoverOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>{t("Email")}</Label>
            <Input
              placeholder={t("EnterYourEmail")}
              className={`border p-2 rounded-md transition-colors duration-150 ${
                touched.email && !emailValid && form.email
                  ? "border-red-500 bg-red-50"
                  : touched.email && emailValid
                  ? "border-green-500 bg-green-50"
                  : "border-zinc-300"
              }`}
              value={form.email}
              onChange={handleChange("email")}
              name="email"
              type="email"
              autoComplete="email"
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              aria-invalid={
                touched.email && !emailValid && form.email ? "true" : "false"
              }
            />
            {touched.email && form.email && !emailValid && (
              <span className="text-xs text-red-600 mt-1">
                {t("InvalidEmail")}
              </span>
            )}
          </div>
          <div>
            <Label>{t("PhoneNumber")}</Label>
            <Input
              placeholder={t("EnterYourPhoneNumber")}
              className={`border p-2 rounded-md transition-colors duration-150 ${
                touched.phoneNumber && !phoneValid && form.phoneNumber
                  ? "border-red-500 bg-red-50"
                  : touched.phoneNumber && phoneValid
                  ? "border-green-500 bg-green-50"
                  : "border-zinc-300"
              }`}
              value={formatPhone(form.phoneNumber)}
              onChange={handleChange("phoneNumber")}
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              onBlur={() =>
                setTouched((prev) => ({ ...prev, phoneNumber: true }))
              }
              aria-invalid={
                touched.phoneNumber && !phoneValid && form.phoneNumber
                  ? "true"
                  : "false"
              }
              maxLength={12}
            />
            {touched.phoneNumber && form.phoneNumber && !phoneValid && (
              <span className="text-xs text-red-600 mt-1">
                {t("InvalidPhone")}
              </span>
            )}
          </div>

          <div>
            <Label>{t("EmergencyContactName")}</Label>
            <Input
              placeholder={t("EnterEmergencyContactName")}
              className="border border-zinc-300 p-2 rounded-md"
              value={form.emergencyContactName}
              onChange={handleChange("emergencyContactName")}
              name="emergencyContactName"
            />
          </div>
          <div>
            <Label>{t("EmergencyContactPhoneNumber")}</Label>
            <Input
              placeholder={t("EnterEmergencyContactPhoneNumber")}
              className={`border p-2 rounded-md transition-colors duration-150 ${
                touched.emergencyContactPhone &&
                !emergencyPhoneValid &&
                form.emergencyContactPhone
                  ? "border-red-500 bg-red-50"
                  : touched.emergencyContactPhone && emergencyPhoneValid
                  ? "border-green-500 bg-green-50"
                  : "border-zinc-300"
              }`}
              value={formatPhone(form.emergencyContactPhone)}
              onChange={handleChange("emergencyContactPhone")}
              name="emergencyContactPhone"
              type="tel"
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  emergencyContactPhone: true,
                }))
              }
              aria-invalid={
                touched.emergencyContactPhone &&
                !emergencyPhoneValid &&
                form.emergencyContactPhone
                  ? "true"
                  : "false"
              }
              maxLength={12}
            />
            {touched.emergencyContactPhone &&
              form.emergencyContactPhone &&
              !emergencyPhoneValid && (
                <span className="text-xs text-red-600 mt-1">
                  {t("InvalidPhone")}
                </span>
              )}
          </div>
        </div>
      </div>

      {/*Footer - fixed at bottom*/}
      <div className="w-full h-[10%] bg-white border-t border-slate-200 px-4 py-2">
        <Button
          className={`${
            !emailValid || !phoneValid || !emergencyPhoneValid
              ? "bg-gray-300 w-full"
              : "bg-app-dark-blue w-full"
          }`}
          onClick={handleSubmit}
        >
          <p className="text-white font-semibold text-base">{t("Next")}</p>
        </Button>
      </div>
    </div>
  );
};
