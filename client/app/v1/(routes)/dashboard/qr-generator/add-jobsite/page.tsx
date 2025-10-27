"use server";
import "@/app/globals.css";

import { Contents } from "@/components/(reusable)/contents";
import { Bases } from "@/components/(reusable)/bases";
import { Grids } from "@/components/(reusable)/grids";
import AddJobsiteForm from "./addJobsiteForm";

export default async function NewJobsite() {
  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"}>
          <AddJobsiteForm />
        </Grids>
      </Contents>
    </Bases>
  );
}
