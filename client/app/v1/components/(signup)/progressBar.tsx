import React, { useEffect, useRef, useState } from "react";

interface ProgressBarProps {
  /**
   * The current step (1-based index).
   */
  currentStep: number;
  /**
   * The total number of steps.
   */
  totalSteps: number;
  /**
   * If true, animates the progress bar growth when currentStep changes.
   */
  progressAnimated?: boolean;
}

/**
 * ProgressBar displays a horizontal progress bar with evenly spaced circle nodes for each step.
 * The current step is highlighted.
 */
export const ProgressBar = ({
  currentStep,
  totalSteps,
  progressAnimated = false,
}: ProgressBarProps) => {
  // Clamp currentStep between 1 and totalSteps
  const safeStep = Math.max(1, Math.min(currentStep, totalSteps));
  const [progress, setProgress] = useState(progressAnimated ? 0 : safeStep - 1);
  const prevStep = useRef(safeStep);

  useEffect(() => {
    if (progressAnimated) {
      // Animate to new progress
      setTimeout(() => setProgress(safeStep - 1), 50);
    } else {
      setProgress(safeStep - 1);
    }
    prevStep.current = safeStep;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeStep, progressAnimated]);

  return (
    <div className="py-1 flex flex-col items-center w-full">
      <div className="relative flex w-full max-w-xl items-center justify-between">
        {/* Gray base line */}
        <div
          className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 z-0"
          style={{ transform: "translateY(-50%)" }}
        />
        {/* Green progress line overlays gray line up to last completed node */}
        {safeStep > 1 && (
          <div
            className="absolute top-1/2 h-1 bg-[#1E7D2C] z-10 transition-all duration-500"
            style={{
              left: 0,
              width:
                safeStep === totalSteps
                  ? "100%"
                  : totalSteps > 1
                    ? `calc(${(progress / (totalSteps - 1)) * 100}% )`
                    : "0%",
              transform: "translateY(-50%)",
              right: "auto",
            }}
          />
        )}
        {/* Step nodes */}
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === safeStep;
          const isCompleted = stepNum < safeStep;
          const isLast = stepNum === totalSteps;
          const isFinalChecked = isLast && safeStep === totalSteps;
          return (
            <div
              key={stepNum}
              className="flex flex-col items-center z-20"
              style={{ minWidth: 0 }}
            >
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors duration-200 ${
                  isFinalChecked
                    ? "bg-[#1E7D2C] border-green-600 text-white"
                    : isActive
                      ? "bg-white border-green-600 text-green-600"
                      : isCompleted
                        ? "bg-[#1E7D2C] border-green-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {isFinalChecked ? (
                  <img
                    src="/tinyCheckMark-white.svg"
                    alt="Approved"
                    className="w-2 h-2"
                    style={{ display: "block" }}
                  />
                ) : isActive ? (
                  <p className="text-xs font-semibold text-green-600">
                    {stepNum}
                  </p>
                ) : isCompleted ? (
                  <img
                    src="/tinyCheckMark-white.svg"
                    alt="Approved"
                    className="w-2 h-2"
                    style={{ display: "block" }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
