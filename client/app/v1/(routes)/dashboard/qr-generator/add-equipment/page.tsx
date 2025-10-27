"use server";
import "@/app/globals.css";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import AddEquipmentForm from "./addEquipmentForm";

export default async function NewEquipment() {
  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"}>
          <AddEquipmentForm />
        </Grids>
      </Contents>
    </Bases>
  );
}
