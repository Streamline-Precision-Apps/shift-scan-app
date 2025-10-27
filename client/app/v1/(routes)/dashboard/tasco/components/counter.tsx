import Spinner from "@/components/(animations)/spinner";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Titles } from "@/components/(reusable)/titles";
import React from "react";

type LoadCounterProps = {
  count: number;
  setCount: (count: number) => void;
  addAction?: () => void;
  removeAction?: () => void;
  allowRemove?: boolean;
  isLoading: boolean;
};

export default function Counter({
  count,
  setCount,
  allowRemove,
  isLoading,
}: LoadCounterProps) {
  const AddLoad = () => {
    const newCount = count + 1;
    setCount(newCount);
  };

  const RemoveLoad = () => {
    const newCount = count - 1;
    setCount(newCount);
  };

  return (
    <Holds
      className="w-[90%] justify-center h-full"
      background={"darkBlue"}
      position={"center"}
    >
      <Grids cols={"3"} gap={"5"} className="h-full w-full">
        <Holds>
          <Buttons
            background={`${
              count === 0 || count === undefined ? "darkGray" : "orange"
            }`}
            onClick={RemoveLoad}
            disabled={(count === 0 && !allowRemove) || isLoading}
            className={`p-2  border-[3px] border-black justify-center items-center rounded-[10px]`}
            size={"60"}
            shadow={"none"}
          >
            -
          </Buttons>
        </Holds>
        <Holds
          background={"white"}
          className="items-center justify-center border-2 border-black rounded-[10px] py-2"
        >
          {isLoading && count === 0 ? (
            <div className="h-full w-full p-1">
              <Spinner size={24} />
            </div>
          ) : (
            <Titles> {count}</Titles>
          )}
        </Holds>
        <Holds>
          <Buttons
            onClick={AddLoad}
            background={"green"}
            size={"60"}
            shadow={"none"}
            disabled={isLoading}
            className="p-2  border-[3px] border-black justify-center items-center rounded-[10px]"
          >
            <Images
              titleImg="/plus.svg"
              titleImgAlt="Add Icon"
              className="mx-auto"
            />
          </Buttons>
        </Holds>
      </Grids>
    </Holds>
  );
}
