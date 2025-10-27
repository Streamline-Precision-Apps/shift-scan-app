import { Contents } from "@/components/(reusable)/contents";
import { Suspense, useEffect, useState } from "react";
import { deleteRefuelLog, updateRefuelLog } from "@/actions/tascoActions";
import SlidingDiv from "@/components/(animations)/slideDelete";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { useTranslations } from "next-intl";
import Spinner from "@/components/(animations)/spinner";

export type Refueled = {
  id: string;
  tascoLogId: string;
  gallonsRefueled: number;
};

export default function RefuelLogsList({
  refuelLogs,
  setRefuelLogs,
}: {
  refuelLogs: Refueled[] | undefined;
  setRefuelLogs: React.Dispatch<React.SetStateAction<Refueled[] | undefined>>;
}) {
  const [editedRefuel, setEditedRefuel] = useState<Refueled[]>(
    refuelLogs || [],
  );
  const t = useTranslations("Tasco");
  const handleDelete = async (id: string) => {
    try {
      await deleteRefuelLog({ type: "tasco", id });
      const newRefueledLogs = editedRefuel.filter((rL) => rL.id !== id);
      setEditedRefuel(newRefueledLogs);
      setRefuelLogs(newRefueledLogs);
    } catch (error) {
      console.error("Failed to delete refuel log:", error);
    }
  };

  const handleGallonsChange = (index: number, value: string | number) => {
    const newRefuel = [...editedRefuel];
    newRefuel[index].gallonsRefueled = Number(value);
    setEditedRefuel(newRefuel);
    setRefuelLogs(newRefuel);
  };

  const handleUpdateRefuelLog = async (log: Refueled) => {
    try {
      await updateRefuelLog({
        type: "tasco",
        id: log.id,
        gallonsRefueled: log.gallonsRefueled,
      });
    } catch (error) {
      console.error("Failed to update refuel log:", error);
    }
  };

  useEffect(() => {
    setEditedRefuel(refuelLogs || []);
  }, [refuelLogs]);

  return (
    <div className="w-full">
      {editedRefuel.map((rL, index) => (
        <SlidingDiv key={rL.id} onSwipeLeft={() => handleDelete(rL.id)}>
          <Inputs
            type="number"
            name="gallons"
            placeholder={t("TotalGallons")}
            value={rL.gallonsRefueled || ""}
            onChange={(e) => handleGallonsChange(index, e.target.value)}
            onBlur={() => handleUpdateRefuelLog(rL)}
            className={` text-center text-sm focus:outline-hidden focus:ring-0 ${
              rL.gallonsRefueled === 0 ? "placeholder:text-app-red " : ""
            }`}
          />
        </SlidingDiv>
      ))}
      {editedRefuel.length === 0 && (
        <div className="flex flex-col justify-center items-center p-4 text-gray-500">
          <p className="text-sm italic text-center">{t("NoRefuelLogsYet")}</p>
          <p className="text-sm italic text-center">{t("ClickToAdd")}</p>
        </div>
      )}
    </div>
  );
}
