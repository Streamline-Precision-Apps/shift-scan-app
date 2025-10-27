import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { useEffect, useState } from "react";
import MaterialList from "./MaterialList";
import { createHaulingLogs } from "@/actions/truckingActions";
import { Texts } from "@/components/(reusable)/texts";
import { useTranslations } from "next-intl";
import MaterialItem from "./MaterialItem";

type Material = {
  id: string;
  truckingLogId: string;
  LocationOfMaterial: string | null;
  name: string;
  quantity: number | null;
  unit: string;
  loadType: LoadType | null;
  createdAt: Date;
};

enum LoadType {
  UNSCREENED,
  SCREENED,
}

export default function OperatorHaulingLogs({
  truckingLog,
  material,
  setMaterial,
  isLoading,
}: {
  setMaterial: React.Dispatch<React.SetStateAction<Material[] | undefined>>;
  truckingLog: string | undefined;
  material: Material[] | undefined;
  isLoading: boolean;
}) {
  const t = useTranslations("TruckingAssistant");
  const [contentView, setContentView] = useState<"Item" | "List">("List");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  // Add Temporary Material
  const addTempMaterial = async () => {
    const formData = new FormData();
    formData.append("truckingLogId", truckingLog ?? "");
    formData.append("name", "Material");
    formData.append("quantity", "1");

    try {
      const tempMaterial = await createHaulingLogs(formData);
      setMaterial((prev) => [
        {
          id: tempMaterial.id,
          name: tempMaterial.name ?? "Material",
          LocationOfMaterial: "",
          truckingLogId: tempMaterial.truckingLogId,
          quantity: tempMaterial.quantity,
          unit: tempMaterial.unit ?? "",
          loadType: null,
          createdAt: tempMaterial.createdAt ?? new Date(),
        },
        ...(prev ?? []),
      ]);
    } catch (error) {
      console.error(t("ErrorAddingMaterial"), error);
    }
  };

  useEffect(() => {
    setMaterial(material ?? []);
  }, [material]);

  return (
    <Grids rows={"10"}>
      <Holds
        background={"white"}
        className={"w-full h-full rounded-t-none row-start-1 row-end-2 "}
      >
        <Contents width={"section"} className="h-full">
          <Holds position={"row"} className="h-full gap-2">
            <Holds size={"80"}>
              <Texts size={"p3"} className="font-semibold">
                Did you haul material?
              </Texts>
            </Holds>
            <Holds size={"20"} className="my-auto">
              <Buttons
                background={"green"}
                className="py-1.5"
                onClick={() => addTempMaterial()}
              >
                +
              </Buttons>
            </Holds>
          </Holds>
        </Contents>
      </Holds>
      <Holds
        className={`${
          isLoading
            ? "w-full h-full row-start-2 row-end-11 pt-5 animate-pulse"
            : "w-full h-full row-start-2 row-end-11 pt-5"
        }`}
      >
        <Holds
          background={"white"}
          className="w-full h-full  overflow-y-auto no-scrollbar"
        >
          {contentView === "Item" ? (
            <MaterialItem
              material={material}
              setMaterial={setMaterial}
              setContentView={setContentView}
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
            />
          ) : (
            contentView === "List" && (
              <MaterialList
                material={material}
                setMaterial={setMaterial}
                setContentView={setContentView}
                setSelectedItemId={setSelectedItemId}
              />
            )
          )}
        </Holds>
      </Holds>
    </Grids>
  );
}
