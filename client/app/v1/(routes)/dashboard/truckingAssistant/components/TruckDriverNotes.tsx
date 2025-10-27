"use client";
import { updateTruckDrivingNotes } from "@/actions/truckingActions";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";

export default function TruckDriverNotes({
  truckingLog,
  notes,
  setNotes,
}: {
  truckingLog: string | undefined;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}) {
  const t = useTranslations("TruckingAssistant");
  const UpdateNotes = async () => {
    const formData = new FormData();
    formData.append("comment", notes ?? "");
    formData.append("id", truckingLog ?? "");
    await updateTruckDrivingNotes(formData);
  };
  return (
    <>
      <div className="w-full border-b-[2px] border-black mb-1">
        <Titles size={"md"} className="text-left">
          {t("Comments")}
        </Titles>
      </div>
      <div className="flex flex-1 relative">
        <TextAreas
          name="notes"
          maxLength={40}
          value={notes}
          placeholder={t("WriteYourNotesHere")}
          className="h-full w-full text-base focus:outline-hidden focus:ring-transparent focus:border-current "
          onChange={(e) => setNotes(e.target.value)}
          onBlur={(e) => UpdateNotes()}
        />
        <Texts
          size={"p2"}
          className={`absolute bottom-5 right-2 ${
            notes.length >= 40 ? " text-red-500" : ""
          }`}
        >
          {notes.length}/40
        </Texts>
      </div>
    </>
  );
}
