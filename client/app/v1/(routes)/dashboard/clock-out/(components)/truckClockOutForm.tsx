"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Forms } from "@/components/(reusable)/forms";
import { Inputs } from "@/components/(reusable)/inputs";
import { Holds } from "@/components/(reusable)/holds";
import { Selects } from "@/components/(reusable)/selects";
import { Titles } from "@/components/(reusable)/titles";
import { ChangeEvent, useState } from "react";
import React from "react";
import { Grids } from "@/components/(reusable)/grids";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { useTruckScanData } from "@/app/context/TruckScanDataContext";
import { Texts } from "@/components/(reusable)/texts";
// import { useTranslations } from "next-intl";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { CheckBox } from "@/components/(inputs)/checkBox";
import { useStartingMileage } from "@/app/context/StartingMileageContext";
import { useTimeSheetComments } from "@/app/context/TimeSheetCommentsContext";
import { Images } from "@/components/(reusable)/images";

// Props type for the form component
type TruckClockOutFormProps = {
  handleNextStep: () => void;
  jobsiteId: string;
  costCode: string;
  endingMileage: number;
  setEndingMileage: React.Dispatch<React.SetStateAction<number>>;
  leftIdaho: boolean;
  setLeftIdaho: React.Dispatch<React.SetStateAction<boolean>>;
  refuelingGallons: number;
  setRefuelingGallons: React.Dispatch<React.SetStateAction<number>>;
  materialsHauled: string;
  setMaterialsHauled: React.Dispatch<React.SetStateAction<string>>;
  hauledLoadsQuantity: number;
  setHauledLoadsQuantity: React.Dispatch<React.SetStateAction<number>>;
};

// Zod schema for validation
const formSchema = z.object({
  startingMileage: z
    .number()
    .nonnegative("Starting mileage must be non-negative")
    .optional(),
  endingMileage: z.number().nonnegative("Ending mileage must be non-negative"),
  materialHauled: z.string().optional(),
  hauledLoadsQuantity: z
    .number()
    .int("Loads quantity must be an integer")
    .nonnegative("Loads quantity must not be negative")
    .optional(),
  refuelingGallons: z
    .number()
    .nonnegative("Refueling gallons must be non-negative")
    .optional(),
  leftIdaho: z.boolean(),
});

