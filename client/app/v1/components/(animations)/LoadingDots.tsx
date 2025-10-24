import React from "react";

export default function LoadingDots({
  className = "",
  style = {},
  color = "#333",
  size = 24,
  speed = 400,
}: {
  className?: string;
  style?: React.CSSProperties;
  color?: string;
  size?: number;
  speed?: number; // ms per frame
}) {
  const dotStyle = (delay: number) => ({
    animation: `fade ${speed * 3}ms infinite`,
    animationDelay: `${delay}ms`,
    fontSize: size,
    color,
    fontFamily: "monospace",
    marginRight: 2,
  });

  return (
    <span
      className={className}
      style={{ display: "inline-flex", ...style }}
      aria-label="Loading"
    >
      <span style={dotStyle(0)}>.</span>
      <span style={dotStyle(speed)}>.</span>
      <span style={dotStyle(speed * 2)}>.</span>

      <style jsx>{`
        @keyframes fade {
          0% {
            opacity: 0.2;
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0.2;
          }
        }
      `}</style>
    </span>
  );
}
