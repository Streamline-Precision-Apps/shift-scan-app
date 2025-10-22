import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "./components/SessionProvider";

export const metadata: Metadata = {
  title: "Shift Scan - Payroll Made Simple",
  description: "Revolutionize your workforce management and payroll with instant, secure, and verifiable timekeeping—powered by QR codes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
