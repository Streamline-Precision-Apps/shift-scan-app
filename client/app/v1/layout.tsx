"use client";
import "../globals.css";
import { AppProviders } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-auto bg-linear-to-b from-app-dark-blue to-app-blue">
      <AppProviders>{children}</AppProviders>
    </main>
  );
}
