"use server";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
// import EmployeeTabs from "./_components/employee-tabs";
import TeamMemberLayout from "./_components_New/TeamMemeberLayout";
export default async function crewMember() {
  return (
    <Bases>
      <Contents>
        <TeamMemberLayout />
      </Contents>
    </Bases>
  );
}
