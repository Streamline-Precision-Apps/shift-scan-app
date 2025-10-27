"use client";

import { CircleAlert } from "lucide-react";

interface ValidationErrorMessageProps {
  message: string;
}

export const ValidationErrorMessage: React.FC<ValidationErrorMessageProps> = ({
  message,
}) => {
  return (
    <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <CircleAlert className="w-3 h-3" />
      <p>{message}</p>
    </div>
  );
};