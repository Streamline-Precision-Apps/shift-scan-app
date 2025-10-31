// wrapper to provide global context provider in the future
"use client";
import { SessionProvider } from "../lib/context/sessionContext";
import { PermissionsProvider } from "../lib/context/permissionContext";
import { CommentDataProvider } from "../lib/context/CommentContext";
import { EquipmentIdProvider } from "../lib/context/operatorContext";
import { ScanDataEQProvider } from "../lib/context/equipmentContext";
import { TimeSheetDataProvider } from "../lib/context/TimeSheetIdContext";
import { CurrentViewProvider } from "../lib/context/CurrentViewContext";
import { NotificationProvider } from "../lib/context/NotificationContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CommentDataProvider>
        <EquipmentIdProvider>
          <ScanDataEQProvider>
            <TimeSheetDataProvider>
              <CurrentViewProvider>
                <NotificationProvider>
                  <PermissionsProvider>{children}</PermissionsProvider>
                </NotificationProvider>
              </CurrentViewProvider>
            </TimeSheetDataProvider>
          </ScanDataEQProvider>
        </EquipmentIdProvider>
      </CommentDataProvider>
    </SessionProvider>
  );
}

export default AppProviders;
