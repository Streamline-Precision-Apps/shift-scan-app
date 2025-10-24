// components/Panel.tsx
"use client";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export type PanelData = {
  date: string;
  hours?: number;
  isPlaceholder?: boolean;
};

function isPlaceholderData(
  data: PanelData
): data is { date: string; isPlaceholder: true } {
  return data.isPlaceholder === true;
}

export default function Panel({
  data,
  isCenter,
  distanceFromCenter = 0, // new prop for distance
}: {
  data: PanelData;
  isCenter: boolean;
  /**
   * The number of panel positions away from the center (0=center, 1=adjacent, etc.)
   */
  distanceFromCenter?: number;
}) {
  if (isPlaceholderData(data)) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-w-[32%] snap-center">
        <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center text-xs text-gray-500 text-center px-1">
          {data.date}
        </div>
      </div>
    );
  }

  // Opacity based on distance from the focused (center) panel
  const maxDistance = 4; // fade out after 4 panels away
  const normalizedDistance = Math.min(
    Math.abs(distanceFromCenter),
    maxDistance
  );
  // No opacity change for center and adjacent panels
  const contentOpacity =
    normalizedDistance <= 1 ? 1 : 1 - 0.18 * normalizedDistance;
  const scale = isCenter ? 1 : 1 - 0.04 * normalizedDistance;

  // Bar color logic: orange for current date, green for others
  const isToday = data.date === new Date().toLocaleDateString("en-CA");

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={data.date}
        initial={{ x: 40, opacity: 0, scale: 1 }}
        animate={{ x: 0, opacity: 1, scale }}
        exit={{ x: -40, opacity: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.9 }}
        className="flex flex-col items-center justify-end h-full min-w-[36%] snap-center"
        style={{ willChange: "transform, opacity" }}
      >
        <motion.p
          layout
          initial={false}
          animate={{
            scale: isCenter ? 1.08 : 0.92,
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 28,
            mass: 0.9,
          }}
          className="text-xs font-medium text-center text-white mb-1"
          style={{ willChange: "transform" }}
        >
          {format(data.date || "", "EEE MMM d")}
        </motion.p>
        <motion.div
          layout
          animate={{
            backgroundColor: isCenter ? "#1E7D2C" : "#e5e7eb",
            borderRadius: isCenter ? "12px" : "8px",
            scale: isCenter ? 1 : 0.95,
            opacity: contentOpacity,
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 28,
            mass: 0.9,
          }}
          className="relative w-11/12 h-full p-4 flex items-end justify-center"
        >
          <motion.div
            initial={false}
            animate={{
              height: `${(Math.min(data.hours ?? 0, 12) / 12) * 100}%`,
              opacity: contentOpacity,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 28,
              mass: 0.9,
            }}
            className={`w-44 rounded-[10px] ${
              data.hours ? "border-[3px] border-black" : ""
            } ${
              isToday
                ? "bg-[#FF8800]"
                : isCenter
                ? "bg-green-500"
                : distanceFromCenter === 1 || distanceFromCenter === -1
                ? "bg-blue-500"
                : "bg-blue-500"
            }`}
          />
        </motion.div>
        <motion.p
          layout
          initial={false}
          animate={{
            scale: isCenter ? 1.15 : 0.85,
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 28,
            mass: 0.9,
          }}
          className="text-lg font-bold text-center text-white"
          style={{ willChange: "transform" }}
        >
          {Math.floor((data.hours ?? 0) * 10) / 10} hrs
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
