import Image from "next/image";
import React, { useState } from "react";
import { Labels } from "./labels";
import { TextAreas } from "./textareas";

interface TextInputWithRevertProps {
  label: string;
  size?: "small" | "medium" | "large";
  value: string;
  onChange: (value: string) => void;
  showAsterisk?: boolean;
  defaultValue: string;
  type?: string;
  maxLength?: number; // Character limit
}

const sizeClasses = {
  small: "h-8 text-sm",
  medium: "h-10 text-base",
  large: "h-12 text-lg",
};

const TextInputWithRevert: React.FC<TextInputWithRevertProps> = ({
  label,
  size = "medium",
  value,
  onChange,
  showAsterisk = false,
  defaultValue,
  type = "default",
  maxLength = 40, // Default character limit
}) => {
  const [hasChanged, setHasChanged] = useState(false);

  const handleRevert = () => {
    onChange(defaultValue);
    setHasChanged(false);
  };

  const handleChange = (newValue: string) => {
    setHasChanged(newValue !== defaultValue);
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  if (type === "full") {
    return (
      <div className="w-full h-full px-2 relative">
        {/* Label */}
        <Labels className="w-full text-xl flex items-center">
          {label}
          {showAsterisk && <span className="text-red-500 ml-1">*</span>}
        </Labels>

        {/* Textarea Container */}
        <div className="relative">
          <div
            className={`flex items-center h-full gap-2 w-full border-[3px] rounded-[10px] border-black ${sizeClasses[size]}`}
          >
            <input
              type="text"
              className="w-full p-2 border-[3px] rounded-[10px] border-none"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
            />
            {/* Revert Button */}
            {hasChanged && (
              <button
                className="w-1/6 flex justify-center items-center"
                title="Revert changes"
                onClick={handleRevert}
              >
                <Image
                  src="/arrowBack.svg"
                  alt="revert"
                  className="w-5 h-5"
                  width="4"
                  height="4"
                />
              </button>
            )}

            {/* Character Counter */}
          </div>
          <div className="absolute bottom-1 right-2 text-xs text-gray-500">
            {value.length}/{maxLength}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full h-full px-2">
        <div className="flex items-center gap-4">
          {/* Label */}
          <label className="w-1/2 text-xl flex items-center">
            {label}
            {showAsterisk && <span className="text-red-500 ml-1">*</span>}
          </label>

          {/* Input */}
          <div
            className={`flex items-center gap-2 w-1/2 border-[3px] rounded-[10px] border-black ${sizeClasses[size]}`}
          >
            <input
              type="text"
              className="h-full w-full border-none focus:outline-hidden px-2"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
            />
            {hasChanged && (
              <button
                className="w-1/6 flex justify-center items-center"
                title="Revert changes"
                onClick={handleRevert}
              >
                <Image src="/arrowBack.svg" alt="revert" className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default TextInputWithRevert;
