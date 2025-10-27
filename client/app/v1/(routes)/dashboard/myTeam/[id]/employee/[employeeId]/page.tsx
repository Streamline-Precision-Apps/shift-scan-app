"use server";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
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
