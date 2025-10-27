import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";

interface SearchBarProps {
  term: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled?: boolean;
  children?: React.ReactNode;
  textSize?: "xs" | "sm" | "md" | "lg" | "xl";
  imageSize?: "2" | "4" | "6" | "8" | "10" | "12" | "14" | "16";
}

const SearchBar: React.FC<SearchBarProps> = ({
  term,
  handleSearchChange,
  placeholder,
  disabled = false,
  children = null,
  textSize = "sm",
  imageSize = "8",
}) => {
  return (
    <Holds
      background={disabled ? "lightGray" : "white"}
      position="row"
      className="px-2 w-full h-full gap-x-3 relative"
    >
      <Holds className={`w-${imageSize} h-full justify-center items-center`}>
        <img src="/searchLeft.svg" alt="search" />
      </Holds>
      <Holds className="w-full h-auto justify-center items-center ">
        <Inputs
          type="search"
          placeholder={placeholder}
          value={term}
          onChange={handleSearchChange}
          disabled={disabled}
          className={`border-none outline-hidden text-${textSize} text-left w-full h-full rounded-md bg-white focus:ring-0 focus:border-none focus:outline-none`}
        />
      </Holds>
      {children}
    </Holds>
  );
};

export default SearchBar;
