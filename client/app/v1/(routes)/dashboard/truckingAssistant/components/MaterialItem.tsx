"use client";
import { updateHaulingLogs } from "@/actions/truckingActions";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Selects } from "@/components/(reusable)/selects";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import debounce from "lodash.debounce";
import { useTranslations } from "next-intl";
import { Buttons } from "@/components/(reusable)/buttons";
import { Images } from "@/components/(reusable)/images";

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

export default function MaterialItem({
  material,
  setMaterial,
  setContentView,
  selectedItemId,
  setSelectedItemId,
}: {
  material: Material[] | undefined;
  setMaterial: Dispatch<SetStateAction<Material[] | undefined>>;
  setContentView: Dispatch<SetStateAction<"Item" | "List">>;
  selectedItemId: string | null;
  setSelectedItemId: Dispatch<SetStateAction<string | null>>;
}) {
  const t = useTranslations("TruckingAssistant");
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [materialTypes, setMaterialTypes] = useState<
    { id: string; name: string }[]
  >([]);

  // Find the selected material when selectedItemId changes
  useEffect(() => {
    if (selectedItemId && material) {
      const foundMaterial = material.find((mat) => mat.id === selectedItemId);
      setCurrentMaterial(foundMaterial || null);
    }
  }, [selectedItemId, material]);

  // Debounced server update function - memoized to prevent recreation on every render
  const updateHaulingLog = useCallback(
    debounce(async (updatedMaterial: Material) => {
      const formData = new FormData();
      formData.append("id", updatedMaterial.id);
      formData.append("name", updatedMaterial.name || "");
      formData.append(
        "LocationOfMaterial",
        updatedMaterial.LocationOfMaterial || "",
      );
      formData.append("unit", updatedMaterial.unit || "");
      formData.append("loadType", updatedMaterial.loadType?.toString() || "");
      formData.append("quantity", updatedMaterial.quantity?.toString() || "0");
      formData.append("truckingLogId", updatedMaterial.truckingLogId);

      await updateHaulingLogs(formData);
    }, 1000),
    [],
  );

  // Handle Input Change
  const handleChange = (field: keyof Material, value: string | number) => {
    if (!currentMaterial) return;

    const updatedMaterial = {
      ...currentMaterial,
      [field]: value,
    };

    setCurrentMaterial(updatedMaterial);

    // Update the parent state
    setMaterial((prev) =>
      prev?.map((mat) =>
        mat.id === currentMaterial.id ? updatedMaterial : mat,
      ),
    );

    // Trigger server action to update database
    updateHaulingLog(updatedMaterial);
  };

  if (!currentMaterial) {
    return (
      <Contents className="h-full flex items-center justify-center">
        <Holds>
          <p>{t("NoMaterialSelected")}</p>
          <Buttons onClick={() => setContentView("List")}>
            {t("BackToList")}
          </Buttons>
        </Holds>
      </Contents>
    );
  }

  return (
    <>
      {/* Back button */}
      <Buttons
        background={"none"}
        shadow={"none"}
        position={"left"}
        className=" w-12 h-12 absolute top-0 left-4"
        onClick={() => {
          setContentView("List");
          setSelectedItemId(null);
        }}
      >
        <Images
          titleImg="/arrowBack.svg"
          titleImgAlt="Back Icon"
          className="h-8 w-8 object-contain"
        />
      </Buttons>

      {/* Material details */}
      <Holds background={"white"} className="pt-10">
        <Contents width={"section"}>
          {" "}
          <Holds className="mb-2">
            <label className="text-sm font-medium">
              {t("MaterialName")}
              <span className="text-red-500 pl-0.5">*</span>
            </label>
            <Inputs
              type="text"
              value={currentMaterial.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full text-base pl-2"
              placeholder={t("EnterMaterialType")}
            />
          </Holds>
          <Holds className="mb-2">
            <label className="text-sm font-medium">
              {t("OriginOfMaterial")}
              <span className="text-red-500 pl-0.5">*</span>
            </label>
            <Inputs
              type="text"
              value={currentMaterial.LocationOfMaterial || ""}
              onChange={(e) =>
                handleChange("LocationOfMaterial", e.target.value)
              }
              className="w-full text-base pl-2"
            />
          </Holds>
          <div className="flex flex-row gap-2 ">
            <Holds className="mb-2">
              <label className="text-sm font-medium">
                {t("quantity")}
                <span className="text-red-500 pl-0.5">*</span>
              </label>
              <Inputs
                type="number"
                value={currentMaterial.quantity?.toString() || ""}
                onChange={(e) =>
                  handleChange("quantity", parseFloat(e.target.value) || 0)
                }
                className="w-full text-base pl-2"
              />
            </Holds>
            <Holds className="mb-2">
              <label className="text-sm font-medium">
                {t("unit")}
                <span className="text-red-500 pl-0.5">*</span>
              </label>

              <Selects
                value={currentMaterial.unit || ""}
                onChange={(e) => handleChange("unit", e.target.value)}
                className="w-full pl-2 h-10 text-base"
              >
                <option value="">Select a unit</option>
                <option value="YARDS">Yards</option>
                <option value="TONS">Tons</option>
              </Selects>
            </Holds>
          </div>
          {/* TODO: These fields don't exist in current database schema - temporarily commented out */}
          {/*
          <Holds className="mb-2">
            <label className="text-sm font-medium ">
              {t("LightWeight")} <span className="text-red-500 pl-0.5">*</span>
            </label>
            <Inputs
              type="number"
              value={currentMaterial.lightWeight?.toString() || ""}
              onChange={(e) =>
                handleChange("lightWeight", parseFloat(e.target.value) || 0)
              }
              className="w-full text-base pl-2"
            />
          </Holds>
          <Holds className="mb-2">
            <label className="text-sm font-medium ">
              {t("GrossWeight")}
              <span className="text-red-500 pl-0.5">*</span>
            </label>
            <Inputs
              type="number"
              value={currentMaterial.grossWeight?.toString() || ""}
              onChange={(e) =>
                handleChange("grossWeight", parseFloat(e.target.value) || 0)
              }
              className="w-full text-base pl-2"
            />
          </Holds>
          */}
          <Holds className="mb-2">
            <label className="text-sm font-medium">{t("LoadType")}</label>

            <Selects
              value={currentMaterial.loadType || ""}
              onChange={(e) => handleChange("loadType", e.target.value)}
              className="w-full pl-2 text-base"
            >
              <option value="">Select Load Type</option>
              <option value="UNSCREENED">Unscreened</option>
              <option value="SCREENED">Screened</option>
            </Selects>
          </Holds>
        </Contents>
        {/* Add more fields as needed */}
      </Holds>
    </>
  );
}
