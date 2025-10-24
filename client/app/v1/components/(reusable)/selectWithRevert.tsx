import Image from "next/image";
import React, { useState } from "react";

interface SelectWithRevertProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const SelectWithRevert: React.FC<SelectWithRevertProps> = ({
  options,
  value,
  onChange,
}) => {
  const [hasChanged, setHasChanged] = useState(false);

  const handleRevert = () => {
    setHasChanged(false);
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <select
      className="w-full rounded-[10px] border-[3px] border-black focus:outline-hidden p-2"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SelectWithRevert;
