"use client";

import React from "react";
import { usePermissions } from "@/app/context/PermissionsContext";

export function PermissionsBadge() {
  const { permissions, initialized } = usePermissions();

  if (!initialized) return null;

  const missingPermissions = !permissions.camera || !permissions.location;

  if (!missingPermissions) return null;

  return (
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full">
      <span className="sr-only">Missing permissions</span>
    </div>
  );
}
