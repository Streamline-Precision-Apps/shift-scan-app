import { CreateEmployeeEquipmentLog } from "@/actions/equipmentActions";
import Spinner from "@/components/(animations)/spinner";
import SimpleQr from "@/components/(clock)/simple-qr";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  RefObject,
} from "react";
type Option = {
  label: string;
  code: string;
};

export default function EquipmentScanner({
  setStep,
  setMethod,
  setEquipmentQr,
  setError,
  equipmentQr,
  jobSite,
  submitRef,
}: {
  setStep: Dispatch<SetStateAction<number>>;
  setMethod: Dispatch<SetStateAction<"" | "Scan" | "Select">>;
  setError: Dispatch<SetStateAction<string | null>>;
  setEquipmentQr: Dispatch<SetStateAction<string | null>>;
  equipmentQr: string | null;
  jobSite: Option;
  submitRef: RefObject<boolean>;
}) {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const id = session?.user?.id || ""; // Get the user ID from the session
  const router = useRouter();
  const t = useTranslations("Equipment");

  // Handle the QR scan completion
  const handleScanComplete = async (scannedId: string) => {
    if (submitRef.current) return;
    submitRef.current = true;

    // Format the scannedId: keep EQ- prefix capitalized and make the rest lowercase
    let formattedId = scannedId;
    if (scannedId.startsWith("EQ-") || scannedId.startsWith("eq-")) {
      // Keep the "EQ-" prefix and make the rest lowercase
      formattedId = "EQ-" + scannedId.substring(3).toLowerCase();
    } else {
      // If it doesn't start with EQ-, just lowercase the entire string
      formattedId = scannedId.toLowerCase();
    }

    setEquipmentQr(formattedId);
    setScanned(true);
    setLoading(true);

    try {
      // Get timesheet ID from local storage
      const timeSheetData = localStorage.getItem("timesheetId");
      let timeSheetId: string | null = null;

      if (timeSheetData) {
        try {
          const parsedData = JSON.parse(timeSheetData);
          timeSheetId = parsedData.id.toString();
        } catch (e) {
          console.error("Error parsing timesheet data from localStorage:", e);
        }
      }

      if (!timeSheetId) {
        throw new Error("No active timesheet found. Please clock in first.");
      }

      const formData = new FormData();
      formData.append("equipmentId", formattedId); // Use the formatted ID
      formData.append("jobsiteId", jobSite?.code || "");
      formData.append("startTime", new Date().toString());
      formData.append("timeSheetId", timeSheetId);

      const result = await CreateEmployeeEquipmentLog(formData);
      if (result) {
        router.push("/dashboard/equipment");
      }
    } catch (error) {
      console.error("Error submitting equipment log:", error);
      setEquipmentQr(null);
      setError(error instanceof Error ? error.message : t("scanError"));
      setStep(1);
    } finally {
      setLoading(false);
      submitRef.current = false;
    }
  };

  // Reset scanned state when equipmentQr changes
  useEffect(() => {
    if (equipmentQr) {
      setScanned(false);
    }
  }, [equipmentQr]);

  return (
    <Holds className="h-full ">
      <Grids rows={"7"} gap={"5"}>
        <Holds className="h-full row-start-1 row-end-2">
          <TitleBoxes
            onClick={() => {
              setStep(1);
              setMethod("");
            }}
          >
            <Holds className="h-full justify-end">
              <Titles size={"h2"}>{t("ScanEquipment")}</Titles>
            </Holds>
          </TitleBoxes>
        </Holds>

        {loading ? (
          <Holds className="size-full row-start-3 row-end-7 px-4">
            <Holds className="flex justify-center items-center h-full w-full">
              <Spinner size={40} />
            </Holds>
          </Holds>
        ) : (
          <>
            <Holds className="size-full row-start-3 row-end-6 px-4">
              <SimpleQr
                setScannedId={setEquipmentQr}
                setScanned={setScanned}
                onScanComplete={handleScanComplete}
              />
            </Holds>
          </>
        )}
      </Grids>
    </Holds>
  );
}
