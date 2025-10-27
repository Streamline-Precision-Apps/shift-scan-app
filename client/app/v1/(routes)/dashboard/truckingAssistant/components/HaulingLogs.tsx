import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import Sliders from "@/components/(reusable)/sliders";
import { Dispatch, SetStateAction, useState } from "react";
import MaterialList from "./MaterialList";
import {
  createEquipmentHauled,
  createHaulingLogs,
  deleteEquipmentHauled,
} from "@/actions/truckingActions";
import EquipmentList from "./EquipmentList";
import { useTranslations } from "next-intl";
import MaterialItem from "./MaterialItem";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type EquipmentHauled = {
  id: string;
  truckingLogId: string | null;
  equipmentId: string | null;
  createdAt: Date;
  source: string | null;
  destination: string | null;
  Equipment: {
    id: string;
    name: string;
  } | null;
  JobSite: {
    id: string;
    name: string;
  } | null;
  startMileage: number | null;
  endMileage: number | null;
};

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

export default function HaulingLogs({
  truckingLog,
  material,
  setMaterial,
  equipmentHauled,
  setEquipmentHauled,
  isLoading,
  isComplete,
}: {
  setMaterial: React.Dispatch<React.SetStateAction<Material[] | undefined>>;
  setEquipmentHauled: Dispatch<SetStateAction<EquipmentHauled[] | undefined>>;
  truckingLog: string | undefined;
  material: Material[] | undefined;
  equipmentHauled: EquipmentHauled[] | undefined;
  isLoading: boolean;
  isComplete: {
    haulingLogsTab: boolean;
    notesTab: boolean;
    stateMileageTab: boolean;
    refuelLogsTab: boolean;
  };
}) {
  const t = useTranslations("TruckingAssistant");
  const [activeTab, setActiveTab] = useState<number>(1);
  const [contentView, setContentView] = useState<"Item" | "List">("List");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(
    null,
  );

  // Add Temporary Equipment
  const addTempEquipmentList = async () => {
    const formData = new FormData();
    formData.append("truckingLogId", truckingLog ?? "");

    try {
      const tempEquipment = await createEquipmentHauled(formData);
      setEquipmentHauled((prev) => [
        {
          id: tempEquipment.id,
          truckingLogId: tempEquipment.truckingLogId,
          equipmentId: tempEquipment.equipmentId ?? null,
          source: "",
          destination: "",
          createdAt: new Date(),
          Equipment: {
            id: "",
            name: "",
          },
          JobSite: {
            id: "",
            name: "",
          },
          startMileage: null,
          endMileage: null,
        },
        ...(prev ?? []),
      ]);
    } catch (error) {
      console.error(t("ErrorAddingEquipment"), error);
    }
  };

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
          unit: "",
          loadType: null,
          createdAt: tempMaterial.createdAt ?? new Date(),
        },
        ...(prev ?? []),
      ]);
    } catch (error) {
      console.error(t("ErrorAddingMaterial"), error);
    }
  };

  const openDeleteDialog = (id: string) => {
    setEquipmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEquipmentHauled(id);
      setEquipmentHauled(
        (prevLogs) => prevLogs?.filter((log) => log.id !== id) ?? [],
      );
      setDeleteDialogOpen(false);
      setEquipmentToDelete(null);
    } catch (error) {
      console.error("Error deleting equipment log:", error);
    }
  };

  return (
    <Grids rows={"7"} gap={"5"} className="h-full">
      <Holds
        background={"white"}
        className={"w-full h-full rounded-t-none row-start-1 row-end-2"}
      >
        <div className="h-full w-full flex items-center justify-between gap-4 pl-3 pr-2">
          <div className="w-full max-w-[200px]">
            <Sliders
              leftTitle={"Material"}
              rightTitle={"Equipment"}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          <Button
            size={"icon"}
            variant={"outline"}
            className={`${activeTab === 1 ? "bg-app-green" : equipmentHauled?.length === 0 ? "bg-app-green" : "bg-app-red"} w-10  text-black py-1.5 px-3 border-[3px] border-black rounded-[10px] shadow-none focus:ring-0 hover:${activeTab === 1 ? "bg-app-green" : equipmentHauled?.length === 0 ? "bg-app-green" : "bg-app-red"}`}
            onClick={() => {
              if (activeTab === 1) {
                addTempMaterial();
              } else if (equipmentHauled?.length === 0) {
                addTempEquipmentList();
              } else {
                if (equipmentHauled && equipmentHauled.length > 0) {
                  openDeleteDialog(equipmentHauled[0].id);
                }
              }
            }}
          >
            {activeTab === 1 ? (
              <Plus className="w-4 h-4" />
            ) : equipmentHauled?.length === 0 ? (
              <Plus className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Holds>
      <Holds
        className={`${
          isLoading
            ? "w-full h-full row-start-2 row-end-8  animate-pulse"
            : "w-full h-full row-start-2 row-end-8 overflow-y-auto no-scrollbar "
        }`}
      >
        <Holds background={"white"} className="w-full h-full">
          <Grids rows={"10"} className="h-full pt-3 pb-5  relative">
            {activeTab === 1 && (
              <Holds
                background={"white"}
                className="h-full w-full row-start-1 row-end-11"
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
            )}
            {activeTab === 2 && (
              <Holds className="h-full w-full row-start-1 row-end-11 relative">
                <EquipmentList
                  equipmentHauled={equipmentHauled || []}
                  setEquipmentHauled={setEquipmentHauled}
                  truckingLog={truckingLog ?? ""}
                />
              </Holds>
            )}
          </Grids>
        </Holds>
      </Holds>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[450px] border-black border-[3px] rounded-[10px] w-[90%]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">
              {t("ConfirmDeletion")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {t("DeleteEquipmentConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex flex-row items-center justify-center gap-4">
            <AlertDialogCancel
              asChild
              className="border-gray-200 hover:bg-white border-2 rounded-[10px]"
            >
              <Button size="lg" variant="outline" className="mt-0 w-24">
                {t("Cancel")}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction
              asChild
              className=" bg-red-500   rounded-[10px] w-24"
              onClick={() =>
                equipmentToDelete && handleDelete(equipmentToDelete)
              }
            >
              <Button variant="outline" size="lg">
                {t("Delete")}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Grids>
  );
}
