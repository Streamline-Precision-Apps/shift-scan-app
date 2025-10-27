// "use client";
// import { Buttons } from "@/components/(reusable)/buttons";
// import { Contents } from "@/components/(reusable)/contents";
// import { Grids } from "@/components/(reusable)/grids";
// import { Holds } from "@/components/(reusable)/holds";
// import { Titles } from "@/components/(reusable)/titles";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import { addTestPdfDocuments } from "@/actions/formsAction";

// export default function Test() {
//   const router = useRouter();

//   async function handleAddTestData() {
//     const result = await addTestPdfDocuments();
//     if (result.success) {
//       alert(result.message);
//     } else {
//       alert(`Error: ${result.message}`);
//     }
//   }

//   return (
//     <Holds
//       background={"white"}
//       className="rounded-t-none row-span-9 h-full w-full pt-5"
//     >
//       <Contents width={"section"}>
//         <Holds className="h-full w-full">
//           <Grids rows={"9"} gap={"4"} className="h-full w-full">
//             <Buttons
//               onClick={() => {
//               handleAddTestData()
//             }}
//             >
//               <Titles size={"h4"}>Create Documents</Titles>
//             </Buttons>
//           </Grids>
//         </Holds>
//       </Contents>
//     </Holds>
//   );
// }
