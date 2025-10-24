"use client";
import "@/app/globals.css";
import React from "react";

type PasswordStrengthIndicatorProps = {
  password: string;
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const getStrength = () => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/;

    let strength = 0;

    if (password.length >= minLength) strength += 1;
    if (hasNumber.test(password)) strength += 1;
    if (hasSymbol.test(password)) strength += 1;

    return strength;
  };

  const strength = getStrength();

  const getStrengthLabel = () => {
    switch (strength) {
      case 0:
        return "Too Weak";
      case 1:
        return "Weak";
      case 2:
        return "Medium";
      case 3:
        return "Strong";
      default:
        return "";
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 0:
        return "bg-app-red";
      case 1:
        return "bg-app-orange";
      case 2:
        return "bg-app-yellow";
      case 3:
        return "bg-app-green";
      default:
        return "bg-app-gray";
    }
  };

  const getStrengthLabelColor = () => {
    switch (strength) {
      case 0:
        return "text-app-red";
      case 1:
        return "text-app-orange";
      case 2:
        return "text-app-yellow";
      case 3:
        return "text-app-green";
      default:
        return "text-gray-300";
    }
  };

  const getStrengthWidthClass = () => {
    switch (strength) {
      case 0:
        return "w-1/12";
      case 1:
        return "w-1/5";
      case 2:
        return "w-1/2";
      case 3:
        return "w-full";
      default:
        return "w-0";
    }
  };

  return (
    <div>
      <div
        className={`h-2 mt-2 rounded-sm ${getStrengthColor()} ${getStrengthWidthClass()}`}
      ></div>
      <p className={`text-xs ${getStrengthLabelColor()}  mt-1`}>
        {getStrengthLabel()}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
