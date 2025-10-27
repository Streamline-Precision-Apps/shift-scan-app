"use client";
import {
  deleteHaulingLogs,
  updateHaulingLogs,
} from "@/actions/truckingActions";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Selects } from "@/components/(reusable)/selects";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import SlidingDiv from "@/components/(animations)/slideDelete";
import { useDBJobsite } from "@/app/context/dbCodeContext";
import SelectableModal from "@/components/(reusable)/selectableModal";
import { useTranslations } from "next-intl";
import { Titles } from "@/components/(reusable)/titles";
import { Texts } from "@/components/(reusable)/texts";

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

export default function MaterialList({
  material,
  setMaterial,
  setContentView,
  setSelectedItemId,
}: {
  material: Material[] | undefined;
  setMaterial: Dispatch<SetStateAction<Material[] | undefined>>;
  setContentView: Dispatch<SetStateAction<"Item" | "List">>;
  setSelectedItemId: Dispatch<SetStateAction<string | null>>;
}) {
  const t = useTranslations("TruckingAssistant");
  const [editedMaterials, setEditedMaterials] = useState<Material[]>(
    material || [],
  );

  const isMaterialComplete = (mat: Material): boolean => {
    return !!mat.name && !!mat.LocationOfMaterial && mat.unit !== null;
  };

  // Update local state when prop changes
  useEffect(() => {
    setEditedMaterials(material || []);
  }, [material]);

  // Handle Delete
  const handleDelete = async (materialId: string) => {
    const updatedMaterials = editedMaterials.filter(
      (material) => material.id !== materialId,
    );
    setEditedMaterials(updatedMaterials);
    setMaterial(updatedMaterials); // Sync with parent state

    const isDeleted = await deleteHaulingLogs(materialId);

    if (!isDeleted) {
      console.error(t("FailedToDeletePleaseTryAgain"));
      setEditedMaterials(material || []);
      setMaterial(material);
    }
  };

  return (
    <>
      <Contents width={"section"} className="overflow-y-auto no-scrollbar">
        <Holds>
          {editedMaterials.length === 0 && (
            <Holds className="px-10 mt-4">
              <Texts size={"p5"} text={"gray"} className="italic">
                No Materials Hauled recorded
              </Texts>
              <Texts size={"p7"} text={"gray"}>
                {`(Tap the plus icon to add a log.)`}
              </Texts>
            </Holds>
          )}
          {editedMaterials.map((mat, index) => (
            <SlidingDiv
              key={mat.id}
              onSwipeLeft={() => handleDelete(mat.id)}
              confirmationMessage={t("DeleteMaterialPrompt")}
            >
              <Holds
                position={"row"}
                background={"lightBlue"}
                className="w-full h-full border-black border-[3px] rounded-[10px]  justify-center items-center py-1 "
                onClick={() => {
                  setContentView("Item");
                  setSelectedItemId(mat.id);
                }}
              >
                <Texts
                  text={isMaterialComplete(mat) ? "black" : "red"}
                  size={"p4"}
                >
                  {mat.name === "Material"
                    ? `${mat.name} ${index + 1}`
                    : mat.name
                      ? mat.name
                      : t("NoMaterialTypeSelected")}
                </Texts>
              </Holds>
            </SlidingDiv>
          ))}
        </Holds>
      </Contents>
    </>
  );
}
