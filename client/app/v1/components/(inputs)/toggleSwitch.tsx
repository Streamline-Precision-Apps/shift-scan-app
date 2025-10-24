"use client";
import React, { useState, useEffect } from "react";

const LocaleToggleSwitch = ({
  data,
  onChange,
}: {
  data: boolean;
  onChange: (value: boolean) => void;
}) => {
  const [isSelected, setIsSelected] = useState(data);

  useEffect(() => {
    setIsSelected(data); // Update the local state when props change
  }, [data]);

  const handleClick = () => {
    const newValue = !isSelected;
    setIsSelected(newValue);
    onChange(newValue);
  };

  return (
    <div
      onClick={handleClick}
      className="flex w-20 h-10 cursor-pointer bg-blue-900 border-black border-[3px] justify-center items-center rounded-[10px] self-end"
    >
      <span
        className={
          `w-8 h-8 rounded-[10px] border-black border-[3px] transition-all duration-500 ` +
          (isSelected ? "ml-10 bg-app-green" : "mr-10 bg-app-red")
        }
      />
    </div>
  );
};

export default LocaleToggleSwitch;
