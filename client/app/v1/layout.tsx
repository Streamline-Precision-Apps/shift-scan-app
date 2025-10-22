"use client";

import { ReactNode } from "react";

export default function MobileAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile-optimized layout */}
      <div className=" bg-white dark:bg-gray-800 min-h-screen shadow-lg">
        {children}
      </div>
    </div>
  );
}
