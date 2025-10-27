// wrapper to provide global context provider in the future
"use client";
import { SessionProvider } from "../lib/context/sessionContext";
import { PermissionsProvider } from "../lib/context/permissionContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PermissionsProvider>{children}</PermissionsProvider>
    </SessionProvider>
  );
}

export default AppProviders;
