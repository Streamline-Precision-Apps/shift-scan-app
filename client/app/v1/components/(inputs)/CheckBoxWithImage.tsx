"use client";

import { ChangeEvent } from "react";

export interface CheckboxWithImageProps {
  disabled?: boolean;
  defaultChecked?: boolean;
  id: string;
  name: string;
  label?: string;
  size?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const CheckBoxWithImage = ({
  disabled,
  defaultChecked = false,
  id,
  name,
  label,
  size = 4,
  onChange,
  type = "",
}: CheckboxWithImageProps) => (
  <div className="w-full flex flex-col items-center relative">
    {/* Hidden checkbox for controlling state */}
    <label
      htmlFor={id}
      className={`peer flex flex-col items-center cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      style={{
        width: `${size}em`,
        height: `${size}em`,
      }}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        className="hidden peer"
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
      />

      {/* Dynamic SVG wrapper */}
      <div
        className={`absolute inset-0 
          transition-all duration-300 rounded-md 
          bg-center bg-contain bg-no-repeat
          peer-has-input:checked:bg-app-green
          ${disabled ? "opacity-50" : ""}
        `}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 56 58"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            className="transition-colors duration-300 peer-has-input:checked:fill-yellow-500 peer-has-input:checked:stroke-black"
            d="M53.0746 14.7409L46.2629 24.5505C44.7186 26.7746 44.7819 29.7401 46.4199 31.8962L53.6445 41.4058C55.256 43.5271 53.2116 46.4713 50.661 45.7024L39.2266 42.2554C36.6341 41.4739 33.8333 42.4506 32.289 44.6746L25.4773 54.4842C23.9578 56.6724 20.526 55.6379 20.4691 52.9745L20.2139 41.0345C20.156 38.3275 18.3617 35.9656 15.7692 35.1841L4.33481 31.7371C1.78419 30.9682 1.70761 27.3847 4.22304 26.5075L15.4998 22.5752C18.0564 21.6836 19.7483 19.2472 19.6904 16.5401L19.4352 4.60017C19.3783 1.93679 22.7628 0.756574 24.3744 2.87784L31.5989 12.3875C33.2369 14.5435 36.0769 15.3996 38.6336 14.5081L49.9103 10.5758C52.4257 9.6986 54.594 12.5527 53.0746 14.7409Z"
            fill={!disabled && type === "selected" ? "yellow" : "none"}
            stroke={!disabled && type === "selected" ? "black" : "black"}
            strokeWidth="3.5"
          />
        </svg>
      </div>
    </label>

    {/* Optional label below the checkbox */}
    {label && (
      <span className="mt-2 text-center text-sm text-gray-700">{label}</span>
    )}
  </div>
);

export default CheckBoxWithImage;
