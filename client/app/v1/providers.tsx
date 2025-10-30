// wrapper to provide global context provider in the future
"use client";
import { SessionProvider } from "../lib/context/sessionContext";
import { PermissionsProvider } from "../lib/context/permissionContext";
import { CommentDataProvider } from "../lib/context/CommentContext";
import { EquipmentIdProvider } from "../lib/context/operatorContext";
import { ScanDataEQProvider } from "../lib/context/equipmentContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CommentDataProvider>
        <EquipmentIdProvider>
          <ScanDataEQProvider>
            <PermissionsProvider>{children}</PermissionsProvider>
          </ScanDataEQProvider>
        </EquipmentIdProvider>
      </CommentDataProvider>
    </SessionProvider>
  );
}

export default AppProviders;
