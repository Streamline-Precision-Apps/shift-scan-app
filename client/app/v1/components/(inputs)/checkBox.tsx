"use client";

import { ChangeEvent } from "react";

export interface CheckboxProps {
  disabled?: boolean;
  checked?: boolean;
  id: string;
  name: string;
  label?: string;
  size?: number;
  width?: number;
  height?: number;
  shadow?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const CheckBox = ({
  disabled,
  checked = false,
  shadow = true,
  id,
  name,
  label,
  size = 4,
  width,
  height,
  onChange,
}: CheckboxProps) => {
  // Calculate dimensions - either use explicit width/height or calculate from size
  const dimensions = {
    width: width ? `${width}px` : `${size}em`,
    height: height ? `${height}px` : `${size}em`,
  };

  return (
    <div className="w-full flex items-center">
      <input
        className={`
        peer relative appearance-none shrink-0 border-[3px] border-black  
         ${shadow ? "shadow-[8px_8px_0px_grey]" : ""}
        focus:outline-hidden focus:ring-offset-0 focus:ring-1
        checked:bg-app-green checked:border-[3px] rounded-[10px]
        disabled:border-steel-400 disabled:bg-steel-400
        `}
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{ width: dimensions.width, height: dimensions.height }}
      />
      <svg
        className="absolute pointer-events-none hidden peer-checked:block stroke-black  outline-hidden animate-wave"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          padding: "4px", // Add padding to make checkmark smaller relative to container
        }}
      >
        <polyline points="26 10 13 23 6 16"></polyline>
      </svg>
      {label && (
        <label htmlFor={id} className="ml-4 text-m flex items-center h-full">
          {label}
        </label>
      )}
    </div>
  );
};