export default function TruckClockOutForm({
  handleNextStep,
  jobsiteId,
  costCode,
  endingMileage,
  setEndingMileage,
  leftIdaho,
  setLeftIdaho,
  refuelingGallons,
  setRefuelingGallons,
  materialsHauled,
  setMaterialsHauled,
  hauledLoadsQuantity,
  setHauledLoadsQuantity,
}: TruckClockOutFormProps) {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const { truckScanData } = useTruckScanData();
  const { data: session } = useSession();
  // const t = useTranslations("ClockOut");
  const [checkedRefuel, setCheckedRefuel] = useState(false);
  const { startingMileage } = useStartingMileage();
  const { timeSheetComments, setTimeSheetComments } = useTimeSheetComments();

  // Derived state to enable/disable the Submit button
  const isSubmitEnabled = endingMileage > 0; // Ensure mileage is a positive number

  // Form validation and submission
  const handleValidationAndSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      endingMileage,
      jobsiteId,
      costCode,
      timeSheetComments: timeSheetComments,
      materialsHauled,
      hauledLoadsQuantity,
      refuelingGallons,
      leftIdaho,
    };

    const result = formSchema.safeParse(formData);

    if (result.success) {
      setErrorMessages([]);
      handleNextStep();
    } else {
      const errors = result.error.issues.map((issue) => issue.message);
      setErrorMessages(errors);
    }
  };

  if (!session) return null;

  const handleCheckboxRefuelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCheckedRefuel(event.currentTarget.checked);
  };

  const handleCheckboxLeftIdahoChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setLeftIdaho(event.currentTarget.checked);
  };

  return (
    <>
      <Holds background="white" className="row-span-1 h-full">
        <Contents width="section">
          <TitleBoxes onClick={() => {}}>
            <Holds position={"row"}>
              <Texts>Clock Out</Texts>
              <Images
                titleImg="/endDay.svg"
                titleImgAlt="Clock Out"
                className="w-8 h-8"
              />
            </Holds>
          </TitleBoxes>
        </Contents>
      </Holds>
      <Forms onSubmit={handleValidationAndSubmit}>
        <Holds background="white" className="mb-3">
          <Contents width="section">
            <Grids className="grid-rows-7">
              {/* Input fields */}
              <Holds className="row-span-1 h-full my-auto">
                <Texts position="left" size="p3">
                  Truck ID
                </Texts>
                <Inputs
                  type="disabled"
                  name="vehicleId"
                  value={truckScanData?.toString() || ""}
                  readOnly
                />
              </Holds>
              <Holds className="row-span-1 h-full my-auto">
                <Texts position="left" size="p3">
                  Comments
                </Texts>
                <Inputs
                  type="textarea"
                  name="timeSheetComments"
                  value={timeSheetComments ?? ""}
                  onChange={(e) => setTimeSheetComments(e.target.value)}
                />
              </Holds>
              <Holds className="row-span-1 h-full my-auto">
                <Texts position="left" size="p3">
                  Starting Mileage
                </Texts>
                <Inputs type="number" value={startingMileage ?? 0} readOnly />
              </Holds>
              <Holds className="row-span-1 h-full my-auto">
                <Texts position="left" size="p3">
                  Ending Mileage
                </Texts>
                <Inputs
                  type="number"
                  name="endingMileage"
                  value={endingMileage}
                  onChange={(e) => setEndingMileage(Number(e.target.value))}
                  required
                />
              </Holds>
              <Holds className="row-span-1 h-full my-auto">
                <Texts position="left" size="p3">
                  Material Hauled
                </Texts>
                <Selects
                  value={materialsHauled}
                  onChange={(e) => setMaterialsHauled(e.target.value)}
                >
                  <option value="">None</option>
                  <option value="Material1">Material 1</option>
                  <option value="Material2">Material 2</option>
                </Selects>
              </Holds>
              {materialsHauled && (
                <Holds className="row-span-1 h-full my-auto">
                  <Texts position="left" size="p3">
                    Hauled Loads Quantity
                  </Texts>
                  <Inputs
                    type="number"
                    name="hauledLoadsQuantity"
                    value={hauledLoadsQuantity}
                    onChange={(e) =>
                      setHauledLoadsQuantity(Number(e.target.value))
                    }
                  />
                </Holds>
              )}
              {/* //TODO: Discuss if the equipment haulded is needed and what extra steps we would need for it. */}
              <Holds className="row-span-1 h-full my-auto">
                <Texts position="left" size="p3">
                  Did you refuel?
                </Texts>
                <CheckBox
                  id="refuelCheck"
                  name="refuelCheck"
                  onChange={handleCheckboxRefuelChange}
                  checked={checkedRefuel}
                />
              </Holds>
              {checkedRefuel && (
                <Holds className="row-span-1 h-full my-auto">
                  <Texts position="left" size="p3">
                    Total Gallons Refueled
                  </Texts>
                  <Inputs
                    type="number"
                    value={refuelingGallons}
                    onChange={(e) =>
                      setRefuelingGallons(Number(e.target.value))
                    }
                  />
                </Holds>
              )}
              {/* //TODO: Ask if this (mileage at fueling) should be added to the DB. */}
              <Holds className="row-span-1 h-full my-auto">
                <Texts position="left" size="p3">
                  Did you leave Idaho?
                </Texts>
                <CheckBox
                  id="leftIdaho"
                  name="leftIdaho"
                  onChange={handleCheckboxLeftIdahoChange}
                  checked={leftIdaho}
                />
              </Holds>

              {/* <Labels>Equipment Hauled</Labels>
              {equipmentHauled.map((eq, index) => (
                <div key={index} className="flex items-center">
                  <Inputs
                    value={eq}
                    onChange={(e) =>
                      setEquipmentHauled(
                        equipmentHauled.map((item, i) =>
                          i === index ? e.target.value : item
                        )
                      )
                    }
                  />
                  <Buttons type="button" onClick={() => handleRemoveEquipment(index)}>
                    Remove
                  </Buttons>
                </div>
              ))}
              <Buttons type="button" onClick={handleAddEquipment}>
                Add Equipment
              </Buttons> */}

              {/* // TODO: Ask about net weight and bill of Landing */}

              {/* Error Messages */}
              {errorMessages.length > 0 && (
                <Holds>
                  {errorMessages.map((message, index) => (
                    <p key={index} className="text-red-500">
                      {message}
                    </p>
                  ))}
                </Holds>
              )}

              {/* Submit Button */}
              <Holds className="row-span-1">
                <Buttons
                  type="submit"
                  background="green"
                  disabled={!isSubmitEnabled} // Disable the button if invalid
                >
                  <Titles size="h2">Submit</Titles>
                </Buttons>
              </Holds>
            </Grids>
          </Contents>
        </Holds>
      </Forms>
    </>
  );
}
