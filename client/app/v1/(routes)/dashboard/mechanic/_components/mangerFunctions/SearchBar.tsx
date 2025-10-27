import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
import { Dispatch, SetStateAction, RefObject } from "react";

export function SearchBar({
  searchTerm,
  setSearchTerm,
  inputRef,
}: {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <Holds
      position="row"
      className="row-start-1 row-end-2 h-full w-full border-b-[3px] border-b-black"
    >
      <Holds
        size="20"
        className="mr-4"
        onClick={() => inputRef.current?.focus()}
      >
        <Images titleImg="/searchLeft.svg" titleImgAlt="search" size="50" />
      </Holds>
      <Holds size="60">
        <input
          ref={inputRef}
          type="text"
          className="border-none focus:outline-hidden"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search projects..."
        />
      </Holds>
      {searchTerm && (
        <Holds size="20" onClick={() => setSearchTerm("")}>
          <Texts size="p1">X</Texts>
        </Holds>
      )}
    </Holds>
  );
}
