// wrapper to provide global context provider in the future
"use client";
import { SessionProvider } from "../lib/context/sessionContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default AppProviders;
